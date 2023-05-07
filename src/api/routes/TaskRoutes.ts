import express from "express";
import taskController from "../controllers/TaskController";
const router = express.Router();

// RETHINK labels!!
// delete project

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

// route: /api/task/column/order
router.put("/column/order", taskController.updateTasksOrderInColumn);

// route: /api/task/:taskId/AddUser
router.put("/:taskId/AddUser", taskController.addUserToTask);

// route: /api/task/:taskId/RemoveUser
router.put("/:taskId/RemoveUser", taskController.removeUserFromTask);

// route: /api/task/:taskId
router.delete("/:taskId", taskController.deleteOneTask);

export = router;
