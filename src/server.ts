require("dotenv-flow").config();
import express from "express";
import mongoose from "mongoose";
import yaml from "yamljs";
import bodyParser from "body-parser";
import authRoutes from "./api/routes/AuthRoutes";
const swaggerDefinition = yaml.load("./src/config/swagger.yaml");
import swaggerUi from "swagger-ui-express";

// Import auth middleware - uncomment when needed
// import { verifyToken } from "./api/middleware/TokenMiddleware";

const app: express.Application = express();

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use(bodyParser.json());

app.use("/api/user", authRoutes);

mongoose
  .connect(process.env.DBHOST!)
  .catch((error) => console.log("Error connecting to MongoDb: " + error));
mongoose.connection.once("open", () =>
  console.log("Connected succesfully to MongoDb!")
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log("Server is running on port: " + PORT);
});

module.exports = app;
