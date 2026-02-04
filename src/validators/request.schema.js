const { z } = require("zod");

const createRequestSchema = z.object({
  clientId: z.string().uuid(),
  quoteId: z.string().uuid().optional().nullable(),
  samples: z.array(
    z.object({
      sampleName: z.string().min(1).optional().nullable(),
      description: z.string().min(1).optional().nullable(),
    })
  ).min(1),
});

module.exports = { createRequestSchema };
