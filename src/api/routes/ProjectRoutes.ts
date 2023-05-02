import express from "express";
import projectController from "../controllers/ProjectController";
const router = express.Router();

// route: /api/project/
router.get("/", projectController.getAllProjects);

export = router;
