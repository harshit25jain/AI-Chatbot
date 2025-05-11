import dotenv from "dotenv";
dotenv.config()

import express from "express";

import morgan from "morgan";

import connect from "./db/db.js";
connect();

import aiRoutes from './routes/ai.routes.js';
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";


import cookieParser from "cookie-parser";
import cors from 'cors';

const app= express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors());

app.use("/ai",aiRoutes);
  



app.use('/users',userRoutes);
app.use('/projects',projectRoutes);

app.get('/',(req,res)=>{
    res.send("Hello World!");
});

export default app;