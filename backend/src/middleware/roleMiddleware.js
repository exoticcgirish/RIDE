module.exports = function allowedRoles(roles = []) {
  if (!Array.isArray(roles)) roles = [roles];

  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    if (!userRole) {
      return res.status(401).json({ message: "Access denied" });
    }

    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
