export interface CrawlMetadata {
    crawlId: string;
    url: string;
    maxDepth: number;
    maxPages: number;
    state: 'pending' | 'running' | 'completed' | 'failed';
    pagesCrawled: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

class CrawlMetadataStorage {
    private metadata: Map<string, CrawlMetadata> = new Map();

    saveCrawlMetadata(metadata: CrawlMetadata): void {
        this.metadata.set(metadata.crawlId, metadata);
    }

    getCrawlMetadata(crawlId: string): CrawlMetadata | undefined {
        return this.metadata.get(crawlId);
    }

    updateCrawlState(
        crawlId: string,
        state: CrawlMetadata['state'],
        additionalData?: Partial<CrawlMetadata>
    ): void {
        const metadata = this.metadata.get(crawlId);
        if (metadata) {
            metadata.state = state;
            Object.assign(metadata, additionalData);
            this.metadata.set(crawlId, metadata);
        }
    }

    updatePagesCrawled(crawlId: string, count: number): void {
        const metadata = this.metadata.get(crawlId);
        if (metadata) {
            metadata.pagesCrawled = count;
            this.metadata.set(crawlId, metadata);
        }
    }

    getAllCrawls(): CrawlMetadata[] {
        return Array.from(this.metadata.values());
    }
}

const storage = new CrawlMetadataStorage();

export function saveCrawlMetadata(metadata: CrawlMetadata): void {
    storage.saveCrawlMetadata(metadata);
}

export function getCrawlMetadata(crawlId: string): CrawlMetadata | undefined {
    return storage.getCrawlMetadata(crawlId);
}

export function updateCrawlState(
    crawlId: string,
    state: CrawlMetadata['state'],
    additionalData?: Partial<CrawlMetadata>
): void {
    storage.updateCrawlState(crawlId, state, additionalData);
}

export function updatePagesCrawled(crawlId: string, count: number): void {
    storage.updatePagesCrawled(crawlId, count);
}

export function getAllCrawls(): CrawlMetadata[] {
    return storage.getAllCrawls();
}
