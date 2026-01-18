import { SeoScoreBreakdown } from '../types/score.js';

export interface OverallScoreInput {
    technicalScore: number;
    contentScore: number;
}

const TECHNICAL_WEIGHT = 0.5;
const CONTENT_WEIGHT = 0.5;

export function calculateOverallScore(input: OverallScoreInput): SeoScoreBreakdown {
    const { technicalScore, contentScore } = input;
    
    const overallScore = Math.round(
        (technicalScore * TECHNICAL_WEIGHT) + (contentScore * CONTENT_WEIGHT)
    );
    
    return {
        technicalScore,
        contentScore,
        overallScore,
    };
}
