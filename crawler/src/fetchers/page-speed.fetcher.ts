import { Page, Response } from 'playwright';
import { PageSpeedMetrics } from '../types/speed.js';

export async function extractPageSpeed(page: Page, response: Response | null): Promise<PageSpeedMetrics> {
    const url = page.url();
    
    let ttfb = 0;
    let domLoadTime = 0;
    let totalLoadTime = 0;
    
    try {
        // Try to get TTFB from response timing
        if (response) {
            const timing = await response.serverAddr();
            const headers = await response.allHeaders();
            
            // If response.timing() is available in Playwright, use it
            // Otherwise, we'll extract from performance.timing below
        }
        
        // Extract timing metrics from browser's performance API
        const timings = await page.evaluate(() => {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            
            if (perfData) {
                return {
                    ttfb: perfData.responseStart - perfData.requestStart,
                    domLoadTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
                };
            }
            
            // Fallback to performance.timing (deprecated but more widely supported)
            const timing = performance.timing;
            return {
                ttfb: timing.responseStart - timing.navigationStart,
                domLoadTime: timing.domContentLoadedEventEnd - timing.navigationStart,
                totalLoadTime: timing.loadEventEnd - timing.navigationStart,
            };
        });
        
        ttfb = Math.max(0, Math.round(timings.ttfb || 0));
        domLoadTime = Math.max(0, Math.round(timings.domLoadTime || 0));
        totalLoadTime = Math.max(0, Math.round(timings.totalLoadTime || 0));
        
    } catch (error) {
        console.warn(`Failed to extract page speed metrics for ${url}:`, error);
    }
    
    return {
        url,
        ttfb,
        domLoadTime,
        totalLoadTime,
    };
}
