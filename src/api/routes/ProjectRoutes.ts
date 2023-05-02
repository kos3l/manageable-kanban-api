import express from "express";
import projectController from "../controllers/ProjectController";
const router = express.Router();

// route: /api/project/:projectId/Team/:teamId
router.get("/:projectId/Team/:teamId", projectController.getProjectById);

// route: /api/project/Overview/:teamId
router.get("/Overview/:teamId", projectController.getAllProjects);

// route: /api/project
router.post("/", projectController.createNewProject);

// route: /api/project
router.put("/:projectId/Team/:teamId", projectController.updateOneProject);

export = router;
