import express from "express";
import path from "path";
import socketIO from "socket.io";
import logger from "morgan";
import socketController from "./socketController";
import events from "./event";

//const PORT = process.env.PORT || 4000;
const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) => res.render("home", { events: JSON.stringify(events) }));

//const handleListening = () => console.log(`✅ Server running: http://localhost:${PORT}`);
const handleListening = () => console.log(`✅ Server running: https://safe-thicket-91758.herokuapp.com/`);

const server = app.listen(process.env.PORT || 4000, handleListening);

const io = socketIO.listen(server);

io.on("connection", (socket) => socketController(socket, io));