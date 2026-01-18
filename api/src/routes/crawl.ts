import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { saveCrawlMetadata, getCrawlMetadata } from '../storage/crawlMetadata.js';
import { startCrawl } from '../services/crawlOrchestrator.js';
import { getResultsByCrawlId, getTechnicalSummary, getPageByUrl } from '../storage/crawlResults.js';

const router = Router();

const crawlRequestSchema = z.object({
    url: z.string().url({ message: 'Invalid URL format' }),
    maxDepth: z.number().int().min(1).max(10).optional().default(2),
    maxPages: z.number().int().min(1).max(1000).optional().default(50),
});

router.post('/crawl', async (req: Request, res: Response) => {
    try {
        const validationResult = crawlRequestSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            });
        }
        
        const { url, maxDepth, maxPages } = validationResult.data;
        const crawlId = randomUUID();
        
        saveCrawlMetadata({
            crawlId,
            url,
            maxDepth,
            maxPages,
            state: 'pending',
            pagesCrawled: 0,
            createdAt: new Date().toISOString(),
        });
        
        startCrawl(crawlId, url, maxDepth, maxPages);
        
        return res.status(202).json({
            crawlId,
            url,
            maxDepth,
            maxPages,
            state: 'pending',
            message: 'Crawl request accepted and queued',
        });
    } catch (error) {
        console.error('Error creating crawl:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/status', (req: Request, res: Response) => {
    try {
        const crawlId = req.params.id;
        const metadata = getCrawlMetadata(crawlId);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Crawl not found',
                crawlId,
            });
        }
        
        return res.status(200).json({
            crawlId: metadata.crawlId,
            url: metadata.url,
            state: metadata.state,
            pagesCrawled: metadata.pagesCrawled,
            maxPages: metadata.maxPages,
            maxDepth: metadata.maxDepth,
            createdAt: metadata.createdAt,
            startedAt: metadata.startedAt,
            completedAt: metadata.completedAt,
            error: metadata.error,
        });
    } catch (error) {
        console.error('Error getting crawl status:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/pages', (req: Request, res: Response) => {
    try {
        const crawlId = req.params.id;
        const metadata = getCrawlMetadata(crawlId);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Crawl not found',
                crawlId,
            });
        }
        
        const pages = getResultsByCrawlId(crawlId);
        
        return res.status(200).json({
            crawlId,
            state: metadata.state,
            totalPages: pages.length,
            pages: pages.map(page => ({
                url: page.url,
                statusCode: page.statusCode,
                htmlSize: page.htmlSize,
                loadTime: page.loadTime,
                indexable: page.indexable,
                crawledTimestamp: page.crawledTimestamp,
            })),
        });
    } catch (error) {
        console.error('Error getting crawl pages:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/technical-summary', (req: Request, res: Response) => {
    try {
        const crawlId = req.params.id;
        const metadata = getCrawlMetadata(crawlId);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Crawl not found',
                crawlId,
            });
        }
        
        const summary = getTechnicalSummary(crawlId);
        
        if (!summary) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No results available yet',
                siteScore: 0,
                totalIssues: 0,
                errorsCount: 0,
                warningsCount: 0,
            });
        }
        
        return res.status(200).json({
            crawlId,
            state: metadata.state,
            siteScore: summary.siteScore,
            totalIssues: summary.totalIssues,
            errorsCount: summary.errorsCount,
            warningsCount: summary.warningsCount,
        });
    } catch (error) {
        console.error('Error getting technical summary:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/pages/:url/audit', (req: Request, res: Response) => {
    try {
        const crawlId = req.params.id;
        const pageUrl = decodeURIComponent(req.params.url);
        
        const metadata = getCrawlMetadata(crawlId);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Crawl not found',
                crawlId,
            });
        }
        
        const page = getPageByUrl(crawlId, pageUrl);
        
        if (!page) {
            return res.status(404).json({
                error: 'Page not found',
                crawlId,
                pageUrl,
            });
        }
        
        return res.status(200).json({
            crawlId,
            pageUrl: page.url,
            seoScore: page.seoScore,
            issues: page.auditIssues,
            scoreBreakdown: page.scoreBreakdown,
            statusCode: page.statusCode,
            indexable: page.indexable,
        });
    } catch (error) {
        console.error('Error getting page audit:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
