import { CheerioAPI } from 'cheerio';

export function parseWordCount($: CheerioAPI): number {
    const clone = $.root().clone();
    
    clone.find('script, style, nav, footer, noscript, iframe').remove();
    
    const text = clone.text();
    
    const words = text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
    
    return words.length;
}
