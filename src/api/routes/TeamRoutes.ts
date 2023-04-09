import express from "express";
import teamController from "../controllers/TeamController";
const router = express.Router();

// route: /api/team/
router.get("/", teamController.getAllTeams);

// route: /api/team/:id
router.get("/:id", teamController.getTeamById);

// route: /api/team/
router.post("/", teamController.createNewTeam);

// route: /api/team/:id
router.put("/:id", teamController.updateOneTeam);

// route: /api/team/:id/AddMembers
router.put("/:id/AddMembers", teamController.updateTeamMembers);

// route: /api/team/:id
router.delete("/:id", teamController.deleteOneTeam);

export = router;
