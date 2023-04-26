import express from "express";
import TokenController from "../controllers/TokenController";
const router = express.Router();

// route: /api/token/refresh/login/
router.get("/refresh", TokenController.refreshToken);

export = router;
