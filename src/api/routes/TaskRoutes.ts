import express from "express";
import taskController from "../controllers/TaskController";
const router = express.Router();

// route: /api/task/project/:projectId
router.get("/project/:projectId", taskController.getAllTasksByProjectId);

// route: /api/task/column
router.get("/column", taskController.getAllTasksByProjectId);

// route: /api/task/column
router.post("/project/:projectId", taskController.createOneTask);

export = router;
