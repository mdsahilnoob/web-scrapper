export function isInternalUrl(targetUrl: string, baseUrl: string): boolean {
    try {
        const targetUrlObj = new URL(targetUrl);
        const baseUrlObj = new URL(baseUrl);
        return targetUrlObj.hostname === baseUrlObj.hostname;
    } catch (error) {
        console.warn(`Invalid URL encountered: ${error}`);
        return false;
    }
}
