import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import multer from 'multer';
import sql from 'mssql'
import mysql from 'mysql'

import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import maestrosRoutes from './routes/maestrosRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import graphicsRoutes from './routes/graphicsRoutes.js';

const { diskStorage } = multer;
const app = express(); 
dotenv;

app.use(cors({
  origin: '*',  // o especifica el dominio permitido
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
  credentials: true ,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-channel'],
  
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const port = process.env.PORT || 3000; 

const DOCUMENTS_PATH = './public/documents';

// console.log(clientRoutes);

app.use("/clients", clientRoutes);
app.use("/auth", authRoutes);
app.use("/maestros", maestrosRoutes);
app.use("/campaign", campaignRoutes);
app.use("/graphics", graphicsRoutes);

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  // var connection = mysql.createConnection({
  //   host     : process.env.DB_server_BEE,
  //   user     : process.env.DB_USER_BEE,
  //   password : process.env.DB_PWD_BEE,
  //   database : process.env.DB_NAME_BEE
  // });
   
  // connection.connect();
  // const sqlConfig = {
  //   user: process.env.DB_USER_BEE,
  //   password: process.env.DB_PWD_BEE,
  //   server: process.env.DB_server_BEE,
  //   database: process.env.DB_NAME_BEE,
  //   requestTimeout: 60000,
  //   options: {
  //       encrypt: true,
  //       trustServerCertificate: true
  //   }    
  // }
  // let pool = await sql.connect(sqlConfig);
})



// app.get('/', (req, res) => {
//   res.send('hello')
// })


