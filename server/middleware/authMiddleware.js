const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;


    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please sign in.",
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

 
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please sign in again.",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this area.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};