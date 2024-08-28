import { connection, Model, model, Schema } from "mongoose"

type UserType = {
    name: string;
    slug: string;
}

const schema = new Schema<UserType>({
    name: String,
    slug: String,
})

const modelName: string = "Category";

export default (connection && connection.models[modelName]) ?
    connection.models[modelName] as Model<UserType>
    :
    model<UserType>(modelName, schema)
    ;