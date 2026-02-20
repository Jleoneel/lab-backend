const { z } = require("zod");
const assignServicesSchema = z.object({
  serviceIds: z.array(z.string().uuid()).min(1),
});
module.exports = { assignServicesSchema };