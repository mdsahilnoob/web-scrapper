import { CheerioAPI } from 'cheerio';
import { PageAuditResult, TechnicalIssue, LinkWithStatus } from '../types/audit.js';
import { auditBrokenLinks } from './technical/broken-links.audit.js';
import { auditRedirectChains, RedirectInfo } from './technical/redirect-chains.audit.js';
import { auditNoindex } from './technical/noindex.audit.js';
import { auditCanonical } from './technical/canonical.audit.js';
import { auditTitle } from './content/title.audit.js';
import { auditMetaDescription } from './content/meta-description.audit.js';
import { auditH1 } from './content/h1.audit.js';

export interface AuditInputs {
    pageUrl: string;
    $: CheerioAPI;
    outgoingLinks?: LinkWithStatus[];
    redirectHistory?: RedirectInfo[];
    metaRobotsContent?: string;
    isInternalPage?: boolean;
}

export class TechnicalAuditRunner {
    async runAllAudits(inputs: AuditInputs): Promise<PageAuditResult> {
        const allIssues: TechnicalIssue[] = [];
        const passedChecks: string[] = [];
        
        const titleIssues = auditTitle(inputs.pageUrl, inputs.$);
        if (titleIssues.length === 0) {
            passedChecks.push('title');
        } else {
            allIssues.push(...titleIssues);
        }
        
        const metaDescIssues = auditMetaDescription(inputs.pageUrl, inputs.$);
        if (metaDescIssues.length === 0) {
            passedChecks.push('meta-description');
        } else {
            allIssues.push(...metaDescIssues);
        }
        
        const h1Issues = auditH1(inputs.pageUrl, inputs.$);
        if (h1Issues.length === 0) {
            passedChecks.push('h1');
        } else {
            allIssues.push(...h1Issues);
        }
        
        const canonicalIssues = auditCanonical(inputs.pageUrl, inputs.$);
        if (canonicalIssues.length === 0) {
            passedChecks.push('canonical');
        } else {
            allIssues.push(...canonicalIssues);
        }
        
        if (inputs.outgoingLinks) {
            const brokenLinksIssues = auditBrokenLinks(inputs.pageUrl, inputs.outgoingLinks);
            if (brokenLinksIssues.length === 0) {
                passedChecks.push('broken-links');
            } else {
                allIssues.push(...brokenLinksIssues);
            }
        }
        
        if (inputs.redirectHistory && inputs.redirectHistory.length > 0) {
            const redirectIssues = auditRedirectChains(inputs.pageUrl, inputs.redirectHistory);
            if (redirectIssues.length === 0) {
                passedChecks.push('redirect-chains');
            } else {
                allIssues.push(...redirectIssues);
            }
        }
        
        if (inputs.metaRobotsContent !== undefined) {
            const noindexIssues = auditNoindex(
                inputs.pageUrl,
                inputs.metaRobotsContent,
                inputs.isInternalPage
            );
            if (noindexIssues.length === 0) {
                passedChecks.push('noindex');
            } else {
                allIssues.push(...noindexIssues);
            }
        }
        
        return {
            url: inputs.pageUrl,
            issues: allIssues,
            passedChecks,
        };
    }
}
