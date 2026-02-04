function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden (ADMIN only)" });
  }
  next();
}

module.exports = { requireAdmin };
