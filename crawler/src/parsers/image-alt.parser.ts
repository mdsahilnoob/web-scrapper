import { CheerioAPI } from 'cheerio';

export interface ImageAltResult {
    imagesWithAlt: number;
    imagesWithoutAlt: number;
}

export function parseImageAlt($: CheerioAPI): ImageAltResult {
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;
    
    $('img').each((_, element) => {
        const $img = $(element);
        const src = $img.attr('src') || '';
        
        if (src.trim().length === 0) {
            return;
        }
        
        const alt = $img.attr('alt');
        
        if (alt !== undefined) {
            imagesWithAlt++;
        } else {
            imagesWithoutAlt++;
        }
    });
    
    return {
        imagesWithAlt,
        imagesWithoutAlt,
    };
}
