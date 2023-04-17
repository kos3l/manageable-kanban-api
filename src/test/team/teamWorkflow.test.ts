process.env.NODE_ENV = "test";
import { app } from "../../server";
import { User } from "../../api/models/schemas/UserSchema";
import { Team } from "../../api/models/schemas/TeamSchema";
import chai, { should } from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
chai.use(chaiHttp);

afterEach((done) => {
  User.deleteMany({}).then((res) => Team.deleteMany({}).then((res) => done()));
});

describe("Team workflow tests - Happy scenarios", () => {
  // Mock data
  let user1 = {
    firstName: "Sarah",
    lastName: "Connor",
    email: "doomsday@email.com",
    password: "123123",
    birthdate: "1998-07-22 18:00:00.000",
  };

  let user2 = {
    firstName: "Kate",
    lastName: "Bush",
    email: "kate@email.com",
    password: "123123",
    birthdate: "2000-04-09 12:00:00.000",
  };

  let userLogin = {
    email: "doomsday@email.com",
    password: "123123",
  };

  let newTeam = {
    name: "Team Rocket",
  };

  let updatedTeam = {
    name: "Team Rocket Extra",
  };

  it("/GET - should register (which creates one team for the user by default) + login a user and get all teams (1 team that was created by default)", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;
            // Get all teams
            chai
              .request(app)
              .get("/api/team")
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

  it("/GET:id - should register + login a user and get a teams by id (1 team that was created by default)", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Get team by id
            chai
              .request(app)
              .get("/api/team/" + teamId)
              .set({ "auth-token": token })
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");

                done();
              });
          });
      });
  });

  it("/POST - should register + login a user and create a team", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let userId = res.body.data[0];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Create a team
            chai
              .request(app)
              .post("/api/team")
              .set({ "auth-token": token })
              .send([newTeam])
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body).to.have.property("name").equal(newTeam.name);
                expect(res.body).to.have.property("createdBy").equal(userId);
                expect(res.body).to.have.property("users").to.eql([userId]);

                // Get all teams
                chai
                  .request(app)
                  .get("/api/team")
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(2);

                    done();
                  });
              });
          });
      });
  });

  it("/PUT:id - should register + login a user and update the default team", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Update a team
            chai
              .request(app)
              .put("/api/team/" + teamId)
              .set({ "auth-token": token })
              .send(updatedTeam)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);

                // Get team by id
                chai
                  .request(app)
                  .get("/api/team/" + teamId)
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body)
                      .to.have.property("name")
                      .equal(updatedTeam.name);
                    expect(res.body).to.have.property("__v").equal(1);

                    done();
                  });
              });
          });
      });
  });

  it("/PUT:id/UpdateMembers - should register two users + login one user and add the other one to the team", (done) => {
    // Register user1
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        let user1Id = res.body.data[0];

        // Register user2
        chai
          .request(app)
          .post("/api/user/register")
          .send(user2)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.a("object");
            let user2Id = res.body.data[0];

            // Login user
            chai
              .request(app)
              .post("/api/user/login")
              .send(userLogin)
              .end((err, res) => {
                expect(res.status).to.equal(200);
                let token = res.body.data.token;
                let updatedTeamMembersArray = [user1Id, user2Id];

                // Add user 2 to the default team of user 1
                chai
                  .request(app)
                  .put("/api/team/" + teamId + "/UpdateMembers")
                  .set({ "auth-token": token })
                  .send({ users: updatedTeamMembersArray })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);

                    // Get team by id
                    chai
                      .request(app)
                      .get("/api/team/" + teamId)
                      .set({ "auth-token": token })
                      .end((err, res) => {
                        should().exist(res);
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        expect(res.body).to.have.property("__v").equal(1);
                        expect(res.body)
                          .to.have.property("users")
                          .that.is.a("array");
                        expect(res.body)
                          .to.have.property("users")
                          .to.eql(updatedTeamMembersArray);
                        res.body.users.length.should.be.eql(2);

                        // Add this once the User routes are in
                        // chai
                        //   .request(app)
                        //   .get("/api/user/" + user2Id)
                        //   .set({ "auth-token": token })
                        //   .end((err, res) => {
                        //     should().exist(res);
                        //     res.should.have.status(200);
                        //     res.body.should.be.a("object");
                        //     expect(res.body)
                        //       .to.have.property("teams")
                        //       .that.is.a("array");
                        //     expect(res.body)
                        //       .to.have.property("teams")
                        //       .to.include(teamId);
                        //     res.body.teams.length.should.be.eql(2);

                        done();
                        // });
                      });
                  });
              });
          });
      });
  });

  it("/PUT:id/UpdateMembers - should register two users + login one user, add the other one to the team and remove them", (done) => {
    // Register user1
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        let user1Id = res.body.data[0];

        // Register user2
        chai
          .request(app)
          .post("/api/user/register")
          .send(user2)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.a("object");
            let user2Id = res.body.data[0];

            // Login user
            chai
              .request(app)
              .post("/api/user/login")
              .send(userLogin)
              .end((err, res) => {
                expect(res.status).to.equal(200);
                let token = res.body.data.token;
                let updatedTeamMembersArray = [user1Id, user2Id];

                // Add user 2 to the default team of user 1
                chai
                  .request(app)
                  .put("/api/team/" + teamId + "/UpdateMembers")
                  .set({ "auth-token": token })
                  .send({ users: updatedTeamMembersArray })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);

                    // Get team by id
                    chai
                      .request(app)
                      .get("/api/team/" + teamId)
                      .set({ "auth-token": token })
                      .end((err, res) => {
                        should().exist(res);
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        expect(res.body).to.have.property("__v").equal(1);
                        expect(res.body)
                          .to.have.property("users")
                          .that.is.a("array");
                        expect(res.body)
                          .to.have.property("users")
                          .to.eql(updatedTeamMembersArray);
                        res.body.users.length.should.be.eql(2);

                        // Remove the user 2 from team
                        chai
                          .request(app)
                          .put("/api/team/" + teamId + "/UpdateMembers")
                          .set({ "auth-token": token })
                          .send({ users: [user1Id] })
                          .end((err, res) => {
                            should().exist(res);
                            res.should.have.status(200);

                            chai
                              .request(app)
                              .get("/api/team/" + teamId)
                              .set({ "auth-token": token })
                              .end((err, res) => {
                                should().exist(res);
                                res.should.have.status(200);
                                res.body.should.be.a("object");
                                expect(res.body)
                                  .to.have.property("__v")
                                  .equal(2);
                                expect(res.body)
                                  .to.have.property("users")
                                  .that.is.a("array");
                                expect(res.body)
                                  .to.have.property("users")
                                  .to.eql([user1Id]);
                                res.body.users.length.should.be.eql(1);

                                done();
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it("/DELETE:id - should register + login a user, create a team and delete it", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];
        let userId = res.body.data[0];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Create a team
            chai
              .request(app)
              .post("/api/team")
              .set({ "auth-token": token })
              .send([newTeam])
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(200);
                res.body.should.be.a("object");
                expect(res.body).to.have.property("name").equal(newTeam.name);
                expect(res.body).to.have.property("createdBy").equal(userId);
                expect(res.body).to.have.property("users").to.eql([userId]);
                let newTeamId = res.body._id;

                chai
                  .request(app)
                  .get("/api/team")
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(2);

                    chai
                      .request(app)
                      .delete("/api/team/" + newTeamId)
                      .set({ "auth-token": token })
                      .end((err, res) => {
                        should().exist(res);
                        res.should.have.status(200);

                        chai
                          .request(app)
                          .get("/api/team")
                          .set({ "auth-token": token })
                          .end((err, res) => {
                            should().exist(res);
                            res.should.have.status(200);
                            res.body.should.be.a("array");
                            res.body.length.should.be.eql(1);
                            expect(res.body[0])
                              .to.have.property("_id")
                              .equal(teamId);

                            done();
                          });
                      });
                  });
              });
          });
      });
  });
});

