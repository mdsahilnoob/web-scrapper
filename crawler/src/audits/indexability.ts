import { CheerioAPI } from 'cheerio';

export function isIndexable($: CheerioAPI): boolean {
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    const googlebotMeta = $('meta[name="googlebot"]').attr('content') || '';
    const robotsContent = robotsMeta.toLowerCase();
    const googlebotContent = googlebotMeta.toLowerCase();
    
    if (robotsContent.includes('noindex') || googlebotContent.includes('noindex')) {
        return false;
    }
    
    return true;
}
