import { runSiteCrawler } from '../../../crawler/src/main.js';
import { updateCrawlState } from '../storage/crawlMetadata.js';
import { savePageResult } from '../storage/crawlResults.js';
import { PageMetrics } from '../../../shared/types.js';

export function startCrawl(
    crawlId: string,
    url: string,
    maxDepth: number,
    maxPages: number
): void {
    (async () => {
        try {
            console.log(`Starting crawl ${crawlId} for ${url}`);
            
            updateCrawlState(crawlId, 'running', {
                startedAt: new Date().toISOString(),
            });
            
            const onPageCrawled = (metrics: PageMetrics) => {
                savePageResult(metrics, crawlId);
            };
            
            const results = await runSiteCrawler({
                startUrl: url,
                maxDepth,
                maxPages,
                crawlId,
            }, onPageCrawled);
            
            console.log(`Crawl ${crawlId} completed successfully. Pages crawled: ${results.length}`);
            
            updateCrawlState(crawlId, 'completed', {
                pagesCrawled: results.length,
                completedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error(`Crawl ${crawlId} failed:`, error);
            
            updateCrawlState(crawlId, 'failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                completedAt: new Date().toISOString(),
            });
        }
    })();
}
