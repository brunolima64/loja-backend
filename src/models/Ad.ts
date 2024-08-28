import { connection, Model, model, Schema } from "mongoose"

type AdType = {
    idUser: string;
    state: string;
    category: string;
    images: [object];
    dateCreated: Date;
    title: String;
    price: Number;
    priceNegotiable: boolean;
    description: string;
    views: number;
    status: string;
}

const schema = new Schema<AdType>({
    idUser: String,
    state: String,
    category: String,
    images: [Object],
    dateCreated: Date,
    title: String,
    price: Number,
    priceNegotiable: Boolean,
    description: String,
    views: Number,
    status: String,
})

const modelName: string = "Ad";

export default (connection && connection.models[modelName]) ?
    connection.models[modelName] as Model<AdType>
    :
    model<AdType>(modelName, schema)
    ;