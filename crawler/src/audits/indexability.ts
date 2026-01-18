import { CheerioAPI } from 'cheerio';

/**
 * Checks if a page is indexable by search engines.
 * Detects the presence of <meta name="robots" content="noindex">
 * 
 * @param $ - Cheerio instance
 * @returns true if the page is indexable, false if noindex is present
 */
export function isIndexable($: CheerioAPI): boolean {
    // Check for meta robots tag with noindex
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    
    // Also check for googlebot-specific meta tag
    const googlebotMeta = $('meta[name="googlebot"]').attr('content') || '';
    
    // Convert to lowercase for case-insensitive comparison
    const robotsContent = robotsMeta.toLowerCase();
    const googlebotContent = googlebotMeta.toLowerCase();
    
    // Check if noindex is present in either meta tag
    if (robotsContent.includes('noindex') || googlebotContent.includes('noindex')) {
        return false;
    }
    
    return true;
}
