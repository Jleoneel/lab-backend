const { z } = require("zod");

const createClientSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

const updateClientSchema = createClientSchema.partial();

module.exports = { createClientSchema, updateClientSchema };
