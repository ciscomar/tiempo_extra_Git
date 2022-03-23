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

const funcion = require('../functions/controllerFunctions');



const rechazar_horas = schedule.scheduleJob('1 * * * * *', function(){
    

    dbT(`SELECT DISTINCT solicitud,solicitante,fecha_solicitud FROM solicitud WHERE status = 'Pendiente'`)

        .then((result) => {

             for (let i = 0; i < result.length; i++) {

                let todayDate = moment()
                let serialDate = (moment(result[i].fecha_solicitud))
                let hours= todayDate.diff(serialDate, 'hours')
                let numDiaSemana=serialDate.weekday();
                /*
                if(numDiaSemana === 0 || numDiaSemana === 5 || numDiaSemana === 6){
                    if(hours>=150){  //72 normal   
                        dbT(`UPDATE solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`UPDATE horas_solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`INSERT INTO historial(solicitud,empleado,comentario,status) VALUES ('${result[i].solicitud}','${result[i].solicitante}','Rechazo Automatico 72 Hrs','Rechazado')`).then((result) => { }).catch((error) => { console.error(error); })
                    }
                }else{
                    */

                    if(hours>=170){     
                        dbT(`UPDATE solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`UPDATE horas_solicitud SET status = "Rechazado" WHERE solicitud = ${result[i].solicitud}`).then((result) => { }).catch((error) => { console.error(error); })
                        dbT(`INSERT INTO historial(solicitud,empleado,comentario,status) VALUES ('${result[i].solicitud}','${result[i].solicitante}','Rechazo Automatico 24 Hrs','Rechazado')`).then((result) => { }).catch((error) => { console.error(error); })
                    }

                //}


                 
             }

        }).catch((error) => { console.log(error); })
});





const vacaciones_supervisor = schedule.scheduleJob('5 * * * * *', function(){
    
    let todayDate = moment()
    let myDate = moment(todayDate).format('YYYY-MM-DD');

    dbT(`SELECT * FROM vacaciones WHERE tipo='Supervisor' AND fecha >= '${myDate}'`)
        .then((result) => {

            for (let i = 0; i < result.length; i++) {

                dbT(`SELECT * FROM solicitud WHERE jefe = ${result[i].empleado} AND status = 'Pendiente' GROUP BY solicitud`)
                .then((pendientes) => {
                    
                    for (let y = 0; y < pendientes.length; y++) {
                        
                        async function waitForPromise() {

                            let nombreSolicitante = await funcion.getEmpleadoNombre(pendientes[y].solicitante)
                            let id_jefe = await funcion.getIdJefe(pendientes[y].solicitante)
                            let gerente = await funcion.getEmpleadoNombre(id_jefe[0].emp_id_jefe)

                            let update = await funcion.updateConfirmarConfirmar(pendientes[y].solicitud, pendientes[y].jefe, "Confirmado")
                            let comment = await funcion.insertHistorial(pendientes[y].solicitud, pendientes[y].jefe, "Confirmado", "Confirmado Automatico")
                            let updateHoras = await funcion.updateHorasStatus(pendientes[y].solicitud, "Confirmado")
                            let confirmadoStatus = await funcion.getConfirmadoStatus(pendientes[y].solicitud)

                            let pendiente = 0
                            confirmadoStatus.forEach(element => {
                                if (element.status != "Confirmado") pendiente++
                            })
                            if (pendiente == 0) sendConfirmacionMail(gerente[0].emp_correo, pendientes[y].solicitud, nombreSolicitante[0].emp_correo, "mail_gerente", "gerencial")
                            
                            }
                             waitForPromise()                        
                    }

                }).catch((error) => { console.error(error); })
                
            }

        }).catch((error) => { console.log(error); })
});






async function sendConfirmacionMail(to, solicitud, solicitante, corre_template, nivel) {

    const data = await ejs.renderFile(path.join(__dirname, `../../mail/${corre_template}.ejs`), { supervisor: solicitante, solicitud: solicitud });
    let mailOptions = {
        from: "noreply@tristone.com",
        to: `${to}`,
        subject: `Aprobacion de tiempo extra nivel ${nivel} #${solicitud} `,
        text: "",
        html: data,
    };


    nodeMailer.transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.info(info);
        }
    })
}





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