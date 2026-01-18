import { SeoScoreBreakdown } from '../types/score.js';

export interface PageSeoScoreData {
    technicalScore: number;
    contentScore: number;
    overallScore: number;
}

export interface SiteSeoScoreResult {
    averageTechnicalScore: number;
    averageContentScore: number;
    averageOverallScore: number;
    pagesScored: number;
}

export function calculateSiteSeoScore(pages: PageSeoScoreData[]): SiteSeoScoreResult {
    const validPages = pages.filter(
        page => 
            page.technicalScore !== undefined && 
            page.contentScore !== undefined && 
            page.overallScore !== undefined
    );
    
    if (validPages.length === 0) {
        return {
            averageTechnicalScore: 0,
            averageContentScore: 0,
            averageOverallScore: 0,
            pagesScored: 0,
        };
    }
    
    const sum = validPages.reduce(
        (acc, page) => ({
            technical: acc.technical + page.technicalScore,
            content: acc.content + page.contentScore,
            overall: acc.overall + page.overallScore,
        }),
        { technical: 0, content: 0, overall: 0 }
    );
    
    const count = validPages.length;
    
    return {
        averageTechnicalScore: Math.round(sum.technical / count),
        averageContentScore: Math.round(sum.content / count),
        averageOverallScore: Math.round(sum.overall / count),
        pagesScored: count,
    };
}
