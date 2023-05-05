import express from "express";
import projectController from "../controllers/ProjectController";
const router = express.Router();

// route: /api/project/:projectId
router.get("/:projectId", projectController.getProjectById);

// route: /api/project/overview/:teamId
router.get("/overview/:teamId", projectController.getAllProjects);

// route: /api/project
router.post("/", projectController.createNewProject);

// route: /api/project/:projectId
router.put("/:projectId", projectController.updateOneProject);

// route: /api/project/:projectId/AddColumns/:columnId/
router.put("/:projectId/AddColumn", projectController.addNewColumnToProject);

// route: /api/project/:projectId/DeleteColumns/:columnId
router.put(
  "/:projectId/DeleteColumn/:columnId",
  projectController.deleteColumnFromProject
);

// route: /api/project/:projectId/ChangeColumnOrder
router.put(
  "/:projectId/ChangeColumnOrder",
  projectController.changeColumnOrderOnProject
);

// route: /api/project/:projectId/column
router.put("/:projectId/column", projectController.updateColumn);

// route: /api/project/:projectId
router.delete("/:projectId", projectController.deleteOneProject);

export = router;
