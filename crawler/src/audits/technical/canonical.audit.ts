import { CheerioAPI } from 'cheerio';
import { TechnicalIssue } from '../../types/audit.js';

export function auditCanonical(pageUrl: string, $: CheerioAPI): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    const canonical = $('link[rel="canonical"]');
    
    if (canonical.length === 0) {
        issues.push({
            code: 'MISSING_CANONICAL',
            severity: 'warning',
            message: 'Page is missing canonical link',
            pageUrl,
        });
    } else {
        const canonicalHref = canonical.attr('href');
        
        if (canonicalHref) {
            try {
                const pageUrlObj = new URL(pageUrl);
                const canonicalUrlObj = new URL(canonicalHref, pageUrl);
                
                if (pageUrlObj.hostname !== canonicalUrlObj.hostname) {
                    issues.push({
                        code: 'CROSS_DOMAIN_CANONICAL',
                        severity: 'error',
                        message: `Canonical points to different domain: ${canonicalUrlObj.href}`,
                        pageUrl,
                    });
                }
            } catch (error) {
                issues.push({
                    code: 'INVALID_CANONICAL',
                    severity: 'error',
                    message: `Invalid canonical URL: ${canonicalHref}`,
                    pageUrl,
                });
            }
        }
    }
    
    return issues;
}
