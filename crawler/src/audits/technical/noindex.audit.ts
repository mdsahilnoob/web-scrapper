import { TechnicalIssue } from '../../types/audit.js';

export function auditNoindex(
    pageUrl: string,
    metaRobotsContent: string,
    isInternalPage: boolean = true
): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    const robotsContent = metaRobotsContent.toLowerCase();
    
    if (robotsContent.includes('noindex')) {
        if (isInternalPage) {
            issues.push({
                code: 'NOINDEX_INTERNAL_PAGE',
                severity: 'error',
                message: 'Internal page has noindex directive',
                pageUrl,
            });
        } else {
            issues.push({
                code: 'NOINDEX_PAGE',
                severity: 'warning',
                message: 'Page has noindex directive',
                pageUrl,
            });
        }
    }
    
    return issues;
}