describe("Team workflow tests - Fail scenarios", () => {
  // Mock data
  let user1 = {
    firstName: "Sarah",
    lastName: "Connor",
    email: "doomsday@email.com",
    password: "123123",
    birthdate: "1998-07-22 18:00:00.000",
  };

  let user2 = {
    firstName: "Kate",
    lastName: "Bush",
    email: "kate@email.com",
    password: "123123",
    birthdate: "2000-04-09 12:00:00.000",
  };

  let userLogin = {
    email: "doomsday@email.com",
    password: "123123",
  };

  let userLogin2 = {
    email: "kate@email.com",
    password: "123123",
  };

  let newTeam = {
    name: "Team Rocket",
  };

  let updatedTeam = {
    name: "Team Rocket Extra",
  };

  let invalidTeam = {
    name: "T",
  };

  it("/GET - get all teams without a token ", (done) => {
    // Get all teams
    chai
      .request(app)
      .get("/api/team")
      .end((err, res) => {
        should().exist(res);
        res.should.have.status(401);
        expect(res.body.error).to.not.be.null;

        done();
      });
  });

  it("/GET:id - should register + login a user, try to get team by id with no token", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1] + 123;

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Get team by id
            chai
              .request(app)
              .get("/api/team/" + teamId)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(401);
                expect(res.body.error).to.not.be.null;

                done();
              });
          });
      });
  });

  it("/POST - try to create a team with no token", (done) => {
    // Create a team
    chai
      .request(app)
      .post("/api/team")
      .send([newTeam])
      .end((err, res) => {
        should().exist(res);
        res.should.have.status(401);
        expect(res.body.error).to.not.be.null;

        done();
      });
  });

  it("/POST - should register + login a user and create a team with invalid input", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Create a team
            chai
              .request(app)
              .post("/api/team")
              .set({ "auth-token": token })
              .send([invalidTeam])
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(500);
                expect(res.body.error).to.not.be.null;

                // Get all teams
                chai
                  .request(app)
                  .get("/api/team")
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    res.body.length.should.be.eql(1);
                    expect(res.body[0]).to.have.property("_id").equal(teamId);

                    done();
                  });

                // check if logged in user's "users" propert wasnt updated with the not created team
              });
          });
      });
  });

  it("/PUT:id - try to update a team with no token", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            // Update a team
            chai
              .request(app)
              .put("/api/team/" + teamId)
              .send(updatedTeam)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(401);
                expect(res.body.error).to.not.be.null;

                // Get team by id
                chai
                  .request(app)
                  .get("/api/team/" + teamId)
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    expect(res.body).to.have.property("__v").equal(0);

                    done();
                  });
              });
          });
      });
  });

  // it("/PUT:id/UpdateMembers - should register two users + login one user and add the other one to the team", (done) => {
  //   // Register user1
  //   chai
  //     .request(app)
  //     .post("/api/user/register")
  //     .send(user1)
  //     .end((err, res) => {
  //       expect(res.status).to.equal(200);
  //       expect(res.body).to.be.a("object");
  //       let teamId = res.body.data[1];
  //       let user1Id = res.body.data[0];

  //       // Register user2
  //       chai
  //         .request(app)
  //         .post("/api/user/register")
  //         .send(user2)
  //         .end((err, res) => {
  //           expect(res.status).to.equal(200);
  //           expect(res.body).to.be.a("object");
  //           let user2Id = res.body.data[0];

  //           // Login user
  //           chai
  //             .request(app)
  //             .post("/api/user/login")
  //             .send(userLogin)
  //             .end((err, res) => {
  //               expect(res.status).to.equal(200);
  //               let token = res.body.data.token;
  //               let updatedTeamMembersArray = [user1Id, user2Id];

  //               // Add user 2 to the default team of user 1
  //               chai
  //                 .request(app)
  //                 .put("/api/team/" + teamId + "/UpdateMembers")
  //                 .set({ "auth-token": token })
  //                 .send({ users: updatedTeamMembersArray })
  //                 .end((err, res) => {
  //                   should().exist(res);
  //                   res.should.have.status(200);

  //                   // Get team by id
  //                   chai
  //                     .request(app)
  //                     .get("/api/team/" + teamId)
  //                     .set({ "auth-token": token })
  //                     .end((err, res) => {
  //                       should().exist(res);
  //                       res.should.have.status(200);
  //                       res.body.should.be.a("object");
  //                       expect(res.body).to.have.property("__v").equal(1);
  //                       expect(res.body)
  //                         .to.have.property("users")
  //                         .that.is.a("array");
  //                       expect(res.body)
  //                         .to.have.property("users")
  //                         .to.eql(updatedTeamMembersArray);
  //                       res.body.users.length.should.be.eql(2);

  //                       // Add this once the User routes are in
  //                       // chai
  //                       //   .request(app)
  //                       //   .get("/api/user/" + user2Id)
  //                       //   .set({ "auth-token": token })
  //                       //   .end((err, res) => {
  //                       //     should().exist(res);
  //                       //     res.should.have.status(200);
  //                       //     res.body.should.be.a("object");
  //                       //     expect(res.body)
  //                       //       .to.have.property("teams")
  //                       //       .that.is.a("array");
  //                       //     expect(res.body)
  //                       //       .to.have.property("teams")
  //                       //       .to.include(teamId);
  //                       //     res.body.teams.length.should.be.eql(2);

  //                       done();
  //                       // });
  //                     });
  //                 });
  //             });
  //         });
  //     });
  // });

  // it("/PUT:id/UpdateMembers - should register two users + login one user, add the other one to the team and remove them", (done) => {
  //   // Register user1
  //   chai
  //     .request(app)
  //     .post("/api/user/register")
  //     .send(user1)
  //     .end((err, res) => {
  //       expect(res.status).to.equal(200);
  //       expect(res.body).to.be.a("object");
  //       let teamId = res.body.data[1];
  //       let user1Id = res.body.data[0];

  //       // Register user2
  //       chai
  //         .request(app)
  //         .post("/api/user/register")
  //         .send(user2)
  //         .end((err, res) => {
  //           expect(res.status).to.equal(200);
  //           expect(res.body).to.be.a("object");
  //           let user2Id = res.body.data[0];

  //           // Login user
  //           chai
  //             .request(app)
  //             .post("/api/user/login")
  //             .send(userLogin)
  //             .end((err, res) => {
  //               expect(res.status).to.equal(200);
  //               let token = res.body.data.token;
  //               let updatedTeamMembersArray = [user1Id, user2Id];

  //               // Add user 2 to the default team of user 1
  //               chai
  //                 .request(app)
  //                 .put("/api/team/" + teamId + "/UpdateMembers")
  //                 .set({ "auth-token": token })
  //                 .send({ users: updatedTeamMembersArray })
  //                 .end((err, res) => {
  //                   should().exist(res);
  //                   res.should.have.status(200);

  //                   // Get team by id
  //                   chai
  //                     .request(app)
  //                     .get("/api/team/" + teamId)
  //                     .set({ "auth-token": token })
  //                     .end((err, res) => {
  //                       should().exist(res);
  //                       res.should.have.status(200);
  //                       res.body.should.be.a("object");
  //                       expect(res.body).to.have.property("__v").equal(1);
  //                       expect(res.body)
  //                         .to.have.property("users")
  //                         .that.is.a("array");
  //                       expect(res.body)
  //                         .to.have.property("users")
  //                         .to.eql(updatedTeamMembersArray);
  //                       res.body.users.length.should.be.eql(2);

  //                       // Remove the user 2 from team
  //                       chai
  //                         .request(app)
  //                         .put("/api/team/" + teamId + "/UpdateMembers")
  //                         .set({ "auth-token": token })
  //                         .send({ users: [user1Id] })
  //                         .end((err, res) => {
  //                           should().exist(res);
  //                           res.should.have.status(200);

  //                           chai
  //                             .request(app)
  //                             .get("/api/team/" + teamId)
  //                             .set({ "auth-token": token })
  //                             .end((err, res) => {
  //                               should().exist(res);
  //                               res.should.have.status(200);
  //                               res.body.should.be.a("object");
  //                               expect(res.body)
  //                                 .to.have.property("__v")
  //                                 .equal(2);
  //                               expect(res.body)
  //                                 .to.have.property("users")
  //                                 .that.is.a("array");
  //                               expect(res.body)
  //                                 .to.have.property("users")
  //                                 .to.eql([user1Id]);
  //                               res.body.users.length.should.be.eql(1);

  //                               done();
  //                             });
  //                         });
  //                     });
  //                 });
  //             });
  //         });
  //     });
  // });

  it("/DELETE:id - should register + login a user, try to delete with no token", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            chai
              .request(app)
              .delete("/api/team/" + teamId)
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(401);
                expect(res.body.error).to.not.be.null;

                chai
                  .request(app)
                  .get("/api/team")
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
  it("/DELETE:id - should register + login a user, try to delete the user's only team", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        let teamId = res.body.data[1];

        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            let token = res.body.data.token;

            chai
              .request(app)
              .delete("/api/team/" + teamId)
              .set({ "auth-token": token })
              .end((err, res) => {
                should().exist(res);
                res.should.have.status(400);

                expect(res.body)
                  .to.have.property("message")
                  .equal(
                    "Cannot delete your only team! A user needs to belong to atleast one"
                  );

                chai
                  .request(app)
                  .get("/api/team")
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

  it("/DELETE:id - should register + login a user, try to delete another user's team", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user1)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");

        chai
          .request(app)
          .post("/api/user/register")
          .send(user2)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.a("object");
            let teamIdUser2 = res.body.data[1];

            // Login user
            chai
              .request(app)
              .post("/api/user/login")
              .send(userLogin)
              .end((err, res) => {
                expect(res.status).to.equal(200);
                let token = res.body.data.token;

                chai
                  .request(app)
                  .delete("/api/team/" + teamIdUser2)
                  .set({ "auth-token": token })
                  .end((err, res) => {
                    should().exist(res);
                    res.should.have.status(400);

                    expect(res.body)
                      .to.have.property("message")
                      .equal("Cannot delete a team created by another user");

                    chai
                      .request(app)
                      .post("/api/user/login")
                      .send(userLogin2)
                      .end((err, res) => {
                        expect(res.status).to.equal(200);
                        let tokenUser2 = res.body.data.token;

                        chai
                          .request(app)
                          .get("/api/team")
                          .set("auth-token", tokenUser2)
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
      });
  });
});
