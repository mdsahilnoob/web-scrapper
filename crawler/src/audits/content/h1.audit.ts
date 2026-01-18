import { CheerioAPI } from 'cheerio';
import { TechnicalIssue } from '../../types/audit.js';

export function auditH1(pageUrl: string, $: CheerioAPI): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    const h1Tags = $('h1');
    const h1Count = h1Tags.length;
    
    if (h1Count > 1) {
        issues.push({
            code: 'MULTIPLE_H1_TAGS',
            severity: 'warning',
            message: `Page has ${h1Count} H1 tags (should have exactly 1)`,
            pageUrl,
        });
    }
    
    return issues;
}
