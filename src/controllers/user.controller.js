const { prisma } = require("../db/prisma");
const bcrypt = require("bcrypt");

// Crear usuario
async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "El email ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: role || 'ANALYST',
        isActive: true
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch (e) { next(e); }
}

// Actualizar usuario
async function updateUser(req, res, next) {
  try {
    const { fullName, email, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(email ? { email } : {}),
        ...(role ? { role } : {}),
        ...(isActive != null ? { isActive } : {}),
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true }
    });

    res.json(user);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ message: "El email ya está en uso" });
    next(e);
  }
}

// Restablecer contraseña
async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash }
    });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (e) { next(e); }
}

// Obtener analistas
async function getAnalistas(req, res, next) {
  try {
    const analistas = await prisma.user.findMany({
      where: { role: 'ANALYST', isActive: true },
      select: { id: true, fullName: true, email: true, role: true }
    });
    res.json(analistas);
  } catch (e) { next(e); }
}

// Obtener todos los usuarios
async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (e) { next(e); }
}

module.exports = { createUser, updateUser, resetPassword, getAnalistas, getUsers };