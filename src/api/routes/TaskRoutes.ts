import express from "express";
import taskController from "../controllers/TaskController";
const router = express.Router();

// RETHINK labels!!
// assign task to user!!!

// route: /api/task/project/:projectId
router.get("/project/:projectId", taskController.getAllTasksByProjectId);

// route: /api/task/column
router.get("/column", taskController.getAllTasksByColumn);

// route: /api/task/:taskId
router.get("/:taskId", taskController.getOneTaskById);

// route: /api/task/column
router.post("/project/:projectId", taskController.createOneTask);

// route: /api/task/:taskId
router.put("/:taskId", taskController.updateOneTask);

// update task order in column
router.put("/column/order", taskController.updateTasksOrderInColumn);

// add users to task

// remove users from task

// route: /api/task/:taskId
router.delete("/:taskId", taskController.deleteOneTask);

export = router;
