import { CheerioAPI } from 'cheerio';

export function parseInternalLinks($: CheerioAPI, pageUrl: string): number {
    let internalLinkCount = 0;
    
    try {
        const pageUrlObj = new URL(pageUrl);
        
        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            
            if (!href || href.trim().length === 0) {
                return;
            }
            
            const hrefLower = href.toLowerCase();
            
            if (hrefLower.startsWith('mailto:') || 
                hrefLower.startsWith('javascript:') ||
                hrefLower.startsWith('tel:') ||
                href.startsWith('#')) {
                return;
            }
            
            try {
                const linkUrlObj = new URL(href, pageUrl);
                
                if (linkUrlObj.hostname === pageUrlObj.hostname) {
                    internalLinkCount++;
                }
            } catch {
                return;
            }
        });
    } catch (error) {
        console.warn(`Failed to parse internal links for ${pageUrl}:`, error);
    }
    
    return internalLinkCount;
}
