const { z } = require("zod");

const createQuoteSchema = z.object({
  clientId: z.string().uuid(),
  priceList: z.enum(["EXTERNO", "ESTUDIANTE"]),
  ivaPercent: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]).optional(),
  validUntil: z.string().datetime().optional(),
  items: z.array(
    z.object({
      serviceId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

module.exports = { createQuoteSchema };
