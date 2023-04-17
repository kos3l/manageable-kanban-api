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

describe("Team workflow tests", () => {
  it("/GET - should register (which creates one team for the user by default) + login a user and get all teams (1 team that was created by default)", (done) => {
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

    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        expect(res.body.error).to.be.equal(null);
        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.error).to.be.equal(null);
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

    // Register user
    chai
      .request(app)
      .post("/api/user/register")
      .send(user)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a("object");
        expect(res.body.error).to.be.equal(null);
        // Login user
        chai
          .request(app)
          .post("/api/user/login")
          .send(userLogin)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;

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
                let teamId = res.body[0]._id;

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
  });
});
