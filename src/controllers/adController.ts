import { RequestHandler } from "express";
import Ad from "../models/Ad";
import State from "../models/State";
import Category from "../models/Category";
import sharp from "sharp";
import User from "../models/User";
import { NewAdType } from "../types/NewAdType";

export const getCategories: RequestHandler = async (req, res) => {
    const cats = await Category.find({});
    if (!cats) {
        return res.json({ error: "Ocorreu um erro" })
    }

    let categories = cats.map(cat => ({
        ...cat.toObject(), // Converte os dados do Mongoose em um objeto js
        img: `${process.env.BASE_PRODUCTION}/assets/images/${cat.slug}.png`,
    }));

    res.json({ categories: categories });
}

export const getState: RequestHandler = async (req, res) => {
    const states = await State.find({});
    return res.json({ states: states });
}

export const getAll: RequestHandler = async (req, res) => {
    const { sort = "asc", skip, limit, state, cat, q } = req.query;

    let skipAd = parseInt(skip as string) || 0;
    let limitAd = parseInt(limit as string) || 10;

    type inputFilterType = {
        title?: RegExp;
        state?: string;
        category?: string;
    }
    let inputFilter: inputFilterType = {};

    if (q) {
        const regex = new RegExp(q.toString(), "i");
        inputFilter.title = regex;
    }

    if (state) {
        inputFilter.state = state.toString().toUpperCase();
    }

    if (cat) {
        inputFilter.category = cat.toString().toLowerCase();
    }

    type SortOrderType = 1 | -1;
    let sortOrder: SortOrderType = (sort === "asc" ? 1 : -1);

    const ads = await Ad.find(inputFilter)//
        .sort({ title: sortOrder })
        .skip(skipAd)
        .limit(limitAd);

    if (!ads) {
        return res.json({ error: "Ocorreu um erro" });
    }

    res.json({ ads: ads });
}

export const getOne: RequestHandler = async (req, res) => {
    const { id } = req.params;

    let ad = await Ad.findOne({ _id: id });
    if (!ad) {
        return res.json({ error: "Ocorreu um erro" });
    }
    ad.views = ad.views + 1;
    await ad.save();

    // Pega os ads do mesmo usuario 
    let others = [];
    let searchOthers = await Ad.find({ idUser: ad.idUser });
    for (let i in searchOthers) {
        if (searchOthers[i].title !== ad.title) {
            others.push(searchOthers[i]);
        }
    }

    res.json({ ad: ad, others: others });
}

export const create: RequestHandler = async (req, res) => {

    let addNewAd: NewAdType = {
        idUser: "",
        state: "",
        category: "",
        images: [],
        dateCreated: new Date(),
        title: "",
        price: 0,
        priceNegotiable: false,
        description: "",
        views: 1,
        status: "",
    };

    // images
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
        return res.json({ error: "Nenhum arquivo recebido" })
    }

    let images = [];

    for (let i in files) {
        if (!files[i].mimetype.includes('image')) {
            return res.status(400).json({ error: 'Um ou mais arquivos não são imagens.' });
        } else {

            await sharp(files[i].path)
                .resize(500, 500, { fit: "cover" })
                .jpeg()
                .toFile("public/assets/" + files[i].filename + ".jpeg");


            images.push({
                url: `${process.env.BASE_PRODUCTION}/assets/${files[i].filename}.jpeg`,
                default: false,
            })
        }
    }

    for (let i in images) {
        addNewAd.images.push(images[i]);
    }
    addNewAd.images[0].default = true;

    // idUser
    if (!req.body.idUser) {
        return res.json({ error: "Ocorreu um erro" })
    }

    const idUser = await User.findOne({ _id: req.body.idUser });
    if (!idUser) {
        return res.json({ error: "Ocorreu um erro" })
    } else {
        addNewAd.idUser = req.body.idUser;
    }

    // state
    const state = await State.findOne({ name: req.body.state.toUpperCase() });
    if (!state) {
        return res.json({ error: "Estado não é valido" })
    } else {
        addNewAd.state = req.body.state.toUpperCase();
    }

    // category
    const category = await Category.findOne({ name: req.body.category.toLowerCase() });
    if (!category) {
        return res.json({ error: "Categoria não é valida" })
    } else {
        addNewAd.category = req.body.category.toLowerCase();
    }

    // title 
    if (!req.body.title || req.body.title.length < 2) {
        return res.json({ error: "Titulo inválido" })
    }
    addNewAd.title = req.body.title;


    // price
    if (req.body.price) {
        let price = req.body.price.replace(",", ".").replace("$", "");
        addNewAd.price = price;
    }

    // priceNegotiable
    if (req.body.priceNegotiable && req.body.priceNegotiable === "true") {
        addNewAd.priceNegotiable = req.body.priceNegotiable = true;
    } else {
        addNewAd.priceNegotiable = req.body.priceNegotiable = false;
    }

    const NewAd = await Ad.create({
        idUser: addNewAd.idUser,
        category: addNewAd.category,
        state: addNewAd.state,
        status: addNewAd.status,
        images: addNewAd.images,
        dateCreated: addNewAd.dateCreated,
        title: addNewAd.title,
        price: addNewAd.price,
        description: addNewAd.description,
        priceNegotiable: addNewAd.priceNegotiable,
        views: addNewAd.views
    });
    if (NewAd) {
        return res.status(201).json({ ad: NewAd });
    }
    res.json({ error: "Ocorreu um erro" });
}

export const update: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { title, price, priceNegotiable, description, state, category } = req.body;

    const updateBD = await Ad.findOne({ _id: id });
    if (!updateBD) {
        return res.json({ error: "Ocorreu um erro" });
    }

    if (state) {
        const stateDB = await State.find({ name: state.toUpperCase() });
        if (!stateDB) {
            res.json({ error: "Estado inválido" });
        }
        updateBD.state = state.toUpperCase();
    }

    if (category) {
        const categoryDB = await Category.find({ name: category.toLowerCase() });
        if (!categoryDB) {
            res.json({ error: "Estado inválido" });
        }
        updateBD.category = category.toLowerCase();
    }

    if (title) {
        updateBD.title = title;
    }

    if (price) {
        let priceFormat = price.replace("$", "").replace(",", ".")
        updateBD.price = parseFloat(priceFormat);
    }

    if (priceNegotiable) {
        updateBD.priceNegotiable = priceNegotiable === "false" ? false : true;
    }

    if (description) {
        updateBD.description = description;
    }


    // images
    let images = [];
    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > 0) {

        for (let i in files) {
            if (files[i].mimetype.includes('image')) {

                await sharp(files[i].path)
                    .resize(500, 500, { fit: "cover" })
                    .jpeg()
                    .toFile("public/assets/" + files[i].filename + ".jpeg");

                images.push({
                    url: `${process.env.BASE_PRODUCTION}/assets/${files[i].filename}.jpeg`,
                    default: false,
                });
            }
        }
    }

    for (let i in images) {
        updateBD.images.push(images[i]);
    }

    await updateBD.save();
    res.json({ ad: updateBD });
}

export const search: RequestHandler = async (req, res) => {
    const { slug } = req.params;

    const regex = new RegExp(slug, "i");

    const searchAds = await Ad.find({ title: regex });
    if (!search) {
        return res.json({ error: "Não existe um anúncio com esse nome" });
    }

    res.json({ ads: searchAds });
}

