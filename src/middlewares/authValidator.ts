import { RequestHandler } from "express";
import User from "../models/User";

export const authValidator: RequestHandler = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ error: "No access token" });
    }

    // Verifica se existe algum usuario no BD com o token recebido na req;
    const verificatedToken = await User.findOne({ token: token });
    if (!verificatedToken) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    next();
}