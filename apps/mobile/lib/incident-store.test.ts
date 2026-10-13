import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The store must never leave a screen waiting forever: a hung or refused IndexedDB open becomes StorageUnavailable.
// `idb` is mocked; the module is re-imported per test because the open is cached at module level.

const { openDB } = vi.hoisted(() => ({ openDB: vi.fn() }));
vi.mock("idb", () => ({ openDB }));

async function load() {
  vi.resetModules();
  return import("./incident-store");
}

function fakeDb(value: unknown = null) {
  return { get: vi.fn().mockResolvedValue(value), close: vi.fn() };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("indexedDB", {});
  openDB.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("incident store open", () => {
  it("a hung open fails with StorageUnavailable after OPEN_TIMEOUT_MS, not before", async () => {
    const { incidentStore, OPEN_TIMEOUT_MS, StorageUnavailable } = await load();
    openDB.mockReturnValue(new Promise(() => undefined));
    let outcome: unknown = "pending";
    const read = incidentStore.get().then(
      (v) => (outcome = v),
      (e: unknown) => (outcome = e),
    );
    await vi.advanceTimersByTimeAsync(OPEN_TIMEOUT_MS - 1);
    expect(outcome).toBe("pending");
    await vi.advanceTimersByTimeAsync(1);
    await read;
    expect(outcome).toBeInstanceOf(StorageUnavailable);
  });

  it("a refused open fails with StorageUnavailable carrying the cause, and the next call opens again", async () => {
    const { incidentStore, StorageUnavailable } = await load();
    const refused = new Error("refused");
    const incident = { incidentKey: "k" };
    openDB.mockRejectedValueOnce(refused).mockResolvedValueOnce(fakeDb(incident));
    const first = await incidentStore.get().catch((e: unknown) => e);
    expect(first).toBeInstanceOf(StorageUnavailable);
    expect((first as Error).cause).toBe(refused);
    await expect(incidentStore.get()).resolves.toEqual(incident);
    expect(openDB).toHaveBeenCalledTimes(2);
  });

  it("a connection that arrives after the give-up is closed and never used", async () => {
    const { incidentStore, OPEN_TIMEOUT_MS, StorageUnavailable } = await load();
    let arrive: (d: ReturnType<typeof fakeDb>) => void = () => undefined;
    const late = fakeDb();
    openDB.mockReturnValueOnce(new Promise((resolve) => (arrive = resolve))).mockResolvedValueOnce(fakeDb());
    const first = incidentStore.get().catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(OPEN_TIMEOUT_MS);
    expect(await first).toBeInstanceOf(StorageUnavailable);
    arrive(late);
    await vi.advanceTimersByTimeAsync(0);
    expect(late.close).toHaveBeenCalledTimes(1);
    expect(late.get).not.toHaveBeenCalled();
    await incidentStore.get();
    expect(openDB).toHaveBeenCalledTimes(2);
  });

  it("a healthy open is reused, not reopened per call", async () => {
    const { incidentStore } = await load();
    openDB.mockResolvedValue(fakeDb());
    await incidentStore.get();
    await incidentStore.get();
    expect(openDB).toHaveBeenCalledTimes(1);
  });
});
