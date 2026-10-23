import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("library public catalog", () => {
  it("returns books for the public catalog", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.list();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("availableCopies");
  });

  it("returns a readable book detail by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.getById({ id: 101 });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Les Années");
    expect(result?.summary).toContain("mémoire");
  });

  it("supports advanced search pagination and availability filters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.search({ availableOnly: true, page: 1, pageSize: 9, sort: "availability" });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThanOrEqual(9);
    expect(result.items.every(book => book.availableCopies > 0)).toBe(true);
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
  });
});
