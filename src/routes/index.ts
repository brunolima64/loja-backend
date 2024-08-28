import express from "express";
import * as adController from "../controllers/adController";
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import { authValidator } from "../middlewares/authValidator";
import multer from "multer";

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.get("/ping", authValidator, (req, res) => res.json({ pong: true }));

router.post("/signup/me", authController.signup)
router.get("/signin/me", authController.signin);

router.get("/user/me", authValidator, userController.getUser);
router.put("/user/me/:id", authValidator, userController.updateUser);

router.get("/category", authValidator, adController.getCategories);
router.get("/state", adController.getState);

router.get("/item", adController.getAll);
router.get("/item/:id", adController.getOne);
router.post("/item", upload.array('images', 12), authValidator, adController.create);
router.post("/item/:id", upload.array('images', 12), authValidator, adController.update);

router.get("/search/:slug", adController.search);


export default router;