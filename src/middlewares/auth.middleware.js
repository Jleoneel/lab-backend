const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  const queryToken = req.query.token;
  const finalToken = (type === "Bearer" && token) ? token : queryToken;

  if (!finalToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authMiddleware };
