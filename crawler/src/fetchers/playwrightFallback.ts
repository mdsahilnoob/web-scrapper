import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { PageCrawlResult } from '../handlers/pageHandler.js';

/**
 * Threshold for detecting empty or very small HTML (in bytes).
 * Pages with HTML smaller than this may need JavaScript rendering.
 */
const MIN_HTML_SIZE = 500;

/**
 * Checks if a page might need JavaScript rendering.
 * 
 * @param htmlSize - Size of the HTML in bytes
 * @param statusCode - HTTP status code
 * @returns true if the page should be retried with Playwright
 */
export function shouldUsePlaywrightFallback(htmlSize: number, statusCode: number): boolean {
    // Only retry successful requests with very small HTML
    if (statusCode >= 200 && statusCode < 300 && htmlSize < MIN_HTML_SIZE) {
        return true;
    }
    
    return false;
}

/**
 * Re-crawls a URL using PlaywrightCrawler for JavaScript rendering.
 * Extracts the same metrics as CheerioCrawler.
 * 
 * @param url - The URL to crawl
 * @returns PageCrawlResult with metrics from Playwright
 */
export async function crawlWithPlaywright(url: string): Promise<PageCrawlResult | null> {
    try {
        const startTime = Date.now();
        let result: PageCrawlResult | null = null;

        // Create a temporary request queue for this single request
        const requestQueue = await RequestQueue.open();
        await requestQueue.addRequest({ url });

        const crawler = new PlaywrightCrawler({
            requestQueue,
            maxRequestsPerCrawl: 1,

            async requestHandler({ request, response, page }) {
                // Wait for network to be idle
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
                    console.log('Network idle timeout, continuing anyway');
                });

                // Get the rendered HTML
                const html = await page.content();
                const htmlSize = Buffer.byteLength(html, 'utf8');
                
                // Calculate load time
                const loadTime = Date.now() - startTime;
                
                // Get status code
                const statusCode = response?.status() || 0;
                
                // Create timestamp
                const crawledTimestamp = new Date().toISOString();
                
                // Check indexability from rendered HTML
                const robotsMeta = await page.$eval(
                    'meta[name="robots"]',
                    (el) => el.getAttribute('content') || ''
                ).catch(() => '');
                
                const indexable = !robotsMeta.toLowerCase().includes('noindex');

                result = {
                    url: request.url,
                    statusCode,
                    htmlSize,
                    loadTime,
                    crawledTimestamp,
                    indexable,
                };
            },

            failedRequestHandler({ request }) {
                console.error(`Playwright fallback failed for ${request.url}`);
            },
        });

        // Run the crawler
        await crawler.run();

        return result;
    } catch (error) {
        console.error(`Error in Playwright fallback for ${url}:`, error);
        return null;
    }
}
