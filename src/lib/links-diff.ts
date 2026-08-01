import type { DraftLinkInputValue } from "@/lib/validation";

export interface LinksDiff {
  toUpdate: DraftLinkInputValue[];
  toInsert: DraftLinkInputValue[];
  toDeleteIds: string[];
}

export function computeLinksDiff(existingIds: string[], draftLinks: DraftLinkInputValue[]): LinksDiff {
  const toUpdate = draftLinks.filter((link) => !link.isNew);
  const toInsert = draftLinks.filter((link) => link.isNew);

  const submittedExistingIds = new Set(toUpdate.map((link) => link.id));
  const toDeleteIds = existingIds.filter((id) => !submittedExistingIds.has(id));

  return { toUpdate, toInsert, toDeleteIds };
}
