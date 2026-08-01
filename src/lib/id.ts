import { z } from "zod";

const UuidSchema = z.string().uuid();

export function isValidId(id: string): boolean {
  return UuidSchema.safeParse(id).success;
}
