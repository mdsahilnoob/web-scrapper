import { PageMetrics, TechnicalIssue } from '../../../shared/types.js';

interface StoredPageResult extends PageMetrics {
    crawlId: string;
}

export interface SiteSummary {
    siteScore: number;
    totalIssues: number;
    errorsCount: number;
    warningsCount: number;
}

export interface SiteSeoScoreSummary {
    averageTechnicalScore: number;
    averageContentScore: number;
    averageOverallScore: number;
    pagesScored: number;
}

class CrawlResultsStorage {
    private results: Map<string, StoredPageResult[]> = new Map();

    savePageResult(result: PageMetrics, crawlId: string): void {
        const storedResult: StoredPageResult = {
            ...result,
            crawlId,
        };

        if (!this.results.has(crawlId)) {
            this.results.set(crawlId, []);
        }
        this.results.get(crawlId)!.push(storedResult);
    }

    getResultsByCrawlId(crawlId: string): PageMetrics[] {
        return this.results.get(crawlId) || [];
    }

    getPageByUrl(crawlId: string, pageUrl: string): PageMetrics | undefined {
        const pages = this.results.get(crawlId) || [];
        return pages.find(page => page.url === pageUrl);
    }

    getTechnicalSummary(crawlId: string): SiteSummary | null {
        const pages = this.results.get(crawlId);
        
        if (!pages || pages.length === 0) {
            return null;
        }

        let totalScore = 0;
        let totalIssues = 0;
        let errorsCount = 0;
        let warningsCount = 0;

        for (const page of pages) {
            totalScore += page.seoScore;
            totalIssues += page.auditIssues.length;

            for (const issue of page.auditIssues) {
                if (issue.severity === 'error') {
                    errorsCount++;
                } else if (issue.severity === 'warning') {
                    warningsCount++;
                }
            }
        }

        const siteScore = Math.round(totalScore / pages.length);

        return {
            siteScore,
            totalIssues,
            errorsCount,
            warningsCount,
        };
    }

    clearResults(crawlId: string): void {
        this.results.delete(crawlId);
    }

    getTotalPageCount(crawlId: string): number {
        return this.results.get(crawlId)?.length || 0;
    }

    getSeoScoreSummary(crawlId: string): SiteSeoScoreSummary | null {
        const pages = this.results.get(crawlId);
        
        if (!pages || pages.length === 0) {
            return null;
        }

        const pagesWithScores = pages.filter(page => page.seoScoreBreakdown);
        
        if (pagesWithScores.length === 0) {
            return null;
        }

        const sum = pagesWithScores.reduce(
            (acc, page) => ({
                technical: acc.technical + (page.seoScoreBreakdown?.technicalScore || 0),
                content: acc.content + (page.seoScoreBreakdown?.contentScore || 0),
                overall: acc.overall + (page.seoScoreBreakdown?.overallScore || 0),
            }),
            { technical: 0, content: 0, overall: 0 }
        );

        const count = pagesWithScores.length;

        return {
            averageTechnicalScore: Math.round(sum.technical / count),
            averageContentScore: Math.round(sum.content / count),
            averageOverallScore: Math.round(sum.overall / count),
            pagesScored: count,
        };
    }
}

const storage = new CrawlResultsStorage();

export function savePageResult(result: PageMetrics, crawlId: string): void {
    storage.savePageResult(result, crawlId);
}

export function getResultsByCrawlId(crawlId: string): PageMetrics[] {
    return storage.getResultsByCrawlId(crawlId);
}

export function getPageByUrl(crawlId: string, pageUrl: string): PageMetrics | undefined {
    return storage.getPageByUrl(crawlId, pageUrl);
}

export function getTechnicalSummary(crawlId: string): SiteSummary | null {
    return storage.getTechnicalSummary(crawlId);
}

export function clearResults(crawlId: string): void {
    storage.clearResults(crawlId);
}

export function getTotalPageCount(crawlId: string): number {
    return storage.getTotalPageCount(crawlId);
}

export function getSeoScoreSummary(crawlId: string): SiteSeoScoreSummary | null {
    return storage.getSeoScoreSummary(crawlId);
}
