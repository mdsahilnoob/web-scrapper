export interface SeoScoreBreakdown {
    technicalScore: number;
    contentScore: number;
    overallScore: number;
}

export interface ScoreDeduction {
    reason: string;
    severity: 'error' | 'warning';
    pointsDeducted: number;
}
