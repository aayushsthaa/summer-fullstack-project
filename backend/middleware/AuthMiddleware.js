const { verify } = require("jsonwebtoken");

function validateTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, accessToken] = authHeader.split(" ");

  if (scheme !== "Bearer" || !accessToken || accessToken === "null") {
    return res.status(401).json({ message: "User is not Authenticated" });
  }

  try {
    const decoded = verify(accessToken, process.env.AUTH_SECRET_KEY);
    // Attach decoded payload (expects you signed { id, role, ... })
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  validateTokenMiddleware,
};