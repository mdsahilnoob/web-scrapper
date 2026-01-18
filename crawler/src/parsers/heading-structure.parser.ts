import { CheerioAPI } from 'cheerio';

export interface HeadingStructureResult {
    h1Count: number;
    h2Count: number;
}

export function parseHeadingStructure($: CheerioAPI): HeadingStructureResult {
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    
    return {
        h1Count,
        h2Count,
    };
}
