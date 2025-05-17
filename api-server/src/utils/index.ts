export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isRandomFailure(): boolean {
  return Math.random() < 0.5;
}

export function getMaxJobRetry(): number {
  return Number(process.env.MAX_JOB_RETRY) || 3;
}

export function getUploadRateLimitOptions() {
  const defaultWindowMs = 24 * 60 * 60 * 1000; // 1 day
  const defaultMaxLimit = 5;

  return {
    windowMs: process.env.UPDATE_RATE_LIMIT_WINDOW_MS || defaultWindowMs,
    max: process.env.MAX_UPLOAD_LIMIT || defaultMaxLimit,
  };
}
