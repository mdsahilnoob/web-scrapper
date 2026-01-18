import { TechnicalIssue } from '../types/audit.js';
import { ScoreDeduction } from '../types/score.js';

export interface TechnicalScoreResult {
    technicalScore: number;
    deductions: ScoreDeduction[];
}

const SCORE_DEDUCTIONS = {
    error: 10,
    warning: 5,
} as const;

export function calculateTechnicalScore(issues: TechnicalIssue[]): TechnicalScoreResult {
    let score = 100;
    const deductions: ScoreDeduction[] = [];
    
    for (const issue of issues) {
        const pointsDeducted = SCORE_DEDUCTIONS[issue.severity];
        score -= pointsDeducted;
        
        deductions.push({
            reason: issue.message,
            severity: issue.severity,
            pointsDeducted,
        });
    }
    
    const technicalScore = Math.max(0, score);
    
    return {
        technicalScore,
        deductions,
    };
}
