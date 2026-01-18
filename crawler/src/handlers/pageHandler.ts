import { CheerioCrawlerContext } from 'crawlee';
import { isIndexable } from '../audits/indexability.js';
import { TechnicalAuditRunner, AuditInputs } from '../audits/TechnicalAuditRunner.js';
import { TechnicalIssue } from '../types/audit.js';
import { calculateSEOScore, IssueBreakdown } from '../scoring/seo-score.engine.js';

export interface PageCrawlResult {
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
    
    const metaRobotsContent = $('meta[name="robots"]').attr('content') || '';
    
    const auditRunner = new TechnicalAuditRunner();
    const auditInputs: AuditInputs = {
        pageUrl: request.url,
        $,
        metaRobotsContent,
        isInternalPage: true,
    };
    
    const auditResult = await auditRunner.runAllAudits(auditInputs);
    const scoreResult = calculateSEOScore(auditResult.issues);
    
    return {
        url: request.url,
        statusCode,
        htmlSize,
        loadTime,
        crawledTimestamp,
        indexable,
        auditIssues: auditResult.issues,
        seoScore: scoreResult.finalScore,
        scoreBreakdown: scoreResult.breakdown,
    };
}
