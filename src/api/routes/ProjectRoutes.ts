import express from "express";
import projectController from "../controllers/ProjectController";
const router = express.Router();

// route: /api/project/:projectId/team/:teamId
router.get("/:projectId/Team/:teamId", projectController.getProjectById);

// route: /api/project/overview/:teamId
router.get("/overview/:teamId", projectController.getAllProjects);

// route: /api/project
router.post("/", projectController.createNewProject);

// route: /api/project/:projectId/team/:teamId
router.put("/:projectId/team/:teamId", projectController.updateOneProject);

// route: /api/project/columns/:projectId/team/:teamId
router.put(
  "/columns/:projectId/team/:teamId",
  projectController.updateProjectColumns
);

export = router;
