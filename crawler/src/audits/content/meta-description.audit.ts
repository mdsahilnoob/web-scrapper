import { CheerioAPI } from 'cheerio';
import { TechnicalIssue } from '../../types/audit.js';

export function auditMetaDescription(pageUrl: string, $: CheerioAPI): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    const metaDesc = $('meta[name="description"]');
    
    if (metaDesc.length === 0) {
        issues.push({
            code: 'MISSING_META_DESCRIPTION',
            severity: 'warning',
            message: 'Page is missing meta description',
            pageUrl,
        });
    } else {
        const content = metaDesc.attr('content')?.trim() || '';
        
        if (content.length === 0) {
            issues.push({
                code: 'EMPTY_META_DESCRIPTION',
                severity: 'warning',
                message: 'Page has empty meta description content attribute',
                pageUrl,
            });
        }
    }
    
    return issues;
}
