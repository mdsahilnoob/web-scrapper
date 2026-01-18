import { TechnicalIssue } from '../types/audit.js';

export interface IssueBreakdown {
    code: string;
    count: number;
    pointsDeducted: number;
}

export interface SEOScoreResult {
    finalScore: number;
    breakdown: IssueBreakdown[];
}

const SCORE_DEDUCTIONS = {
    error: 10,
    warning: 5,
} as const;

export function calculateSEOScore(issues: TechnicalIssue[]): SEOScoreResult {
    let score = 100;
    const breakdownMap = new Map<string, IssueBreakdown>();
    
    for (const issue of issues) {
        const deduction = SCORE_DEDUCTIONS[issue.severity];
        score -= deduction;
        
        const existing = breakdownMap.get(issue.code);
        if (existing) {
            existing.count += 1;
            existing.pointsDeducted += deduction;
        } else {
            breakdownMap.set(issue.code, {
                code: issue.code,
                count: 1,
                pointsDeducted: deduction,
            });
        }
    }
    
    const finalScore = Math.max(0, score);
    const breakdown = Array.from(breakdownMap.values());
    
    return {
        finalScore,
        breakdown,
    };
}
