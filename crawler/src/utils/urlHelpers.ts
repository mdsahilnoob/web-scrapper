/**
 * Checks whether a target URL belongs to the same domain as the base URL.
 * 
 * @param targetUrl - The URL to check
 * @param baseUrl - The base URL to compare against
 * @returns true if the target URL is internal (same domain), false otherwise
 */
export function isInternalUrl(targetUrl: string, baseUrl: string): boolean {
    try {
        const targetUrlObj = new URL(targetUrl);
        const baseUrlObj = new URL(baseUrl);
        
        // Compare hostnames (domain names)
        return targetUrlObj.hostname === baseUrlObj.hostname;
    } catch (error) {
        // If URL parsing fails, consider it external/invalid
        console.warn(`Invalid URL encountered: ${error}`);
        return false;
    }
}
