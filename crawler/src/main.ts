import { CheerioCrawler, RequestQueue } from 'crawlee';
import { randomUUID } from 'crypto';
import { isInternalUrl } from './utils/urlHelpers.js';
import { handlePageMetrics, PageCrawlResult } from './handlers/pageHandler.js';
import { shouldUsePlaywrightFallback, crawlWithPlaywright } from './fetchers/playwrightFallback.js';
import { CrawlerOptions, CrawlResultItem, PageMetrics } from '../../shared/types.js';
import { resetSpeedMeasurementCount, setSpeedConfig } from './config/speed-limits.js';

export async function runSiteCrawler(
    options: CrawlerOptions,
    onPageCrawled?: (metrics: PageMetrics) => void
): Promise<CrawlResultItem[]> {
    const { startUrl, maxDepth = 2, maxPages = 50, crawlId = randomUUID() } = options;
    
    // Reset speed measurement counter for new crawl
    resetSpeedMeasurementCount();
    
    const results: CrawlResultItem[] = [];
    const requestQueue = await RequestQueue.open();
    
    await requestQueue.addRequest({
        url: startUrl,
        userData: { depth: 0 },
    });
    
    const crawler = new CheerioCrawler({
        requestQueue,
        maxRequestsPerCrawl: maxPages,
        useSessionPool: true,
        persistCookiesPerSession: true,
        
        async requestHandler(context) {
            const { request, $ } = context;
            const startTime = Date.now();
            const currentDepth = request.userData.depth as number;
            const title = $('title').text().trim();
            
            let metrics = await handlePageMetrics(context, startTime);
            let usedPlaywright = false;
            
            if (shouldUsePlaywrightFallback(metrics.htmlSize, metrics.statusCode)) {
                console.log(`Retrying ${request.url} with Playwright (HTML too small: ${metrics.htmlSize} bytes)`);
                
                const playwrightResult = await crawlWithPlaywright(request.url);
                
                if (playwrightResult) {
                    metrics = playwrightResult;
                    usedPlaywright = true;
                    console.log(`Playwright retry successful, new HTML size: ${metrics.htmlSize} bytes`);
                }
            }
            
            if (onPageCrawled) {
                onPageCrawled(metrics);
            }
            
            const result: CrawlResultItem = {
                url: request.url,
                title: title || undefined,
                depth: currentDepth,
                metrics,
            };
            
            if (usedPlaywright) {
                result.usedPlaywright = true;
            }
            
            results.push(result);
            
            if (currentDepth < maxDepth) {
                await context.enqueueLinks({
                    userData: { depth: currentDepth + 1 },
                    transformRequestFunction: (req) => {
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
    
    await crawler.run();
    
    console.log(`Crawl completed. CrawlId: ${crawlId}`);
    console.log(`Total pages crawled: ${results.length}`);
    console.log(`Pages using Playwright fallback: ${results.filter(r => r.usedPlaywright).length}`);
    
    return results;
}
