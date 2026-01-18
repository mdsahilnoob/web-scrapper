import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { PageCrawlResult } from '../handlers/pageHandler.js';
import { extractPageSpeed } from './page-speed.fetcher.js';
import { PageSpeedMetrics } from '../types/speed.js';
import { shouldMeasureSpeed, incrementSpeedMeasurementCount } from '../config/speed-limits.js';

const MIN_HTML_SIZE = 500;

export function shouldUsePlaywrightFallback(htmlSize: number, statusCode: number): boolean {
    if (statusCode >= 200 && statusCode < 300 && htmlSize < MIN_HTML_SIZE) {
        return true;
    }
    return false;
}

export async function crawlWithPlaywright(url: string): Promise<PageCrawlResult | null> {
    try {
        const startTime = Date.now();
        let result: PageCrawlResult | null = null;

        const requestQueue = await RequestQueue.open();
        await requestQueue.addRequest({ url });

        const crawler = new PlaywrightCrawler({
            requestQueue,
            maxRequestsPerCrawl: 1,

            async requestHandler({ request, response, page }) {
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
                    console.log('Network idle timeout, continuing anyway');
                });

                const html = await page.content();
                const htmlSize = Buffer.byteLength(html, 'utf8');
                const loadTime = Date.now() - startTime;
                const statusCode = response?.status() || 0;
                const crawledTimestamp = new Date().toISOString();
                
                const robotsMeta = await page.$eval(
                    'meta[name="robots"]',
                    (el) => el.getAttribute('content') || ''
                ).catch(() => '');
                
                const indexable = !robotsMeta.toLowerCase().includes('noindex');
                
                // Extract page speed metrics (with limits)
                let speedMetrics: PageSpeedMetrics | undefined;
                if (shouldMeasureSpeed()) {
                    try {
                        speedMetrics = await extractPageSpeed(page, response);
                        incrementSpeedMeasurementCount();
                    } catch (error) {
                        console.warn(`Failed to extract speed metrics for ${request.url}:`, error);
                    }
                }

                result = {
                    url: request.url,
                    statusCode,
                    htmlSize,
                    loadTime,
                    crawledTimestamp,
                    indexable,
                    speedMetrics,
                };
            },

            failedRequestHandler({ request }) {
                console.error(`Playwright fallback failed for ${request.url}`);
            },
        });

        await crawler.run();
        return result;
    } catch (error) {
        console.error(`Error in Playwright fallback for ${url}:`, error);
        return null;
    }
}
