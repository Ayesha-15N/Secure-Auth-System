import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { mongoConnection } from './config/db.js'
import authRouter from './route/AuthRoute.js'
import userRouter from './route/UserRoute.js'


// dotenv
dotenv.config()
// app
const app = express();
// port
const port = process.env.PORT || 4000
// connect mongo
mongoConnection()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)


app.listen(port)