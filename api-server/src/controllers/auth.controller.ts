import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;
const AUTH_TOKEN_EXPIRY = process.env.AUTH_TOKEN_EXPIRY || "30d";

const isBodyValid = (body: any): boolean => {
  const { email, password } = body;
  return (
    typeof email === "string" &&
    typeof password === "string" &&
    email.trim() !== "" &&
    password.trim() !== ""
  );
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  if (!isBodyValid(req.body)) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // NOTE: not validating user by OTP/email, just to keep it simple for now
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", userId: user.id });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  if (!isBodyValid(req.body)) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const { email, password } = req.body;

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: AUTH_TOKEN_EXPIRY as any,
  });

  res.status(200).json({ message: "Login successful", token });
};
