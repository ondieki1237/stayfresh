import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key")
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

export const adminMiddleware = (req, res, next) => {
  // In a real app, check if user has admin role
  // For now, we'll check for a special admin token or ID
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key")
    
    // Check if user is admin (you can modify this logic)
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }
    
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}
