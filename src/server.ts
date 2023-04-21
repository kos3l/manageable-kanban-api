require("dotenv-flow").config();
import express from "express";
import mongoose from "mongoose";
import yaml from "yamljs";
import bodyParser from "body-parser";
import authRoutes from "./api/routes/AuthRoutes";
import userRoutes from "./api/routes/UserRoutes";
import teamRoutes from "./api/routes/TeamRoutes";
import swaggerUi from "swagger-ui-express";
import { verifyToken } from "./api/middleware/TokenMiddleware";

const swaggerDefinition = yaml.load("./src/config/swagger.yaml");

const app: express.Application = express();

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/team", verifyToken, teamRoutes);

mongoose
  .connect(process.env.DBHOST!)
  .catch((error) => console.log("Error connecting to MongoDb: " + error));
mongoose.connection.once("open", () =>
  console.log("Connected succesfully to MongoDb!")
);

const conn = mongoose.connection;
const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log("Server is running on port: " + PORT);
});

export { app, conn };
