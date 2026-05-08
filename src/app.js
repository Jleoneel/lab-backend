const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const serviceRoutes = require("./routes/service.routes");
const quoteRoutes = require("./routes/quote.routes");
const requestRoutes = require("./routes/request.routes");
const sampleRoutes = require("./routes/sample.routes");
const sampleServiceRoutes = require("./routes/sampleService.routes");
const settingsRoutes = require("./routes/settings.routes");
const reactivoRoutes = require("./routes/reactivo.routes");
const razonRoutes = require("./routes/razon.routes");
const equipoRoutes = require("./routes/equipo.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");
const documentoRoutes = require("./routes/documento.routes");
const mensajeRoutes = require("./routes/mensaje.routes");

const { errorMiddleware } = require("./middlewares/error.middleware");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
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
app.use("/settings", settingsRoutes);
app.use("/reactivos", reactivoRoutes);
app.use("/razones", razonRoutes);
app.use("/equipos", equipoRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/documentos", documentoRoutes);
app.use("/mensajes", mensajeRoutes);

app.use(errorMiddleware);

module.exports = { app };
