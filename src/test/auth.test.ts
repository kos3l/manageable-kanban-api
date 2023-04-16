process.env.NODE_ENV = "test";
import { app } from "../server";
import chai, { should } from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
chai.use(chaiHttp);

// before((done) => {
//   Event.deleteMany({}, function (err) {});
//   done();
// });

// after((done) => {
//   Event.deleteMany({}, function (err) {});
//   done();
// });

describe("/First Test Collection/", () => {
  it("should test two values...", () => {
    let expectedValue = 10;
    let actualVal = 10;

    expect(actualVal).to.be.equal(expectedValue);
  });
});
