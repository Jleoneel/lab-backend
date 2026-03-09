const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const serviceRoutes = require("./routes/service.routes");
const quoteRoutes = require("./routes/quote.routes");
const requestRoutes = require("./routes/request.routes");
const sampleRoutes = require("./routes/sample.routes");
const sampleServiceRoutes = require("./routes/sampleService.routes");

const { errorMiddleware } = require("./middlewares/error.middleware");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);    
app.use("/services", serviceRoutes);
app.use("/quotes", quoteRoutes);
app.use("/requests", requestRoutes);
app.use("/samples", sampleRoutes);
app.use("/", sampleServiceRoutes);
app.use("/quotes", quoteRoutes);

app.use(errorMiddleware);

module.exports = { app };
