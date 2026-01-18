export type IssueSeverity = 'error' | 'warning';

export interface TechnicalIssue {
    code: string;
    severity: IssueSeverity;
    message: string;
    pageUrl: string;
}

export interface PageAuditResult {
    url: string;
    issues: TechnicalIssue[];
    passedChecks: string[];
}

export interface LinkWithStatus {
    url: string;
    statusCode: number;
}
