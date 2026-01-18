export interface ContentScoreRule {
    check: (metrics: any) => boolean;
    deduction: number;
    reason: string;
}

export const CONTENT_SCORE_RULES: ContentScoreRule[] = [
    {
        check: (metrics) => metrics.titleLength === 0,
        deduction: 10,
        reason: 'Missing title tag',
    },
    {
        check: (metrics) => metrics.titleLength > 0 && (metrics.titleLength < 30 || metrics.titleLength > 65),
        deduction: 5,
        reason: 'Title length not optimal (should be 30-65 characters)',
    },
    {
        check: (metrics) => metrics.metaDescriptionLength === 0,
        deduction: 5,
        reason: 'Missing meta description',
    },
    {
        check: (metrics) => metrics.wordCount < 300,
        deduction: 10,
        reason: 'Word count below 300 (thin content)',
    },
    {
        check: (metrics) => metrics.h1Count > 1,
        deduction: 5,
        reason: 'Multiple H1 tags found (should have only one)',
    },
    {
        check: (metrics) => {
            const totalImages = metrics.imagesWithAlt + metrics.imagesWithoutAlt;
            if (totalImages === 0) return false;
            const altCoverage = (metrics.imagesWithAlt / totalImages) * 100;
            return altCoverage < 80;
        },
        deduction: 5,
        reason: 'Image alt text coverage below 80%',
    },
];

export const MIN_SCORE = 0;
export const MAX_SCORE = 100;
export const STARTING_SCORE = 100;
