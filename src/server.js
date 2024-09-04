import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import multer from 'multer';
import sql from 'mssql'

import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import maestrosRoutes from './routes/maestrosRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



// app.get('/', (req, res) => {
//   res.send('hello')
// })


