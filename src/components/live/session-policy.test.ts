import { describe, expect, it } from 'vitest';
import { LatencyTracker, meetsLatencyTarget, percentile, reconnectDelay, summarize } from './session-policy';

describe('reconnect policy', () => {
  it('[AC-06d] [QA-03] retries three times, 1 s, 2 s and 4 s apart, then gives up', () => {
    expect([0, 1, 2, 3].map(reconnectDelay)).toEqual([1000, 2000, 4000, null]);
    expect(reconnectDelay(-1)).toBeNull();
  });
});

describe('latency measurement', () => {
  it('[AC-06f] [QA-01] measures end of speech to the first translated audio chunk, once per turn', () => {
    const t = new LatencyTracker();
    expect(t.audioReceived(50)).toBeNull(); // audio before anyone spoke is not a turn
    t.speechStopped(1000);
    expect(t.audioReceived(1850)).toBe(850);
    expect(t.audioReceived(1900)).toBeNull(); // later chunks of the same answer don't count
    t.speechStopped(5000);
    expect(t.audioReceived(4000)).toBeNull(); // clock went backwards: ignored
    expect(t.samples).toEqual([850]);
  });
  // Boundary value analysis: samples from 0 to 60,000 ms are kept; anything outside is a clock glitch.
  it.each([[-1, null], [0, 0], [1, 1], [59_999, 59_999], [60_000, 60_000], [60_001, null]] as const)('[AC-06f] [QA-01] a %i ms turn is recorded as %s', (delay, recorded) => {
    const t = new LatencyTracker();
    t.speechStopped(100_000);
    expect(t.audioReceived(100_000 + delay)).toBe(recorded);
    expect(t.samples).toEqual(recorded === null ? [] : [recorded]);
  });
  it.each([
    [1200, 2000, true], [1201, 2000, false], [1200, 2001, false], [1199, 1999, true],
  ] as const)('[AC-06f] [QA-01] p50 %i ms and p95 %i ms meets the target: %s', (p50, p95, ok) => {
    expect(meetsLatencyTarget({ turns: 20, p50, p95 })).toBe(ok);
  });
  it('[AC-06f] [QA-01] percentile works for one sample and at the 0th / 100th edges', () => {
    expect(percentile([700], 50)).toBe(700);
    expect(percentile([300, 100, 200], 0)).toBe(100);
    expect(percentile([300, 100, 200], 100)).toBe(300);
  });
  it('[AC-06f] [QA-01] summarises median and 95th percentile and checks them against the target', () => {
    const samples = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1900];
    expect(percentile(samples, 50)).toBe(1200);
    expect(percentile(samples, 95)).toBe(1900);
    expect(percentile([], 50)).toBeNull();
    expect(meetsLatencyTarget(summarize(samples))).toBe(true);
    expect(meetsLatencyTarget(summarize([...samples, 2600, 2700]))).toBe(false);
    expect(meetsLatencyTarget(summarize([]))).toBe(false);
  });
});
