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

export interface PageSeoMetrics {
    titleLength: number;
    metaDescriptionLength: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    wordCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    internalLinkCount: number;
}

export interface PageSpeedMetrics {
    url: string;
    ttfb: number;
    domLoadTime: number;
    totalLoadTime: number;
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
    seoMetrics?: PageSeoMetrics;
    speedMetrics?: PageSpeedMetrics;
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
