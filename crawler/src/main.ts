import { CheerioCrawler, RequestQueue, SessionPool } from 'crawlee';
import { randomUUID } from 'crypto';
import { isInternalUrl } from './utils/urlHelpers.js';
import { handlePageMetrics, PageCrawlResult } from './handlers/pageHandler.js';
import { savePageResult } from './storage/resultStorage.js';
import { shouldUsePlaywrightFallback, crawlWithPlaywright } from './fetchers/playwrightFallback.js';

interface CrawlerOptions {
    startUrl: string;
    maxDepth?: number;
    maxPages?: number;
    crawlId?: string;
}

interface CrawlResult {
    url: string;
    title?: string;
    depth: number;
    metrics: PageCrawlResult;
    usedPlaywright?: boolean;
}

export async function runSiteCrawler(options: CrawlerOptions): Promise<CrawlResult[]> {
    const { startUrl, maxDepth = 2, maxPages = 50, crawlId = randomUUID() } = options;
    
    const results: CrawlResult[] = [];
    
    // Create a request queue
    const requestQueue = await RequestQueue.open();
    
    // Add the initial URL with depth tracking
    await requestQueue.addRequest({
        url: startUrl,
        userData: { depth: 0 },
    });
    
    // Create session pool for robots.txt support
    const sessionPool = await SessionPool.open();
    
    // Create the CheerioCrawler
    const crawler = new CheerioCrawler({
        requestQueue,
        sessionPool,
        maxRequestsPerCrawl: maxPages,
        
        // Enable robots.txt support
        useSessionPool: true,
        persistCookiesPerSession: true,
        
        async requestHandler(context) {
            const { request, $ } = context;
            const startTime = Date.now();
            
            const currentDepth = request.userData.depth as number;
            
            // Extract page title
            const title = $('title').text().trim();
            
            // Collect page metrics
            let metrics = await handlePageMetrics(context, startTime);
            let usedPlaywright = false;
            
            // Check if we need Playwright fallback for JS-heavy pages
            if (shouldUsePlaywrightFallback(metrics.htmlSize, metrics.statusCode)) {
                console.log(`Retrying ${request.url} with Playwright (HTML too small: ${metrics.htmlSize} bytes)`);
                
                const playwrightResult = await crawlWithPlaywright(request.url);
                
                if (playwrightResult) {
                    metrics = playwrightResult;
                    usedPlaywright = true;
                    console.log(`Playwright retry successful, new HTML size: ${metrics.htmlSize} bytes`);
                }
            }
            
            // Save to storage
            await savePageResult(metrics, crawlId);
            
            // Store the result
            const result: CrawlResult = {
                url: request.url,
                title: title || undefined,
                depth: currentDepth,
                metrics,
            };
            
            if (usedPlaywright) {
                result.usedPlaywright = true;
            }
            
            results.push(result);
            
            // Only enqueue more links if we haven't reached max depth
            if (currentDepth < maxDepth) {
                await context.enqueueLinks({
                    userData: { depth: currentDepth + 1 },
                    transformRequestFunction: (req) => {
                        // Only crawl internal URLs using the utility function
                        if (!isInternalUrl(req.url, startUrl)) {
                            return false;
                        }
                        
                        return req;
                    },
                });
            }
        },
        
        failedRequestHandler({ request }) {
            console.error(`Request ${request.url} failed`);
        },
    });
    
    // Run the crawler
    await crawler.run();
    
    console.log(`Crawl completed. CrawlId: ${crawlId}`);
    console.log(`Total pages crawled: ${results.length}`);
    console.log(`Pages using Playwright fallback: ${results.filter(r => r.usedPlaywright).length}`);
    
    return results;
}
