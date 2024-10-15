import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import multer from 'multer';
import sql from 'mssql'
import mysql from 'mysql'
import cron from 'node-cron'
import nodemailer from 'nodemailer';
import Excel from "exceljs";

import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import maestrosRoutes from './routes/maestrosRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import graphicsRoutes from './routes/graphicsRoutes.js';
import excelService from './services/excelService.js';

const { diskStorage } = multer;
const app = express(); 
dotenv;

// app.use(cors({
//   origin: '*',  // o especifica el dominio permitido
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   optionsSuccessStatus: 204,
//   credentials: true ,
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-client-channel'],
  
// }));

// app.use(cors());
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
  
  // 0 0 0 * * *
  const task = cron.schedule('0 30 16 * * *', async () => {
    console.log('running a task');
    
    
    const responseGraphics = await fetch(process.env.API_URL_PROD + '/graphics/getData/1', {
      method: "GET",
      headers: {"Content-type": "application/json;charset=UTF-8"}
    })
    console.log(responseGraphics);
    const graphicsAll = await responseGraphics.json()
    const graphics = graphicsAll.filter(graphic => graphic.bexportdiario)
    let date = new Date(new Date().setDate(new Date().getDate()-1));
    let emailHtml = `
      <style>
        .title {
          font-size: 16px;
          font-weight: 700;
        }
      </style>
      <h2>Saludos</h2>    
      <h4 class="title">En el siguiente correo se envía los reportes diarios de:</h4>            
    `;
    const excelFiles = []
    emailHtml += '<h2>'
    let x = 1
    for (const graphic of graphics) {
      const responseFilters = await fetch(`${process.env.API_URL_PROD}/graphics/${graphic.id}/getFilters`, {
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}
      })
      const filters = await responseFilters.json()
      for (const filter of filters) {
        filter.controlValue = date.toLocaleDateString('en-CA')
        const requestVar = {value: filter.controlValue, key: filter.key, binverso: filter.binverso}
        const responseExportTotal = await fetch(`${process.env.API_URL_PROD}/graphics/exportTotal`, {
          method: "POST",
          headers: {"Content-type": "application/json;charset=UTF-8"},
          body: JSON.stringify({
              requestVar: requestVar,
              id: graphic.id
          })
        })
        const exportTotal = await responseExportTotal.json()
        const excelFile = await excelService.exportAllToExcel(exportTotal.items, `dwh_reporte_total_${graphic.xidgrafico}-${date.toLocaleDateString('en-US')}`, graphic.xnombre)
        excelFiles.push({filename: `dwh_reporte_total_${graphic.xidgrafico}-${date.toLocaleDateString('en-US')}.xlsx`, content: Buffer.from(excelFile)})
        
      }
      emailHtml += `${graphic.xnombre}`
      if(x < graphics.length) {
        emailHtml += ' - '
      }
      x++
    }
    emailHtml += `</h2>
    <p>De parte del equipo de  <b style="font-weight: 700px; font-style:italic;">Exelixi</b></p>
    `
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o cualquier otro servicio de correo (e.g., 'yahoo', 'outlook')
      auth: {
        user: 'themultiacount@gmail.com',
        pass: 'kfgb bnad gqpz etux'
      }
    });
    const mailOptions = {
      from: 'La Mundial de Seguros',
      to: ['quand.mind@gmail.com'], // Cambia esto por la dirección de destino
      // to: ['quand.mind@gmail.com','gidler@lamundialdeseguros.com', 'jperez@lamundialdeseguros.com'], // Cambia esto por la dirección de destino
      subject: `Reportes del día ${date.toLocaleDateString('en-US')}`,
      html: emailHtml,
      attachments: excelFiles
    };
    try {
      const response = await transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente');
    } catch (error) {
      console.error('Error al enviar el correo:', error.message);
    }
    // console.log(result);

  });
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


