
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

