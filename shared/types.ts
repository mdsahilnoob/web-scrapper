export interface CrawlerOptions {
    startUrl: string;
    maxDepth?: number;
    maxPages?: number;
    crawlId?: string;
}

export interface TechnicalIssue {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    pageUrl: string;
}

export interface IssueBreakdown {
    code: string;
    count: number;
    pointsDeducted: number;
}

export interface PageMetrics {
    url: string;
    statusCode: number;
    htmlSize: number;
    loadTime: number;
    crawledTimestamp: string;
    indexable: boolean;
    auditIssues: TechnicalIssue[];
    seoScore: number;
    scoreBreakdown: IssueBreakdown[];
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
