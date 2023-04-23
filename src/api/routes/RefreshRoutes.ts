import express from "express";
import RefreshTokenController from "../controllers/RefreshTokenController";
const router = express.Router();

// route: /api/auth/login/
router.get("/", RefreshTokenController.refreshToken);

export = router;
