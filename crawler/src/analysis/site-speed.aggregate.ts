import { PageSpeedMetrics } from '../types/speed.js';

export interface SiteSpeedSummary {
    averageTtfb: number;
    averageDomLoadTime: number;
    averageTotalLoadTime: number;
    pagesWithSpeedData: number;
}

export function calculateSiteSpeed(speedMetrics: PageSpeedMetrics[]): SiteSpeedSummary {
    const validMetrics = speedMetrics.filter(
        metric => metric.ttfb > 0 || metric.domLoadTime > 0 || metric.totalLoadTime > 0
    );

    if (validMetrics.length === 0) {
        return {
            averageTtfb: 0,
            averageDomLoadTime: 0,
            averageTotalLoadTime: 0,
            pagesWithSpeedData: 0,
        };
    }

    const sum = validMetrics.reduce(
        (acc, metric) => ({
            ttfb: acc.ttfb + metric.ttfb,
            domLoadTime: acc.domLoadTime + metric.domLoadTime,
            totalLoadTime: acc.totalLoadTime + metric.totalLoadTime,
        }),
        { ttfb: 0, domLoadTime: 0, totalLoadTime: 0 }
    );

    const count = validMetrics.length;

    return {
        averageTtfb: Math.round(sum.ttfb / count),
        averageDomLoadTime: Math.round(sum.domLoadTime / count),
        averageTotalLoadTime: Math.round(sum.totalLoadTime / count),
        pagesWithSpeedData: count,
    };
}
