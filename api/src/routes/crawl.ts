import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { saveCrawlMetadata, getCrawlMetadata } from '../storage/crawlMetadata.js';
import { startCrawl } from '../services/crawlOrchestrator.js';
import { getResultsByCrawlId, getTechnicalSummary, getPageByUrl, getSeoScoreSummary } from '../storage/crawlResults.js';

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

router.get('/crawl/:id/pages/:url/seo-metrics', (req: Request, res: Response) => {
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
        
        if (!page.seoMetrics) {
            return res.status(200).json({
                crawlId,
                pageUrl: page.url,
                message: 'SEO metrics not available for this page',
            });
        }
        
        return res.status(200).json({
            crawlId,
            pageUrl: page.url,
            titleLength: page.seoMetrics.titleLength,
            metaDescriptionLength: page.seoMetrics.metaDescriptionLength,
            h1Count: page.seoMetrics.h1Count,
            h2Count: page.seoMetrics.h2Count,
            h3Count: page.seoMetrics.h3Count,
            h4Count: page.seoMetrics.h4Count,
            h5Count: page.seoMetrics.h5Count,
            h6Count: page.seoMetrics.h6Count,
            wordCount: page.seoMetrics.wordCount,
            imagesWithAlt: page.seoMetrics.imagesWithAlt,
            imagesWithoutAlt: page.seoMetrics.imagesWithoutAlt,
            internalLinkCount: page.seoMetrics.internalLinkCount,
        });
    } catch (error) {
        console.error('Error getting page SEO metrics:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/seo-metrics-summary', (req: Request, res: Response) => {
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
        
        if (pages.length === 0) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No results available yet',
                totalPages: 0,
            });
        }
        
        const pagesWithMetrics = pages.filter(page => page.seoMetrics);
        
        if (pagesWithMetrics.length === 0) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No SEO metrics available yet',
                totalPages: pages.length,
            });
        }
        
        const sum = pagesWithMetrics.reduce((acc, page) => {
            const metrics = page.seoMetrics!;
            return {
                titleLength: acc.titleLength + metrics.titleLength,
                metaDescriptionLength: acc.metaDescriptionLength + metrics.metaDescriptionLength,
                wordCount: acc.wordCount + metrics.wordCount,
                h1Count: acc.h1Count + metrics.h1Count,
                h2Count: acc.h2Count + metrics.h2Count,
                internalLinkCount: acc.internalLinkCount + metrics.internalLinkCount,
                imagesWithAlt: acc.imagesWithAlt + metrics.imagesWithAlt,
                imagesWithoutAlt: acc.imagesWithoutAlt + metrics.imagesWithoutAlt,
            };
        }, {
            titleLength: 0,
            metaDescriptionLength: 0,
            wordCount: 0,
            h1Count: 0,
            h2Count: 0,
            internalLinkCount: 0,
            imagesWithAlt: 0,
            imagesWithoutAlt: 0,
        });
        
        const count = pagesWithMetrics.length;
        
        return res.status(200).json({
            crawlId,
            state: metadata.state,
            totalPages: pages.length,
            pagesWithMetrics: count,
            averageTitleLength: Math.round(sum.titleLength / count),
            averageMetaDescriptionLength: Math.round(sum.metaDescriptionLength / count),
            averageWordCount: Math.round(sum.wordCount / count),
            averageH1Count: Math.round((sum.h1Count / count) * 10) / 10,
            averageH2Count: Math.round((sum.h2Count / count) * 10) / 10,
            averageInternalLinkCount: Math.round(sum.internalLinkCount / count),
            totalImagesWithAlt: sum.imagesWithAlt,
            totalImagesWithoutAlt: sum.imagesWithoutAlt,
            imageAltCoveragePercent: Math.round((sum.imagesWithAlt / (sum.imagesWithAlt + sum.imagesWithoutAlt)) * 100) || 0,
        });
    } catch (error) {
        console.error('Error getting SEO metrics summary:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/pages/:url/speed', (req: Request, res: Response) => {
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
        
        if (!page.speedMetrics) {
            return res.status(200).json({
                crawlId,
                pageUrl: page.url,
                message: 'Speed metrics not available for this page',
            });
        }
        
        return res.status(200).json({
            crawlId,
            pageUrl: page.url,
            ttfb: page.speedMetrics.ttfb,
            domLoadTime: page.speedMetrics.domLoadTime,
            totalLoadTime: page.speedMetrics.totalLoadTime,
        });
    } catch (error) {
        console.error('Error getting page speed metrics:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/speed-summary', (req: Request, res: Response) => {
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
        
        if (pages.length === 0) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No results available yet',
                totalPages: 0,
            });
        }
        
        const pagesWithSpeed = pages.filter(page => page.speedMetrics);
        
        if (pagesWithSpeed.length === 0) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No speed metrics available yet',
                totalPages: pages.length,
                pagesWithSpeedData: 0,
            });
        }
        
        const sum = pagesWithSpeed.reduce((acc, page) => {
            const metrics = page.speedMetrics!;
            return {
                ttfb: acc.ttfb + metrics.ttfb,
                domLoadTime: acc.domLoadTime + metrics.domLoadTime,
                totalLoadTime: acc.totalLoadTime + metrics.totalLoadTime,
            };
        }, { ttfb: 0, domLoadTime: 0, totalLoadTime: 0 });
        
        const count = pagesWithSpeed.length;
        
        return res.status(200).json({
            crawlId,
            state: metadata.state,
            totalPages: pages.length,
            pagesWithSpeedData: count,
            averageTtfb: Math.round(sum.ttfb / count),
            averageDomLoadTime: Math.round(sum.domLoadTime / count),
            averageTotalLoadTime: Math.round(sum.totalLoadTime / count),
        });
    } catch (error) {
        console.error('Error getting speed summary:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/seo-score', (req: Request, res: Response) => {
    try {
        const crawlId = req.params.id;
        const metadata = getCrawlMetadata(crawlId);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Crawl not found',
                crawlId,
            });
        }
        
        const scoreSummary = getSeoScoreSummary(crawlId);
        
        if (!scoreSummary) {
            return res.status(200).json({
                crawlId,
                state: metadata.state,
                message: 'No SEO scores available yet',
            });
        }
        
        return res.status(200).json({
            crawlId,
            state: metadata.state,
            technicalScore: scoreSummary.averageTechnicalScore,
            contentScore: scoreSummary.averageContentScore,
            overallScore: scoreSummary.averageOverallScore,
            pagesScored: scoreSummary.pagesScored,
        });
    } catch (error) {
        console.error('Error getting SEO score:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/crawl/:id/pages/:url/seo-score', (req: Request, res: Response) => {
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
        
        if (!page.seoScoreBreakdown) {
            return res.status(200).json({
                crawlId,
                pageUrl: page.url,
                message: 'SEO score breakdown not available for this page',
            });
        }
        
        return res.status(200).json({
            crawlId,
            pageUrl: page.url,
            technicalScore: page.seoScoreBreakdown.technicalScore,
            contentScore: page.seoScoreBreakdown.contentScore,
            overallScore: page.seoScoreBreakdown.overallScore,
            technicalDeductions: page.technicalDeductions || [],
            contentDeductions: page.contentDeductions || [],
        });
    } catch (error) {
        console.error('Error getting page SEO score:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
