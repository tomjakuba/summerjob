import extendZodForOpenAPI from "lib/api/extendZodForOpenAPI";
import { LoggingSchema } from "lib/prisma/zod";
import { z } from "zod";

extendZodForOpenAPI;

export const LogsResponseSchema = z.object({
  logs: z.array(LoggingSchema),
  total: z.number().openapi({
    description: "Total number of logs in the database.",
    example: 500,
  }),
});

export type LogsResponse = z.infer<typeof LogsResponseSchema>;
