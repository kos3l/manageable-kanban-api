import express from "express";
import userController from "../controllers/UserController";
const router = express.Router();

// route: /api/user/:id
router.get("/:id", userController.getUserById);

// route: /api/user/:id
router.get("/email", userController.getUserByEmail);

// route: /api/user/:id
router.put("/:id", userController.updateOneUser);

export = router;
