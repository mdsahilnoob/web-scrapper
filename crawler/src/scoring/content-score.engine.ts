import { PageSeoMetrics } from '../parsers/page-seo.analyzer.js';
import { ScoreDeduction } from '../types/score.js';
import { CONTENT_SCORE_RULES, STARTING_SCORE, MIN_SCORE, MAX_SCORE } from './content-score.rules.js';

export interface ContentScoreResult {
    contentScore: number;
    deductions: ScoreDeduction[];
}

export function calculateContentScore(metrics: PageSeoMetrics): ContentScoreResult {
    let score = STARTING_SCORE;
    const deductions: ScoreDeduction[] = [];
    
    for (const rule of CONTENT_SCORE_RULES) {
        if (rule.check(metrics)) {
            score -= rule.deduction;
            
            deductions.push({
                reason: rule.reason,
                severity: rule.deduction >= 10 ? 'error' : 'warning',
                pointsDeducted: rule.deduction,
            });
        }
    }
    
    const contentScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
    
    return {
        contentScore,
        deductions,
    };
}
