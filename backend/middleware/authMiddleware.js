// authMiddleware.js
module.exports = function (allowedRoles) {
  return function (req, res, next) {
    const user = req.user;  // Assumes req.user is populated by some auth system (e.g., JWT middleware)

    if (!user || !user.role) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    next();
  };
};
