// middleware.js
import express from "express";
import cors from "cors";

const middleware = [
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    origin: "*",
    // origin: [
    //   "http://localhost:3000",
    //   "http://localhost:3001",
    // ],
    // allowedHeaders: ['Content-Type'],
    // methods: ['GET', 'POST'],
    credentials: true,
  }),
];

export default middleware;
