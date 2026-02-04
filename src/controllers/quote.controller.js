    const { createQuoteSchema } = require("../validators/quote.schema");
const { createQuote, getQuoteById, listQuotes } = require("../services/quote.service");

async function postQuote(req, res, next) {
  try {
    const body = createQuoteSchema.parse(req.body);
    const created = await createQuote(body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function getQuote(req, res, next) {
  try {
    const q = await getQuoteById(req.params.id);
    if (!q) return res.status(404).json({ message: "Cotización no encontrada" });
    res.json(q);
  } catch (e) { next(e); }
}

async function getQuotes(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const take = req.query.take ? Number(req.query.take) : 20;
    const data = await listQuotes({ q, take: Number.isFinite(take) ? take : 20 });
    res.json(data);
  } catch (e) { next(e); }
}

module.exports = { postQuote, getQuote, getQuotes };
