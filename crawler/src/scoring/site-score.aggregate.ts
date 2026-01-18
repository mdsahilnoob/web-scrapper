import { TechnicalIssue } from '../types/audit.js';

export interface PageScoreData {
    seoScore: number;
    issues: TechnicalIssue[];
}

export interface SiteScoreResult {
    siteScore: number;
    totalIssues: number;
    errorsCount: number;
    warningsCount: number;
}

export function calculateSiteScore(pages: PageScoreData[]): SiteScoreResult {
    if (pages.length === 0) {
        return {
            siteScore: 0,
            totalIssues: 0,
            errorsCount: 0,
            warningsCount: 0,
        };
    }
    
    let totalScore = 0;
    let totalIssues = 0;
    let errorsCount = 0;
    let warningsCount = 0;
    
    for (const page of pages) {
        totalScore += page.seoScore;
        totalIssues += page.issues.length;
        
        for (const issue of page.issues) {
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
