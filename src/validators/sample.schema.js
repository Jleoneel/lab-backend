const { z } = require("zod");

const changeStatusSchema = z.object({
  toStatus: z.enum(["EN_COLA", "EN_PROCESO", "LISTO_PARA_INFORME", "TERMINADO"]),
  note: z.string().optional().nullable(),
});

module.exports = { changeStatusSchema };
