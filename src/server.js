import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import multer from 'multer';
import sql from 'mssql'

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

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('hello')
})

app.get('/clients', async (req, res) => {
  const data = await getClients(1)
  res.send(data)
})
app.post('/clients', async (req, res) => {
  const page = req.body.page
  const data = await getClients(parseInt(page))
  res.send(data)
})
app.post('/countClients', async (req, res) => {
  const data = await countClients()
  res.send(data)
})


const countClients = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT COUNT(*) FROM maclientes`
    return result.recordset[0]
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getClients = async (page) => {
  
 try {
  // make sure that any items are correctly URL encoded in the connection string
  await sql.connect(sqlConfig)
  const offsetRows = (page * 10) - 10
  const result = await sql.query`SELECT * FROM maclientes ORDER BY id OFFSET ${parseInt(offsetRows)} rows FETCH NEXT 10 rows ONLY`
  for (const item of result.recordsets[0]) {
    const keys = Object.keys(item)
    for (const key of keys) {
      if (key.charAt(0) == 'i') {
        if(key == 'id') {
        } else if(key == 'isexo') {
          item['v'+key] = {values: ['M','F', 'N'], format:['Masculino', 'Femenino', 'No especificado']}
        } else if(key == 'iestado'){
          item['v'+key] = {values: ['V', 'E'], format:['Venezolano', 'Extranjero']}
        } else if(key == 'iestado_civil'){
          item['v'+key] == {values: ['C', 'S'],format: ['Casado', 'Soltero']}
        }
      }
    }
  }
  return result.recordsets[0]
 } catch (err) {
  console.log('Error al Obtener los clientes', err)
  return err
 }
}