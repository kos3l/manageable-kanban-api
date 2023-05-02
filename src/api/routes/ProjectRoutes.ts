import express from "express";
import projectController from "../controllers/ProjectController";
const router = express.Router();

// route: /api/project/:teamId
router.get("/:teamId", projectController.getAllProjects);

router.post("/", projectController.createNewProject);

export = router;
