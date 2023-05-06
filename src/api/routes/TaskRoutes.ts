import express from "express";
import taskController from "../controllers/TaskController";
const router = express.Router();

// RETHINK labels!!

// route: /api/task/project/:projectId
router.get("/project/:projectId", taskController.getAllTasksByProjectId);

// all tasks for a column of a project
// route: /api/task/column
router.get("/column", taskController.getAllTasksByColumn);

// task by task id

// route: /api/task/column
router.post("/project/:projectId", taskController.createOneTask);

// update task main info

// update task order in column

// delete task

export = router;
