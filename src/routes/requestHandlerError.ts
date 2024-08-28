import { RequestHandler } from "express";

export const requestHandlerError: RequestHandler = (req, res) => {
    res.status(501).json({ error: 'Error internal' });
}