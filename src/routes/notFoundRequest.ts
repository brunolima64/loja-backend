import { RequestHandler } from "express";

export const notFoundRequest: RequestHandler = (req, res) => {
    res.status(404).json({ error: "route not found" })
}