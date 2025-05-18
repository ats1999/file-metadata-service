export function getMaxJobRetry(): number {
  return Number(process.env.MAX_JOB_RETRY) || 3;
}

export function getUploadRateLimitOptions() {
  const defaultWindowMs = 24 * 60 * 60 * 1000; // 1 day
  const defaultMaxLimit = 5;

  return {
    windowMs:
      Number(process.env.UPDATE_RATE_LIMIT_WINDOW_MS) || defaultWindowMs,
    max: Number(process.env.MAX_UPLOAD_RATE_LIMIT) || defaultMaxLimit,
  };
}
