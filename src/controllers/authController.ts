import { RequestHandler } from "express";
import User from "../models/User";
import State from "../models/State";
import { z } from "zod";

const bcrypt = require("bcryptjs");

export const signup: RequestHandler = async (req, res) => {

    const schemaSignUp = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        state: z.string(),
        passwordHash: z.string().min(4),
    })
    const body = schemaSignUp.safeParse(req.body);
    if (!body.success) {
        return res.json({ error: "Dados inválidos" })
    }

    const stateValidatorBD = await State.findOne({ name: body.data.state });
    if (!stateValidatorBD) {
        return res.json({ error: "Selecione um estado válido" });
    }

    const emailValidatorBD = await User.findOne({ email: body.data.email })
    if (emailValidatorBD) {
        return res.json({ error: "E-mail já existente" });
    }

    const passwordHashBcrypt = await bcrypt.hash(body.data.passwordHash, 10);

    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    const newUser = await User.create({
        name: body.data.name,
        email: body.data.email,
        state: body.data.state,
        passwordHash: passwordHashBcrypt,
        token: token,
    });

    if (newUser) {
        res.status(201).json({ newUser });
    }
}

export const signin: RequestHandler = async (req, res) => {
    const schemaSignUp = z.object({
        email: z.string().email(),
        passwordHash: z.string().min(4),
    })
    const body = schemaSignUp.safeParse(req.body);
    if (!body.success) {
        return res.json({ error: "Dados inválidos" })
    }

    const emailDB = await User.findOne({ email: body.data.email });
    if (!emailDB) {
        return res.json({ error: "E-mail/senha inválidos" });
    }

    const passwordHashDecrypt = await bcrypt.compare(body.data.passwordHash, emailDB.passwordHash);
    if (!passwordHashDecrypt) {
        return res.json({ error: "E-mail/senha inválidos" });
    }

    const user = await User.findOne({ email: body.data.email });
    res.json({ user: user });
}