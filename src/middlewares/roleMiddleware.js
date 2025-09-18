// middleware/roleMiddleware.js
export const  roleMiddleware= (roles = []) => {
  return (req, res, next) => {
    console.log("role middle ware", req, roles)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient role." });
    }
    next();
  };
};
