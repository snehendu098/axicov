import { z } from "zod";

export type CastId = {
  hash: string;
  fid: number;
};

export const CastIdSchema = z.object({
  hash: z.string(),
  fid: z.number(),
});
