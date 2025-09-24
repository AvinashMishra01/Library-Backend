// import jwt from "jsonwebtoken";

// const auth = (roles = []) => (req, res, next) => {
//   try {
//     const header = req.headers.authorization || req.headers.Authorization;
//     if (!header) return res.status(401).json({ msg: "No token provided" });

//     const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, role, email }

//     if (roles.length && !roles.includes(decoded.role)) return res.status(403).json({ msg: "Access denied" });

//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     return res.status(401).json({ msg: "Invalid or expired token" });
//   }
// };

// export default auth;

// middleware/authMiddleware.js
import jwt from "jsonwebtoken";


export  const  authMiddleware= (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log('middleware:-', authHeader);
  
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  //  console.log('token:- ', token, "secrate key", process.env.JWT_SECRET);
   
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload (id, role) to request
    // console.log('decoded', decoded);
    
    next();
  } catch (err) {
    console.log("error is ", err);
    
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

