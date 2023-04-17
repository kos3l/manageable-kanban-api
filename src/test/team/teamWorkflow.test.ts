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
  let user = {
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
      .send(user)
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
      .send(user)
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
      .send(user)
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
      .send(user)
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

  it("/DELETE:id - should register + login a user, create a team and delete it", (done) => {
    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user)
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
