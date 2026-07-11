import express from "express";
import type { Express } from "express";
// import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

const port: number = Number(process.env.PORT) || 8000;


app.use(cors());
app.use(express.json())



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on PORT ${port}`)
})