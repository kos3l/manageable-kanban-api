require("dotenv-flow").config();
// Import dependencies
import express from "express";
import mongoose from "mongoose";
import yaml from "yamljs";
import bodyParser from "body-parser";
const authRoutes = require("./api/routes/AuthRoutes");
const swaggerDefinition = yaml.load("./src/config/swagger.yaml");
const swaggerUi = require("swagger-ui-express");

// Import auth middleware - uncomment when needed
// import { verifyToken } from "./api/middleware/TokenMiddleware";

// Create express app
const app: express.Application = express();

// Set up swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use(bodyParser.json());

// Routes
app.use("/api/user", authRoutes);

// Open mongoose connection
mongoose
  .connect(process.env.DBHOST!)
  .catch((error) => console.log("Error connecting to MongoDb: " + error));
mongoose.connection.once("open", () =>
  console.log("Connected succesfully to MongoDb!")
);

// Set the port
const PORT = process.env.PORT || 4000;

// Listen to requests
app.listen(PORT, function () {
  console.log("Server is running on port: " + PORT);
});

module.exports = app;
