import teamService from "../services/TeamService";

const verifyIfUserCanAccessTheTeam = async (userId: string, teamId: string) => {
  // verifies access to the team
  // at the same time it detects when team is deleted and throws an error
  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    throw new Error(
      "The user needs to be a part of the team to preview it's projects"
    );
  }
  return isUserInTheTeam;
};

const accessController = {
  verifyIfUserCanAccessTheTeam,
};

export default accessController;
