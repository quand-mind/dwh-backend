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
import fetch from 'node-fetch';
// import {ReportManager, ReportExecutionUrl, ReportService} from 'mssql-ssrs';

import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import maestrosRoutes from './routes/maestrosRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import graphicsRoutes from './routes/graphicsRoutes.js';
import excelService from './services/excelService.js';
import Surveillance from './db/Surveillance.js'

const { diskStorage } = multer;
const app = express(); 
dotenv;

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

// Servidor de Reportes

// var url = 'http://pclm083:80/reportserver';
// var reportPath = '/recibos_anuales_2';
// var fileType = 'xlsx'
// var serverConfig = {
//     server: 'serverName',
//     instance: 'serverInstance',
//     isHttps: false, // optional, default: false
//     port: 80, // optional, default: 80
// };

// var ssrs = new ReportManager([]);
// var reportService = new ReportService();

// var auth = {
//   username: 'aquintero',
//   password: '27798623Adqf..',
//   workstation: '', // optional
//   domain: '' // optional
// };
// var parameters = [
//   { Name: 'date', Value: '30/10/2024' },
// ]

// console.log(re);
// await ssrs.start(url, { username: 'sa', password: 'Seguros!' });

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  // Envio de reportes


  // await ssrs.start(url, auth, null, null);
  // await reportService.start(url, auth, null, null);
  
  // var re = new ReportExecutionUrl(url, auth, null, null);

  // var params = await reportService.getReportParams(reportPath);
  // // console.log(params);
  // const report = await re.getReport(reportPath, fileType, parameters, null);
  // console.log(report.data);
  // let files = []
  // files.push({filename: `prueba.${fileType}`, content: report.data})
  // const emailHtml = '<h1>Hola</h1>'
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail', // o cualquier otro servicio de correo (e.g., 'yahoo', 'outlook')
  //   auth: {
  //     user: 'themultiacount@gmail.com',
  //     pass: 'kfgb bnad gqpz etux'
  //   }
  // });
  // const mailOptions = {
  //   from: 'La Mundial de Seguros',
  //   to: ['quand.mind@gmail.com'], // Cambia esto por la dirección de destino
  //   // to: ['quand.mind@gmail.com','gidler@lamundialdeseguros.com', 'jperez@lamundialdeseguros.com'], // Cambia esto por la dirección de destino
  //   subject: `Prueba`,
  //   html: emailHtml,
  //   attachments: files
  // };

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente');
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
  }

  // 0 20 0 * * *
  const avisos = await Surveillance.getAvisos()
  
  for (const aviso of avisos) {
    const frecuencias = aviso.xfrecuencia.split(',')
    for (const frecuencia of frecuencias) {
      cron.schedule(frecuencia, async() => {
        console.log('running a task');
        await sql.connect(sqlConfig)
        const userGuard = await sql.query(`select top(1) * from prguardias where fhasta >= convert(date, GETDATE())`)
        const userResult = await sql.query(`select cusuario, xnombre + ' ' + xapellido as xnombre, xemail, xcedula from seusuario where cusuario = ${userGuard.recordset[0].cusuario}`)
        // console.log(userResult);
        const result = await sql.query(aviso.xsqlaviso)
        if(result.recordset[0].return == 0) {
          
          let emailHtml = `
            <style>
              .title {
                font-size: 16px;
                font-weight: 700;
              }
            </style>
            <h2>Estimado usuario: ${userResult.recordset[0].xnombre}</h2>    
            <h4 class="title">Se ha presentado un problema en el siguiente proceso:</h4>
            <h5 style="text-transform: uppercase;">${aviso.xmensaje}</h5>
            <p>Por favor, revise el proceso en la brevedad posible para solventar los problemas presentados.</p>
            </h2>
          `
          if(aviso.xsqlreporte) {
            const querys = aviso.xsqlreporte.split('-----')
            emailHtml += `<h5>Aquí algunos detalles del problema encontrado</h5>`
            for (const query of querys) {
              const report = await sql.query(query)
              emailHtml += `<div>`
              for (const element of report.recordset) {
                const entries = Object.entries(element)
                emailHtml += `<div style="display:flex; flex-direction:column; gap:5px;">`
                for (const entry of entries) {
                  for (const text of entry) {
                    emailHtml += `<span style="margin-right: 5px">${text}</span>`
                  }
                }
                emailHtml += `</div>`
              }
              emailHtml += `</div>`
            }
            
          }
          emailHtml += `<p>De parte del equipo de  <b style="font-weight: 700px; font-style:italic;">Exelixi</b></p>`
          const transporter = nodemailer.createTransport({
            service: 'gmail', // o cualquier otro servicio de correo (e.g., 'yahoo', 'outlook')
            auth: {
              user: 'themultiacount@gmail.com',
              pass: 'kfgb bnad gqpz etux'
            }
          });
          const mailOptions = {
            from: 'La Mundial de Seguros',
            // to: ['quand.mind@gmail.com'], // Cambia esto por la dirección de destino
            to: ['quand.mind@gmail.com', userResult.recordset[0].xemail], // Cambia esto por la dirección de destino
            subject: `Problemas en proceso de ${aviso.xnombre}`,
            html: emailHtml
          };
          try {
            const response = await transporter.sendMail(mailOptions);
            console.log('Correo enviado correctamente');
          } catch (error) {
            console.error('Error al enviar el correo:', error.message);
          }
        }
      })
    }
    
  }
  cron.schedule('0 30 1 * * *', async () => {
    console.log('running a task');    
    
    const responseGraphics = await fetch(process.env.API_URL_PROD + '/graphics/getData/1', {
      method: "GET",
      headers: {"Content-type": "application/json;charset=UTF-8"}
    })
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
      // to: ['quand.mind@gmail.com'], // Cambia esto por la dirección de destino
      to: ['quand.mind@gmail.com','gidler@lamundialdeseguros.com', 'jperez@lamundialdeseguros.com'], // Cambia esto por la dirección de destino
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
  cron.schedule('0 0 0 * * 1', async() => {
    let date = new Date()
    console.log(date);
    console.log('ejecutandose');
    let emailHtml = `
      <style>
        .title {
          font-size: 16px;
          font-weight: 700;
        }
      </style>
      <h2>Saludos</h2>    
    `;
    const usersAvailables = await Surveillance.getAvailableGuards(date)
    const mappedUsersAvailables = usersAvailables.map(user => user.cusuario)
    if (mappedUsersAvailables.length > 0){
      const userGuard = await Surveillance.setGuard(mappedUsersAvailables)
      console.log(usersAvailables);
      const userGuardObject = usersAvailables.find(user => user.cusuario == userGuard.id)
      console.log('Usuario que tiene que estar de guardia:',userGuardObject.xnombre);
      emailHtml += `
        <h4 class="title">En el siguiente correo se informa sobre el  usuario que estará de guardia hasta el ${userGuard.fhasta}</h4>
        <h5>Usuario asignado para estar de guardia esta semana: <b style="text-transfrom: uppercase;">${userGuardObject.xnombre}</b></h5>
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
        // to: ['quand.mind@gmail.com'], // Cambia esto por la dirección de destino
        to: [
          'quand.mind@gmail.com',
          'aquintero@lamundialdeseguros.com',
          'gidler@lamundialdeseguros.com',
          'jalen@lamundialdeseguros.com',
          'faraujo@lamundialdeseguros.com',
          'gestacio@lamundialdeseguros.com',
          'ralen@lamunidaldeseguros.com',
          'marismendi@lamundialdeseguros.com',
        ], // Cambia esto por la dirección de destino
        subject: `Asignación de las guardias`,
        html: emailHtml
      };
      try {
        const response = await transporter.sendMail(mailOptions);
        console.log('Correo enviado correctamente');
      } catch (error) {
        console.error('Error al enviar el correo:', error.message);
      }
    } else {
      console.log('No existen mas usuarios disponibles para guardias');
    }
  })
})



// app.get('/', (req, res) => {
//   res.send('hello')
// })


