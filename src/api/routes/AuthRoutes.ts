import express from "express";
import authController from "../controllers/AuthController";
const router = express.Router();

// route: /api/auth/register/
router.post("/register", authController.register);

// route: /api/auth/login/
router.post("/login", authController.login);

// route: /api/auth/logout/
router.get("/logout", authController.logout);

export = router;
