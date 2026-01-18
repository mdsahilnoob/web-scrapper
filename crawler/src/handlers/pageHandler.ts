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

export async function handlePageMetrics(
    context: CheerioCrawlerContext,
    startTime: number
): Promise<PageCrawlResult> {
    const { request, response, body, $ } = context;
    const loadTime = Date.now() - startTime;
    const htmlSize = Buffer.byteLength(body, 'utf8');
    const statusCode = response?.statusCode || 0;
    const crawledTimestamp = new Date().toISOString();
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
