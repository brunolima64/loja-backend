import express from "express";
import helmet from "helmet";
import path from "path";
import router from "./routes";
import { notFoundRequest } from "./routes/notFoundRequest";
import { requestHandlerError } from "./routes/requestHandlerError";
import { mongoConnect } from "./database/mongo";
import dotenv from "dotenv";
const cors = require('cors');

dotenv.config();

mongoConnect();

const server = express();

server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "../public/assets/images")));
server.use(express.static(path.join(__dirname, "../public/assets")));


server.use("/", router);
server.use('/signup/me', router);
server.use(notFoundRequest);
server.use(requestHandlerError);

let PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 Servidor rodando em: http://localhost:" + PORT);
})

