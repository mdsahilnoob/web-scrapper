export interface CrawlerOptions {
    startUrl: string;
    maxDepth?: number;
    maxPages?: number;
    crawlId?: string;
}

export interface PageMetrics {
    url: string;
    statusCode: number;
    htmlSize: number;
    loadTime: number;
    crawledTimestamp: string;
    indexable: boolean;
}

export interface CrawlResultItem {
    url: string;
    title?: string;
    depth: number;
    metrics: PageMetrics;
    usedPlaywright?: boolean;
}

export interface CrawlerResult {
    crawlId: string;
    results: CrawlResultItem[];
    totalPages: number;
}
