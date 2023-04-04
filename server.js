require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const users = require("./routes/users");
const rooms = require("./routes/rooms");
const auth = require("./routes/auth");
const shops = require("./routes/shops");
const connectDB = require("./db/connect");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

//Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger2.yaml");

const app = express();
const port = process.env.PORT || 3000;

// app.set("trust proxy", 1);
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000,
		max: 100,
	})
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
	res.send('<h1>Togather API</h1><a href="/api-docs">Documentation</a>');
});
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/users", users);
app.use("/api/v1/auth", auth);
app.use("/api/v1/rooms", rooms);
app.use("/api/v1/shops", shops);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI).then(
			console.log("MongoDB Connected")
		);
		app.listen(port, () => {
			console.log(`Listening on port ${port}...`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
