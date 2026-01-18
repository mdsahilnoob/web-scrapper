import { TechnicalIssue } from '../../types/audit.js';

export interface RedirectInfo {
    from: string;
    to: string;
    statusCode: number;
}

export function auditRedirectChains(pageUrl: string, redirectHistory: RedirectInfo[]): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];
    
    if (redirectHistory.length > 1) {
        const chainLength = redirectHistory.length;
        const finalUrl = redirectHistory[redirectHistory.length - 1].to;
        
        const severity = chainLength > 2 ? 'error' : 'warning';
        
        issues.push({
            code: 'REDIRECT_CHAIN',
            severity,
            message: `Redirect chain detected: ${chainLength} redirects leading to ${finalUrl}`,
            pageUrl,
        });
    }
    
    return issues;
}
