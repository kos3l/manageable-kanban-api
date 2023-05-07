require("dotenv-flow").config();
import express from "express";
import mongoose from "mongoose";
import yaml from "yamljs";
import bodyParser from "body-parser";
import authRoutes from "./api/routes/AuthRoutes";
import userRoutes from "./api/routes/UserRoutes";
import teamRoutes from "./api/routes/TeamRoutes";
import tokenRoutes from "./api/routes/TokenRoutes";
import projectRoutes from "./api/routes/ProjectRoutes";
import taskRoutes from "./api/routes/TaskRoutes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { verifyToken } from "./api/middleware/TokenMiddleware";
import cookieParser from "cookie-parser";
const jwt = require("jsonwebtoken");
const swaggerDefinition = yaml.load("./src/config/swagger.yaml");

const app: express.Application = express();

// Use cors library
app.use(
  cors({
    origin: [
      "http://localhost:4000/",
      "http://localhost:5173",
      "https://www.app.neon-dev.dk",
      "https://app.neon-dev.dk",
      "https://api.neon-dev.dk",
    ],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT"],
    credentials: true,
  })
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/team", verifyToken, teamRoutes);
app.use("/api/project", verifyToken, projectRoutes);
app.use("/api/task", verifyToken, taskRoutes);

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
