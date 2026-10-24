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
