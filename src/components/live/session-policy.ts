// Recovery and measurement policies for live interpretation (REQ-06, QA-01, QA-03).

/** Wait before each reconnect attempt. After the last one the session ends and the user restarts it. */
export const RECONNECT_DELAYS_MS = [1000, 2000, 4000] as const;

export function reconnectDelay(attempt: number): number | null {
  return attempt >= 0 && attempt < RECONNECT_DELAYS_MS.length ? RECONNECT_DELAYS_MS[attempt] : null;
}

/** Time limit for asking the server for a session key. */
export const KEY_REQUEST_TIMEOUT_MS = 10_000;

/** Turn latency: end of speech (server VAD) → first translated audio chunk. */
export class LatencyTracker {
  private stoppedAt: number | null = null;
  readonly samples: number[] = [];

  speechStopped(now: number) { this.stoppedAt = now; }

  /** Returns the sample when this audio chunk is the first one after the speaker stopped. */
  audioReceived(now: number): number | null {
    if (this.stoppedAt === null) return null;
    const sample = now - this.stoppedAt;
    this.stoppedAt = null;
    // Ignore impossible values (clock jumps, audio from an earlier turn).
    if (sample < 0 || sample > 60_000) return null;
    this.samples.push(sample);
    return sample;
  }

  reset() { this.stoppedAt = null; }
}

export function percentile(values: readonly number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank))];
}

export type LatencySummary = { turns: number; p50: number | null; p95: number | null };
export const summarize = (samples: readonly number[]): LatencySummary => ({ turns: samples.length, p50: percentile(samples, 50), p95: percentile(samples, 95) });

/** Targets from the quality goals: p50 ≤ 1.2 s, p95 ≤ 2.0 s. */
export const LATENCY_TARGET = { p50: 1200, p95: 2000 } as const;
export const meetsLatencyTarget = (s: LatencySummary) => s.p50 !== null && s.p95 !== null && s.p50 <= LATENCY_TARGET.p50 && s.p95 <= LATENCY_TARGET.p95;
