import express from "express";
import cors from "cors";
import router from "./router.js";
import middleware from "./middleware.js";
import http from "http";
import { Server } from "socket.io";
import useIo from "./io.js";
// import { frontEndUrl } from "../../secret.js";

// create app
const app = express();
// some chnages
// implement socket io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: frontEndUrl,
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// app use
app.use(middleware);
app.use(router);
useIo(io);

export default server;
