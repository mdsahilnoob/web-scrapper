import { CheerioAPI } from 'cheerio';

export interface MetaLengthResult {
    titleLength: number;
    metaDescriptionLength: number;
}

export function parseMetaLength($: CheerioAPI): MetaLengthResult {
    const title = $('title').first();
    const titleText = title.length > 0 ? title.text().trim() : '';
    const titleLength = titleText.length;
    
    const metaDesc = $('meta[name="description"]').first();
    const metaContent = metaDesc.length > 0 ? (metaDesc.attr('content') || '').trim() : '';
    const metaDescriptionLength = metaContent.length;
    
    return {
        titleLength,
        metaDescriptionLength,
    };
}
