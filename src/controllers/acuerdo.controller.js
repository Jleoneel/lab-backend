const { prisma } = require('../db/prisma');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const TEMPLATE_PATH = path.join(__dirname, '../../uploads/templates/acuerdo.pdf');

async function generarCodigo() {
    const ultimo = await prisma.acuerdoConfidencialidad.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    if (!ultimo) return 'CABA-ADM-AC-00001';
    const num = parseInt(ultimo.codigo.split('-').pop()) + 1;
    return `CABA-ADM-AC-${String(num).padStart(5, '0')}`;
}

async function generarAcuerdo(req, res, next) {
    try {
        const { quoteId } = req.params;

        const quote = await prisma.quote.findUnique({
            where: { id: parseInt(quoteId) },
            include: { client: true }
        });
        if (!quote) return res.status(404).json({ message: 'Cotización no encontrada' });

        if (!fs.existsSync(TEMPLATE_PATH)) {
            return res.status(500).json({ message: 'Template no encontrado. Súbelo en Ajustes.' });
        }

        // Crear o reutilizar acuerdo
        let acuerdo = await prisma.acuerdoConfidencialidad.findFirst({
            where: { quoteId: parseInt(quoteId) }
        });
        if (!acuerdo) {
            const codigo = await generarCodigo();
            acuerdo = await prisma.acuerdoConfidencialidad.create({
                data: {
                    codigo,
                    version: '1.0',
                    clientId: quote.clientId,
                    quoteId: parseInt(quoteId),
                    creadoPor: req.user?.fullName || 'Administrador',
                }
            });
        }

        const fecha = new Date(quote.createdAt).toLocaleDateString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Generar PDF con pdf-lib
        const templateBytes = fs.readFileSync(TEMPLATE_PATH);
        const pdfDoc = await PDFDocument.load(templateBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pages = pdfDoc.getPages();
        const p1 = pages[0];
        const p2 = pages[1];
        const H1 = p1.getHeight();
        const H2 = p2.getHeight();
        const sz = 11;

        // Página 1
        p1.drawText(acuerdo.codigo, { x: 311, y: H1 - 188.6, font, size: sz });
        p1.drawText(acuerdo.version, { x: 311, y: H1 - 216.7, font, size: sz });
        p1.drawText(fecha, { x: 311, y: H1 - 244.8, font, size: sz });
        p1.drawText('Indefinida', { x: 311, y: H1 - 272.9, font, size: sz });

        // Página 2 — firmas
        p2.drawText(acuerdo.creadoPor, { x: 97, y: H2 - 414, font, size: sz });
        p2.drawText('Resp. de Laboratorios CABA', { x: 97, y: H2 - 456, font, size: sz });
        p2.drawText(quote.client.name, { x: 301, y: H2 - 414, font, size: sz });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="acuerdo-${acuerdo.codigo}.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (e) { next(e); }
}

async function marcarFirmado(req, res, next) {
    try {
        const { clientId } = req.params;
        const client = await prisma.client.update({
            where: { id: clientId },
            data: { acuerdoFirmado: true, fechaAcuerdo: new Date() }
        });
        res.json(client);
    } catch (e) { next(e); }
}

async function getAcuerdosByCliente(req, res, next) {
    try {
        const acuerdos = await prisma.acuerdoConfidencialidad.findMany({
            where: { clientId: req.params.clientId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(acuerdos);
    } catch (e) { next(e); }
}

async function subirArchivoFirmado(req, res, next) {
    try {
        const { acuerdoId } = req.params;
        if (!req.file) return res.status(400).json({ message: 'No se subió archivo' });
        const archivoUrl = `/uploads/acuerdos/${req.file.filename}`;
        const acuerdo = await prisma.acuerdoConfidencialidad.update({
            where: { id: acuerdoId },
            data: { archivoUrl }
        });
        res.json(acuerdo);
    } catch (e) { next(e); }
}

async function subirTemplate(req, res, next) {
    try {
        if (!req.file) return res.status(400).json({ message: 'No se subió archivo' });
        const destPath = TEMPLATE_PATH;
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.renameSync(req.file.path, destPath);
        res.json({ message: 'Template actualizado correctamente' });
    } catch (e) { next(e); }
}

module.exports = { generarAcuerdo, marcarFirmado, getAcuerdosByCliente, subirArchivoFirmado, subirTemplate };