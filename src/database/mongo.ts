import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const mongoConnect = async () => {
    try {
        await connect(process.env.URL as string);
        console.log("conectado com sucesso")
    } catch (error) {
        console.log(error)
    }
}