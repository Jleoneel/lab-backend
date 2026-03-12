const { prisma } = require("../db/prisma");

const { createQuoteSchema } = require("../validators/quote.schema");
const {
  createQuote,
  getQuoteById,
  listQuotes,
} = require("../services/quote.service");
const { convertQuoteToRequest } = require("../services/quoteConvert.service");


async function postQuote(req, res, next) {
  try {
    const body = createQuoteSchema.parse(req.body);
    const created = await createQuote(body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

async function getQuote(req, res, next) {
  try {
    const q = await getQuoteById(req.params.id);
    if (!q)
      return res.status(404).json({ message: "Cotización no encontrada" });
    res.json(q);
  } catch (e) {
    next(e);
  }
}

async function convertQuote(req, res, next) {
  try {
    const { id } = req.params;
    const { samples } = req.body;
    const userId = req.user?.sub || null;

    const result = await convertQuoteToRequest(id, { samples }, userId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function getQuotes(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const take = req.query.take ? Number(req.query.take) : 20;
    const data = await listQuotes({
      q,
      take: Number.isFinite(take) ? take : 20,
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

// AGREGAR ESTO a quote.controller.js
async function updateQuoteStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado sea válido (según tu enum en Prisma)
    const validStatuses = ['DRAFT', 'SENT', 'APPROVED', 'CANCELLED', 'CONVERTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    // Convertir id a número (si tu DB usa Int)
    const quoteId = parseInt(id);

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: { status },
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error("Error en updateQuoteStatus:", error);
    next(error);
  }
}

const { updateQuote } = require('../services/quote.service');

async function putQuote(req, res, next) {
  try {
    const body = createQuoteSchema.parse(req.body);
    const updated = await updateQuote(req.params.id, body);
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

module.exports = { postQuote, getQuote, getQuotes, convertQuote, updateQuoteStatus, putQuote };
