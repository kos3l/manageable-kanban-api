import express from "express";
import authController from "../controllers/AuthController";
const router = express.Router();

// route: /api/user/register/
router.post("/register", authController.register);

// route: /api/user/login/
router.post("/login", authController.login);

export = router;
