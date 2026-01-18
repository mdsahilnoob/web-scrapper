import { CheerioAPI } from 'cheerio';
import { TechnicalIssue } from '../../types/audit.js';

export function auditTitle(pageUrl: string, $: CheerioAPI): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    const title = $('title');
    
    if (title.length === 0) {
        issues.push({
            code: 'MISSING_TITLE',
            severity: 'error',
            message: 'Page is missing <title> tag',
            pageUrl,
        });
    } else {
        const titleText = title.text().trim();
        
        if (titleText.length === 0) {
            issues.push({
                code: 'EMPTY_TITLE',
                severity: 'error',
                message: 'Page has empty <title> tag',
                pageUrl,
            });
        }
    }
    
    return issues;
}
