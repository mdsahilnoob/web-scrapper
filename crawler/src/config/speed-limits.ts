export interface SpeedMeasurementConfig {
    enabled: boolean;
    maxPagesToMeasure: number;
}

export const defaultSpeedConfig: SpeedMeasurementConfig = {
    enabled: true,
    maxPagesToMeasure: 10,
};

let currentConfig: SpeedMeasurementConfig = { ...defaultSpeedConfig };
let pagesMeasuredCount = 0;

export function getSpeedConfig(): SpeedMeasurementConfig {
    return { ...currentConfig };
}

export function setSpeedConfig(config: Partial<SpeedMeasurementConfig>): void {
    currentConfig = {
        ...currentConfig,
        ...config,
    };
}

export function shouldMeasureSpeed(): boolean {
    if (!currentConfig.enabled) {
        return false;
    }
    
    if (pagesMeasuredCount >= currentConfig.maxPagesToMeasure) {
        return false;
    }
    
    return true;
}

export function incrementSpeedMeasurementCount(): void {
    pagesMeasuredCount++;
}

export function resetSpeedMeasurementCount(): void {
    pagesMeasuredCount = 0;
}
