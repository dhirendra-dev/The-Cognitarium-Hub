import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../client/src/pwa";

describe("PWA service-worker registration", () => {
  it("does not register in a development preview", () => {
    const register = vi.fn();
    const addLoadListener = vi.fn();

    registerServiceWorker(false, { register }, addLoadListener);

    expect(addLoadListener).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  });

  it("registers the generated worker in production after window load", async () => {
    const registration = { scope: "/" } as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);
    let loadListener: (() => void) | undefined;

    registerServiceWorker(true, { register }, (listener) => {
      loadListener = listener;
    });

    expect(loadListener).toBeTypeOf("function");
    expect(register).not.toHaveBeenCalled();

    loadListener?.();
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });
});
