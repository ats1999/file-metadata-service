import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // NOTE: not validating user by opt/email just to keep it simple for now
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
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

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
        expiresIn: "30d",
    });

    res.status(200).json({ message: "Login successful", token });
};
