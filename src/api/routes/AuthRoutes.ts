import { Router } from "express";
const router: Router = require("express").Router();
const authController = require("../controllers/AuthController");

// route: /api/user/register/
router.post("/register", authController.register);

// route: /api/user/login/
router.post("/login", authController.login);

export = router;
