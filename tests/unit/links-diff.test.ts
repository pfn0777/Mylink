import { describe, it, expect } from "vitest";
import { computeLinksDiff } from "@/lib/links-diff";
import type { DraftLinkInputValue } from "@/lib/validation";

function link(overrides: Partial<DraftLinkInputValue> & Pick<DraftLinkInputValue, "id" | "isNew">): DraftLinkInputValue {
  return {
    type: "custom",
    label: "Label",
    value: "https://example.com",
    position: 0,
    ...overrides,
  } as DraftLinkInputValue;
}

describe("computeLinksDiff", () => {
  it("treats every submitted link as an insert when nothing existed before", () => {
    const draft = [link({ id: "new-1", isNew: true }), link({ id: "new-2", isNew: true })];
    const diff = computeLinksDiff([], draft);

    expect(diff.toInsert).toHaveLength(2);
    expect(diff.toUpdate).toHaveLength(0);
    expect(diff.toDeleteIds).toHaveLength(0);
  });

  it("deletes every existing id that is no longer present in the submission", () => {
    const diff = computeLinksDiff(["a", "b", "c"], []);

    expect(diff.toDeleteIds.sort()).toEqual(["a", "b", "c"]);
    expect(diff.toUpdate).toHaveLength(0);
    expect(diff.toInsert).toHaveLength(0);
  });

  it("only reorders (updates) when the same ids are resubmitted with new positions", () => {
    const draft = [
      link({ id: "a", isNew: false, position: 0 }),
      link({ id: "b", isNew: false, position: 1 }),
    ];
    const diff = computeLinksDiff(["b", "a"], draft);

    expect(diff.toUpdate.map((l) => l.id).sort()).toEqual(["a", "b"]);
    expect(diff.toDeleteIds).toHaveLength(0);
    expect(diff.toInsert).toHaveLength(0);
  });

  it("handles a mixed add + edit + delete + reorder submission in one pass", () => {
    const draft = [
      link({ id: "b", isNew: false, label: "Edited", position: 0 }),
      link({ id: "new-1", isNew: true, position: 1 }),
    ];
    const diff = computeLinksDiff(["a", "b"], draft);

    expect(diff.toUpdate.map((l) => l.id)).toEqual(["b"]);
    expect(diff.toUpdate[0]?.label).toBe("Edited");
    expect(diff.toInsert.map((l) => l.id)).toEqual(["new-1"]);
    expect(diff.toDeleteIds).toEqual(["a"]);
  });
});
