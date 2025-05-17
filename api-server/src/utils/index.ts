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
