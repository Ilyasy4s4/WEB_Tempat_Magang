import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        tenantId: string | null;
        role: string;
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization header tidak ditemukan."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token tidak ditemukan."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as {
            id: string;
            tenantId: string | null;
            role: string;
        };

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token tidak valid."
        });

    }

};