import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import TokenPayload from "../interfaces/TokenPayload";

const SECRET_KEY = process.env.JWT_SECRET!;

const authorizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    req.tokenPayload = decoded; // Attach user details to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
export default authorizationMiddleware;
