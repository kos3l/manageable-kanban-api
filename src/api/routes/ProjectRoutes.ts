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

// route: /api/project/AddColumns/:projectId/team/:teamId/
router.put(
  "/:projectId/AddColumn/team/:teamId",
  projectController.addNewColumnToProject
);

// route: /api/project/DeleteColumns/:projectId/team/:teamId/
router.put(
  "/:projectId/DeleteColumn/:columnId/team/:teamId",
  projectController.deleteColumnFromProject
);

// route: /api/project/ChangeColumnOrder/:projectId/team/:teamId/
router.put(
  "/:projectId/ChangeColumnOrder/team/:teamId",
  projectController.changeColumnOrderOnProject
);

// // route: /api/project/ChangeColumnOrder/:projectId/team/:teamId/
// router.put(
//   "/column/:projectId/team/:teamId",
//   projectController.addNewColumnToProject
// );

export = router;
