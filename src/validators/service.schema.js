const { z } = require("zod");

const decimalLike = z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]);

const createServiceSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  priceExternal: decimalLike,
  priceStudent: decimalLike,
  isActive: z.boolean().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

module.exports = { createServiceSchema, updateServiceSchema };
