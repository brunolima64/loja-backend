import { RequestHandler } from "express";
import User from "../models/User";
import { z } from "zod";
const bcrypt = require("bcryptjs");

export const getUser: RequestHandler = async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.json({ error: "No Access Token" });
    }

    const validatorUserTokenBD = await User.findOne({ token: token });
    if (!validatorUserTokenBD) {
        return res.json({ error: "invalid token" });
    }

    res.json({ user: validatorUserTokenBD });
}

export const updateUser: RequestHandler = async (req, res) => {
    const { id } = req.params;

    const schemaUpdateUser = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        state: z.string().min(2).max(2).optional(),
        passwordHash: z.string().min(4).optional(),
    })
    const body = schemaUpdateUser.safeParse(req.body);
    type typeSchema = z.infer<typeof schemaUpdateUser>;

    if (!body.success) {
        return res.json({ error: "Dados inválidos" })
    }

    const updateUser: typeSchema = {};

    if (body.data.name) {
        updateUser.name = body.data.name.trim();
    }

    if (body.data.email) {
        updateUser.email = body.data.email.trim();
    }


    if (body.data.passwordHash) {
        const passwordHashBcrypt = await bcrypt.hash(body.data.passwordHash, 10);
        updateUser.passwordHash = passwordHashBcrypt;
    }

    if (body.data.state) {
        updateUser.state = body.data.state.toUpperCase().trim();
    }

    // Inserir usuario atualizado no DB
    const updated = await User.findOneAndUpdate({ _id: id }, updateUser);
    if (!updateUser) {
        return res.json({ error: "Ocorreu um erro" });
    }
    res.json({ user: updated });
}