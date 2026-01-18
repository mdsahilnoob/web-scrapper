import { PageMetrics } from '../../../shared/types.js';

interface StoredPageResult extends PageMetrics {
    crawlId: string;
}

class CrawlResultsStorage {
    private results: Map<string, StoredPageResult[]> = new Map();

    savePageResult(result: PageMetrics, crawlId: string): void {
        const storedResult: StoredPageResult = {
            ...result,
            crawlId,
        };

        if (!this.results.has(crawlId)) {
            this.results.set(crawlId, []);
        }
        this.results.get(crawlId)!.push(storedResult);
    }

    getResultsByCrawlId(crawlId: string): PageMetrics[] {
        return this.results.get(crawlId) || [];
    }

    clearResults(crawlId: string): void {
        this.results.delete(crawlId);
    }

    getTotalPageCount(crawlId: string): number {
        return this.results.get(crawlId)?.length || 0;
    }
}

const storage = new CrawlResultsStorage();

export function savePageResult(result: PageMetrics, crawlId: string): void {
    storage.savePageResult(result, crawlId);
}

export function getResultsByCrawlId(crawlId: string): PageMetrics[] {
    return storage.getResultsByCrawlId(crawlId);
}

export function clearResults(crawlId: string): void {
    storage.clearResults(crawlId);
}

export function getTotalPageCount(crawlId: string): number {
    return storage.getTotalPageCount(crawlId);
}
