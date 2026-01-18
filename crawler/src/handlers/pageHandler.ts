import { CheerioCrawlerContext } from 'crawlee';
import { isIndexable } from '../audits/indexability.js';

export interface PageCrawlResult {
    url: string;
    statusCode: number;
    htmlSize: number;
    loadTime: number;
    crawledTimestamp: string;
    indexable: boolean;
}

/**
 * Handles a crawled page and collects metrics.
 * 
 * @param context - The CheerioCrawler context
 * @param startTime - The time when the request started
 * @returns PageCrawlResult object with collected metrics
 */
export async function handlePageMetrics(
    context: CheerioCrawlerContext,
    startTime: number
): Promise<PageCrawlResult> {
    const { request, response, body, $ } = context;
    
    // Calculate load time
    const loadTime = Date.now() - startTime;
    
    // Calculate HTML size in bytes
    const htmlSize = Buffer.byteLength(body, 'utf8');
    
    // Get status code
    const statusCode = response?.statusCode || 0;
    
    // Create timestamp
    const crawledTimestamp = new Date().toISOString();
    
    // Check indexability
    const indexable = isIndexable($);
    
    return {
        url: request.url,
        statusCode,
        htmlSize,
        loadTime,
        crawledTimestamp,
        indexable,
    };
}
