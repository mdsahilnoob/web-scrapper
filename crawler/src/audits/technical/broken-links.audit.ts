import { TechnicalIssue, LinkWithStatus } from '../../types/audit.js';

export function auditBrokenLinks(pageUrl: string, links: LinkWithStatus[]): TechnicalIssue[] {
    const issues: TechnicalIssue[] = [];

    for (const link of links) {
        if (link.statusCode >= 400 && link.statusCode < 500) {
            issues.push({
                code: 'BROKEN_LINK_4XX',
                severity: 'warning',
                message: `Link returns ${link.statusCode} status: ${link.url}`,
                pageUrl,
            });
        } else if (link.statusCode >= 500) {
            issues.push({
                code: 'BROKEN_LINK_5XX',
                severity: 'error',
                message: `Link returns ${link.statusCode} status: ${link.url}`,
                pageUrl,
            });
        }
    }

    return issues;
}
