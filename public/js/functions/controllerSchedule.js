const dbE = require('../../db/conn_empleados');
const dbT = require('../../db/conn_tiempo_extra');

var schedule = require('node-schedule');
const moment = require('moment')

// Require email and email template
const ejs = require("ejs");
const nodeMailer = require('../../mail/conn')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util');



const rechazar_horas = schedule.scheduleJob('1 * * * * *', function(){
    

    dbT(`SELECT DISTINCT solicitud,solicitante,fecha_solicitud FROM solicitud WHERE status != 'Finalizado' AND status !='Rechazado' AND status !='Aprobado'`)

        .then((result) => {

             for (let i = 0; i < result.length; i++) {

                let todayDate = moment()
                let serialDate = (moment(result[i].fecha_solicitud))
                let hours= todayDate.diff(serialDate, 'hours')
                let numDiaSemana=serialDate.weekday();
                
                if(numDiaSemana === 0 || numDiaSemana === 5 || numDiaSemana === 6){
                    if(hours>=72){     
                        dbT(`UPDATE solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`UPDATE horas_solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`INSERT INTO historial(solicitud,empleado,comentario,status) VALUES ('${result[i].solicitud}','${result[i].solicitante}','Rechazo Automatico 72 Hrs','Rechazado')`).then((result) => { }).catch((error) => { console.error(error); })
                    }
                }else{

                    if(hours>=24){     
                        dbT(`UPDATE solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`UPDATE horas_solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`INSERT INTO historial(solicitud,empleado,comentario,status) VALUES ('${result[i].solicitud}','${result[i].solicitante}','Rechazo Automatico 24 Hrs','Rechazado')`).then((result) => { }).catch((error) => { console.error(error); })
                    }

                }


                 
             }

        }).catch((error) => { console.log(error); })

});


// const confirmar_solicitud = schedule.scheduleJob('1 1 6 * * *', function(){
    

//     dbT(`SELECT DISTINCT solicitud,solicitante,fecha_solicitud FROM solicitud WHERE status = 'Finalizado' AND fecha_utilizado IS NULL `)
//         .then((result) => {

//             console.log(result);
//             for (let i = 0; i < result.length; i++) {

//                 dbE(`SELECT emp_correo FROM empleados.del_empleados WHERE emp_id = ${result[i].solicitante}`).then((email) => {

//                     sendConfirmacionMail(email[0].emp_correo, result[i].solicitud, email[0].emp_correo.substring(0, email[0].emp_correo.indexOf('@')), "mail_utilizado")
                   
    
//                  }).catch((error) => { console.error(error) })
                
//             }


//         }).catch((error) => { console.log(error); })

// });



// async function sendConfirmacionMail(to, solicitud, solicitante, corre_template) {

//     console.log({ to }, { solicitud }, { solicitante }, { corre_template });

//     const data = await ejs.renderFile(path.join(__dirname, `../../mail/${corre_template}.ejs`), { supervisor: solicitante, solicitud: solicitud });
//     let mailOptions = {
//         from: "noreply@tristone.com",
//         to: `${to}`,
//         subject: `Confirmar Tiempo Laborado #${solicitud} `,
//         text: "",
//         html: data,
//     };


//     nodeMailer.transport.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//         } else {
//             console.info(info);
//         }
//     })
// }