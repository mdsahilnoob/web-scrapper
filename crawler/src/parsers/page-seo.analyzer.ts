import { CheerioAPI } from 'cheerio';
import { parseMetaLength } from './meta-length.parser.js';
import { parseHeadingStructure } from './heading-structure.parser.js';
import { parseWordCount } from './word-count.parser.js';
import { parseImageAlt } from './image-alt.parser.js';
import { parseInternalLinks } from './internal-links.parser.js';

export interface PageSeoMetrics {
    titleLength: number;
    metaDescriptionLength: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    wordCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    internalLinkCount: number;
}

export function analyzePageSeo($: CheerioAPI, pageUrl: string): PageSeoMetrics {
    const metaLength = parseMetaLength($);
    const headingStructure = parseHeadingStructure($);
    const wordCount = parseWordCount($);
    const imageAlt = parseImageAlt($);
    const internalLinkCount = parseInternalLinks($, pageUrl);

    return {
        titleLength: metaLength.titleLength,
        metaDescriptionLength: metaLength.metaDescriptionLength,
        h1Count: headingStructure.h1Count,
        h2Count: headingStructure.h2Count,
        h3Count: headingStructure.h3Count,
        h4Count: headingStructure.h4Count,
        h5Count: headingStructure.h5Count,
        h6Count: headingStructure.h6Count,
        wordCount,
        imagesWithAlt: imageAlt.imagesWithAlt,
        imagesWithoutAlt: imageAlt.imagesWithoutAlt,
        internalLinkCount
    };
}
