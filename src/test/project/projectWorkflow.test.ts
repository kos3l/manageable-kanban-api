process.env.NODE_ENV = "test";
import { app } from "../../server";
import { User } from "../../api/models/schemas/UserSchema";
import chai, { should } from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
import { Project } from "../../api/models/schemas/ProjectSchema";
import { ProjectDocument } from "../../api/models/documents/ProjectDocument";
chai.use(chaiHttp);

afterEach((done) => {
  User.deleteMany({}).then((res) =>
    Project.deleteMany({}).then((res) => done())
  );
});

describe("Project workflow tests - Happy scenarios", () => {
  // Mock data
  let user1 = {
    firstName: "Sarah",
    lastName: "Connor",
    email: "doomsday@email.com",
    password: "123123",
    birthdate: "1998-07-22 18:00:00.000",
  };

  let userLogin = {
    email: "doomsday@email.com",
    password: "123123",
  };

  let project = {
    name: "Test Project",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    techStack: ["Nextjs", "React"],
    startDate: "2023-07-11 10:47:00.000Z",
    endDate: "2023-10-14 19:55:00.000Z",
  };

  let updateProject = {
    name: "Test Project Extra",
    techStack: ["Nextjs", "React", "Mongodb"],
  };

  it("/POST - should register + login a user + create 1 project", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;

                done();
              });
          });
      });
  });

  it("/GET:id - should register + login a user + create 1 project + get the project by id", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;
                const projectId = res.body._id;

                agent
                  .get("/api/project/" + projectId)
                  .set("auth-token", token)
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body.name).to.equal(projectDto.name);
                    expect(res.body.teamId).to.equal(projectDto.teamId);

                    done();
                  });
              });
          });
      });
  });

  it("/GET/overview/:teamId - should register + login a user + create 1 project + get the project by teamId", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;

                agent
                  .get("/api/project/overview/" + teamId)
                  .set("auth-token", token)
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
                    expect(res.body).to.satisfy(function (
                      project: ProjectDocument[]
                    ) {
                      return project.every((pro) => pro.teamId == teamId);
                    });
                    done();
                  });
              });
          });
      });
  });

  it("/GET/user - should register + login a user + create 1 project + get all projects based on logged in users teams", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;

                agent
                  .get("/api/project/user")
                  .set("auth-token", token)
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);

                    done();
                  });
              });
          });
      });
  });

  it("/PUT:id - should register + login a user + create 1 project + update the project", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;
                const projectId = res.body._id;

                agent
                  .put("/api/project/" + projectId)
                  .send(updateProject)
                  .set("auth-token", token)
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body.message).to.equal(
                      "Project's information was succesfully updated."
                    );

                    agent
                      .get("/api/project/" + projectId)
                      .set("auth-token", token)
                      .end((err, res) => {
                        should().exist(res);
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        expect(res.body.name).to.equal(updateProject.name);
                        expect(res.body.techStack).to.have.all.members(
                          updateProject.techStack
                        );

                        done();
                      });
                  });
              });
          });
      });
  });

  it("/DELETE:id - should register + login a user + create 1 project + soft delete the project", (done) => {
    // Register user
    const agent = chai.request.agent(app);
    chai
      .request(app)
      .post("/api/auth/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        const projectDto = { ...project, teamId: teamId };
        // Login user
        agent
          .post("/api/auth/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res).to.have.cookie("jwt");
            expect(res.status).to.equal(200);
            let token = res.body.accessToken;

            agent
              .post("/api/project")
              .send(projectDto)
              .set("auth-token", token)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body._id).to.not.be.null;
                const projectId = res.body._id;

                agent
                  .delete("/api/project/" + projectId)
                  .set("auth-token", token)
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body.message).to.equal(
                      "Project was succesfully deleted."
                    );

                    agent
                      .get("/api/project/" + projectId)
                      .set("auth-token", token)
                      .end((err, res) => {
                        should().exist(res);
                        res.should.have.status(500);
                        expect(res.body.message).to.equal("Project not found!");

                        done();
                      });
                  });
              });
          });
      });
  });
});
