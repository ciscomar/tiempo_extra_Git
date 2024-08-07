//Conexion a base de datos
const controller = {};

const moment = require('moment')
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');
const schedule = require('../public/js/functions/controllerSchedule');
const Excel = require('exceljs');


// Require email and email template
const ejs = require("ejs");
const nodeMailer = require('../public/mail/conn')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util');



async function sendConfirmacionMail(to, solicitud, solicitante, corre_template, nivel) {

    const data = await ejs.renderFile(path.join(__dirname, `../public/mail/${corre_template}.ejs`), { supervisor: solicitante, solicitud: solicitud });
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


controller.index_GET = (req, res) => {

    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]



    res.render('index.ejs', { user, sidebar });

}


controller.accesoDenegado_GET = (req, res) => {
    // let user = req.res.locals.authData[0]
    sidebar = "no"
    res.render('acceso_denegado.ejs', {
        sidebar, user
    });
}


controller.crear_solicitud_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("solicitud.ejs", { user, sidebar })

    } else {

        res.redirect("/acceso_denegado")
    }

}


controller.crear_vacaciones_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("vacaciones.ejs", { user, sidebar })

    } else {

        res.redirect("/acceso_denegado")
    }

}


controller.empleados_supervisor_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("empleados_supervisor.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.acumulado_gerente_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "gerente" || sidebar === "admin") {

        res.render("acumulado_gerente.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.gerente_supervisores_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "gerente" || sidebar === "admin") {

        res.render("gerente_supervisores.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.gerente_gerentes_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render("gerente_gerentes.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.acumulado_planta_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "planta" || sidebar === "admin" || sidebar === "rh") {

        res.render("acumulado_planta.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.acumulado_vacaciones_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "planta" || sidebar === "admin" || sidebar === "rh") {

        res.render("acumulado_vacaciones.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.reporte_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("reporte_bts.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.infoEmpleado_POST = (req, res) => {

    let week_end = req.body.week_end
    let week_start = req.body.week_start
    let empleado = req.body.empleado
    let week_start_moment = moment(req.body.week_start)
    let week_end_moment = moment(req.body.week_end)
    let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
    let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
    let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
    let descanso1
    let descanso2
    let inicio
    let fin

    let result = []
    funcion.getInfoEmpleado(empleado)
        .then((info) => {
            if (info.length > 0) {

                if (info[0].emp_turno == 3) {

                    descanso1 = week_start
                    descanso2 = week_end
                    inicio = tuesday
                    fin = saturday
                } else {
                    descanso1 = saturday
                    descanso2 = week_end
                    inicio = week_start
                    fin = friday
                }

                let area_actual = info[0].emp_area

                let condicion = 'status != "Rechazado"'
                let signo = '!='
                async function waitForPromise() {
                    let getInfoEmpleado = await funcion.getInfoEmpleado(info[0].emp_id_jefe)
                    let getInfoExtra = await funcion.getInfoExtra(empleado, inicio, fin, 0, condicion, signo)
                    let getInfoDescanso1 = await funcion.getInfoDescanso(empleado, descanso1, 0, condicion, signo)
                    let getInfoDescanso2 = await funcion.getInfoDescanso(empleado, descanso2, 0, condicion, signo)
                    let getWeekInfoEmpleado = await funcion.getWeekInfoEmpleado(empleado, week_start, week_end)
                    let getEmpleadoPendiente = await funcion.getEmpleadoPendiente(empleado, week_start, week_end)
                    let getCostoArea = await funcion.getCostoArea(area_actual)

                    let allEmpleados = await funcion.getAllEmpleados()


                    result.push(info)
                    Promise.all([getInfoEmpleado, getInfoExtra, getInfoDescanso1, getInfoDescanso2, getWeekInfoEmpleado, getEmpleadoPendiente, getCostoArea, allEmpleados])
                        .then((r) => {
                            result.push(r)
                            res.json({ result })

                        })

                }
                waitForPromise()



            } else {
                res.json([0])
            }
        })
        .catch((err) => { console.error(err) })

}


controller.sendSolicitud_POST = (req, res) => {

    let empleados = req.body.empleados
    let fechas = req.body.fechas
    let motivo = req.body.motivo
    let solicitante = req.connection.user.substring(4)



    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(solicitante)
        let lastSolicitud = await funcion.getSolicitud();
        let solicitud
        let gerente
        let listaJefes = []

        if (lastSolicitud == undefined) {
            solicitud = 1
        } else {
            solicitud = lastSolicitud.solicitud + 1
        }

        let insert = await getArray(solicitud, emp_id, empleados, fechas, motivo);
        let arrayHoras = await getArrayHoras(solicitud, emp_id, empleados, fechas, motivo);
        let insertHoras = await funcion.insertSolicitudHoras(arrayHoras)
        let comment = await funcion.insertHistorial(solicitud, emp_id, "Confirmado", "Solicitud Creada")

        funcion.insertSolicitud(insert)
            .then((result) => {
                for (let i = 0; i < empleados.length; i++) {
                    if (empleados[i][12] != emp_id && listaJefes.indexOf(empleados[i][13]) === -1) {
                        listaJefes.push(empleados[i][13])
                    } else {
                        gerente = empleados[i][12]
                        //console.log(empleados[i][12]);
                    }
                }

                for (let i = 0; i < listaJefes.length; i++) {
                    sendConfirmacionMail(listaJefes[i] + "@tristone.com", solicitud, solicitante, "mail_confirmacion", "supervisor")
                }
                if (listaJefes.length == 0) {

                    async function waitForPromise() {
                        let gerente_id = await funcion.getIdJefe(gerente)
                        let gerente_alias = await funcion.getEmpleadoNombre(gerente_id[0].emp_id_jefe)
                        sendConfirmacionMail(gerente_alias[0].emp_correo, solicitud, solicitante, "mail_gerente", "gerencial")
                    }
                    waitForPromise()
                }
                res.json(result)

            })
            .catch((err) => { console.error(err) })


    }
    waitForPromise()




}






controller.editarSolicitud_POST = (req, res) => {

    let empleados = req.body.empleados
    let fechas = req.body.fechas
    let motivo = req.body.motivo
    let solicitante = req.connection.user.substring(4)
    let solicitud = req.body.solicitud


    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(solicitante)
        let gerente
        let listaJefes = []

        let deleteSolicitud = await funcion.deleteSolicitud(solicitud)
        let deleteSolicitudHoras = await funcion.deleteSolicitudHoras(solicitud)
        let insert = await getArray(solicitud, emp_id, empleados, fechas, motivo);
        let arrayHoras = await getArrayHoras(solicitud, emp_id, empleados, fechas, motivo);
        let insertHoras = await funcion.insertSolicitudHoras(arrayHoras)
        let comment = await funcion.insertHistorial(solicitud, emp_id, "Confirmado", "Solicitud Editada")

        funcion.insertSolicitud(insert)
            .then((result) => {
                for (let i = 0; i < empleados.length; i++) {
                    if (empleados[i][12] != emp_id && listaJefes.indexOf(empleados[i][13]) === -1) {
                        listaJefes.push(empleados[i][13])
                    } else {

                        gerente = empleados[i][12]

                    }
                }
                for (let i = 0; i < listaJefes.length; i++) {

                    sendConfirmacionMail(listaJefes[i] + "@tristone.com", solicitud, solicitante, "mail_confirmacion", "supervisor")
                }
                if (listaJefes.length == 0) {

                    async function waitForPromise() {
                        let gerente_id = await funcion.getIdJefe(gerente)
                        let gerente_alias = await funcion.getEmpleadoNombre(gerente_id[0].emp_id_jefe)
                        sendConfirmacionMail(gerente_alias[0].emp_correo, solicitud, solicitante, "mail_gerente", "gerencial")
                    }
                    waitForPromise()
                }
                res.json(result)

            })
            .catch((err) => { console.error(err) })


    }
    waitForPromise()

}



function getArray(solicitud, solicitante, empleados, fecha, motivo) {

    let todayDate = moment()
    let myDate = moment(todayDate).format('YYYY/MM/DD HH:mm:ss');
    return new Promise((resolve, reject) => {

        let arreglo_insertar = []

        empleados.forEach(emp => {

            let datenum = 0
            for (let i = 3; i < 10; i++) {
                let temp = []
                if (emp[i] > 0) {
                    temp.push(solicitud)
                    temp.push(solicitante)
                    temp.push(emp[0])
                    temp.push(emp[2])
                    temp.push(emp[12])
                    temp.push(emp[i])
                    temp.push(motivo)
                    temp.push(emp[10])
                    temp.push(emp[11])
                    temp.push(fecha[datenum])
                    if (solicitante == emp[12]) {
                        temp.push("Confirmado")
                        temp.push(solicitante)
                        temp.push(myDate)

                    } else {
                        temp.push("Pendiente")
                        temp.push(null)
                        temp.push(null)
                    }

                    temp.push(emp[17])

                    arreglo_insertar.push(temp)
                }
                datenum++

            }

        });
        resolve(arreglo_insertar)
    })
}




function getArrayUtilizado(solicitud, solicitante, empleados, fecha, motivo) {

    let todayDate = moment()
    let myDate = moment(todayDate).format('YYYY/MM/DD HH:mm:ss');
    return new Promise((resolve, reject) => {

        let arreglo_insertar = []

        empleados.forEach(emp => {

            let datenum = 0
            let empLaboro = false

            for (let y = 3; y < 10; y++) {

                if (emp[y] > 0) {
                    empLaboro = true
                }

            }

            if (empLaboro) {

                for (let i = 3; i < 10; i++) {
                    let temp = []
                    if (emp[i] > 0) {
                        temp.push(solicitud)
                        temp.push(solicitante)
                        temp.push(emp[0])
                        temp.push(emp[2])
                        temp.push(emp[12])
                        temp.push(emp[i])
                        temp.push(motivo)
                        temp.push(emp[10])
                        temp.push(emp[11])
                        temp.push(fecha[datenum])
                        temp.push(myDate)
                        temp.push(emp[17])

                        arreglo_insertar.push(temp)
                    }
                    datenum++
                }
            } else {

                let temp = []
                temp.push(solicitud)
                temp.push(solicitante)
                temp.push(emp[0])
                temp.push(emp[2])
                temp.push(emp[12])
                temp.push(emp[3])
                temp.push(motivo)
                temp.push(emp[10])
                temp.push(emp[11])
                temp.push(fecha[datenum])
                temp.push(myDate)
                temp.push(emp[17])

                arreglo_insertar.push(temp)


            }

        });
        resolve(arreglo_insertar)
    })
}



function getArrayHoras(solicitud, solicitante, empleados, fecha, motivo) {

    return new Promise((resolve, reject) => {

        let arreglo_insertar = []

        empleados.forEach(emp => {

            let temp = []

            temp.push(solicitud)
            temp.push(solicitante)
            temp.push(emp[0])
            temp.push(emp[14])
            temp.push(emp[15])
            temp.push(emp[16])

            if (solicitante == emp[12]) {
                temp.push("Confirmado")

            } else {
                temp.push("Pendiente")
            }

            temp.push(fecha[0])
            temp.push(emp[18])

            console.log(emp[18]);

            arreglo_insertar.push(temp)

        });
        // console.log(arreglo_insertar);
        resolve(arreglo_insertar)
    })
}




function getArrayHorasUtilizado(solicitud, solicitante, empleados, fecha, motivo) {

    return new Promise((resolve, reject) => {

        let arreglo_insertar = []

        empleados.forEach(emp => {

            let temp = []

            temp.push(solicitud)
            temp.push(solicitante)
            temp.push(emp[0])
            temp.push(emp[14])
            temp.push(emp[15])
            temp.push(emp[16])
            temp.push(fecha[0])
            temp.push(emp[18])
            arreglo_insertar.push(temp)

        });
        // console.log(arreglo_insertar);
        resolve(arreglo_insertar)
    })
}



controller.solicitud_list_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("solicitud_list.ejs", { id, sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}

controller.solicitud_list_vacaciones_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("solicitud_list_vacaciones.ejs", { id, sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.pendiente_rh_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "rh" || sidebar === "admin") {


        res.render("pendiente_rh.ejs", { sidebar, id, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.busqueda_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "rh" || sidebar === "admin") {


        res.render("busqueda.ejs", { sidebar, id, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.configuracion_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "rh" || sidebar === "admin") {

        res.render("configuracion.ejs", { sidebar, id, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.getSolicitudes_POST = (req, res) => {

    let username = req.connection.user.substring(4)
    let resultados = []
    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(username)
        let sumaSolicitudes = await funcion.getSolicitudesSuma(emp_id)
        resultados.push(sumaSolicitudes)
        funcion.getSolicitudes(emp_id)
            .then((result) => {
                resultados.push(result)
                res.json(resultados)
            })
            .catch((err) => { console.error(err) })


    }

    waitForPromise()
}


controller.getSolicitudesVacaciones_POST = (req, res) => {

    let username = req.connection.user.substring(4)
    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(username)

        funcion.getSolicitudesVacaciones(emp_id)
            .then((result) => {
              
                res.json(result)
            })
            .catch((err) => { console.error(err) })


    }

    waitForPromise()
}


controller.getSolicitudVacaciones_POST = (req, res) => {

   
    let id = req.body.id
    async function waitForPromise() {

        funcion.getSolicitudVacacionesId(id)
            .then((result) => {
               
                res.json(result)
            })
            .catch((err) => { console.error(err) })


    }

    waitForPromise()
}


controller.solicitud_historial_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('solicitud_historial_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }



}


//TODAY
controller.solicitud_historial_id_POST = (req, res) => {

    let id = req.body.id
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    let paso = req.body.paso
    let username = req.connection.user.substring(4)
    async function waitForPromise() {
        let result = []
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        let infoWeekEmpleado = []
        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []


            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let condicion
            let signo
            if (paso === "crear") { condicion = 'status != "Rechazado"', signo = '!=' }
            else if (paso === "confirmar") { condicion = 'status != "Rechazado"', signo = '!=' }
            else if (paso === "aprobar") { condicion = "(status = 'Aprobado' OR status='Finalizado')", signo = '!=' }
            else if (paso === "finalizar") { condicion = "status = 'Finalizado'", signo = '!=' }
            else if (paso === "historial_confirmar") { condicion = "status != 'Rechazado'", signo = '<' }
            else if (paso === "historial_aprobar") { condicion = "(status = 'Aprobado' OR status='Finalizado')", signo = '<' }
            else if (paso === "historial_finalizar") { condicion = "status = 'Finalizado'", signo = '<' }


            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin, id, condicion, signo)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1, id, condicion, signo)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2, id, condicion, signo)

            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)


            let getWeekInfoEmpleado = await funcion.getWeekInfoEmpleadoEditar(empSolicitud[y], startDate, endDate, id)
            //console.log(getWeekInfoEmpleado);
            infoWeekEmpleado.push(getWeekInfoEmpleado)

        }
        result.push(arrayHorasEmp)
        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)
        result.push(infoWeekEmpleado)
        result.push(username)
        res.json({ result })
    }

    waitForPromise()
}



controller.confirmar_list_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("confirmar_list.ejs", { user, sidebar })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.finalizar_list_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render("finalizar_list.ejs", { sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.getConfirmar_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)
        let sumaSolicitudes = await funcion.getSolicitudesSumaConfirmar(emp_id)
        let result = []
        result.push(allEmpleados)
        funcion.getMyAprobaciones(emp_id)
            .then((resu) => {

                result.push(resu)
                result.push(sumaSolicitudes)
                res.json(result)
            })
            .catch((err) => { console.error(err) })

    }
    waitForPromise()


}



controller.getSolicitudesFinalizar_POST = (req, res) => {


    async function waitForPromise() {
        let result = []
        let allEmpleados = await funcion.getAllEmpleados()
        let solicitudesAprob = await funcion.getSolicitudesAprobadas()
        //let solicitudesPend = await funcion.getSolicitudesPendientes()
        let sumahorasAprob = await funcion.getSolicitudesSumaAprobado()


        // for (let i = 0; i < solicitudesAprob.length; i++) {
        //     for (let y = 0; y < solicitudesPend.length; y++) {
        //         if (solicitudesAprob.length > 0) {
        //             if (solicitudesAprob[i].solicitud == solicitudesPend[y].solicitud) {
        //                 solicitudesAprob.splice(i, 1)
        //             }
        //         }
        //     }

        // }

        result.push(allEmpleados)
        result.push(solicitudesAprob)
        result.push(sumahorasAprob)
        res.json(result)


    }
    waitForPromise()


}



controller.confirmar_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('confirmar_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.finalizar_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render('finalizar_NEW.ejs', { id, user, sidebar });

    } else {
        res.redirect("/acceso_denegado")
    }



}


controller.confirmar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin" || sidebar === "rh") {

        res.render('confirmar_historial_id_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}

controller.aprobar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "gerente" || sidebar === "admin") {

        res.render('aprobar_historial_id_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.finalizar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render('finalizar_historial_id_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}




controller.confirmar_id_POST = (req, res) => {


    let id = req.body.id
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)
        result.push(username)

        res.json({ result })
    }

    waitForPromise()

}



controller.confirmar_historial_id_POST = (req, res) => {
    let id = req.body.id
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)

        res.json({ result })
    }

    waitForPromise()

}




controller.aprobar_historial_id_POST = (req, res) => {

    let id = req.body.id
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)

        res.json({ result })
    }

    waitForPromise()
}


controller.finalizar_historial_id_POST = (req, res) => {
    let id = req.body.id
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)

        res.json({ result })
    }

    waitForPromise()
}


controller.confirmar_solicitud_POST = (req, res) => {

    let id = req.body.id
    let status = req.body.status
    let username = req.connection.user.substring(4)
    let comentario = req.body.comentario
    let pendiente = 0

    if (comentario == "") { comentario = status }

    async function waitForPromise() {

        let solicitante = await funcion.getSolicitante(id)
        let nombreSolicitante = await funcion.getEmpleadoNombre(solicitante[0].solicitante)
        let id_jefe = await funcion.getIdJefe(solicitante[0].solicitante)
        let gerente = await funcion.getEmpleadoNombre(id_jefe[0].emp_id_jefe)
        let aprobador = await funcion.getEmpleadoId(username)


        if (status == "Confirmado") {
            let update = await funcion.updateConfirmarConfirmar(id, aprobador, status)
        } else {
            let update = await funcion.updateConfirmarRechazar(id, aprobador, status)
        }

        let comment = await funcion.insertHistorial(id, aprobador, status, comentario)
        let confirmadoStatus = await funcion.getConfirmadoStatus(id)
        let updateHoras = await funcion.updateHorasStatus(id, status)

        confirmadoStatus.forEach(element => {
            if (element.status != "Confirmado") pendiente++
        })
        if (status != "Confirmado") sendConfirmacionMail(nombreSolicitante[0].emp_correo, id, username, "mail_rechazo", "supervisor: Rechazo")
        if (pendiente == 0) sendConfirmacionMail(gerente[0].emp_correo, id, nombreSolicitante[0].emp_correo, "mail_gerente", "gerencial")

        res.json(comment)
    }

    waitForPromise()
}





controller.finalizar_solicitud_POST = (req, res) => {
    let id = req.body.id
    let status = req.body.status
    let username = req.connection.user.substring(4)
    let comentario = req.body.comentario

    // info solicitud_horas
    let empleados = req.body.empleados
    let fechas = req.body.fechas
    let motivo = ""
    let solicitante = req.body.solicitante

    console.log(empleados);
    //

    if (comentario == "") { comentario = status }

    async function waitForPromise() {

        let aprobador = await funcion.getEmpleadoId(username)
        let update = await funcion.updateFinalizar(id, aprobador, status)
        let comment = await funcion.insertHistorial(id, aprobador, status, comentario)
        let updateHoras = await funcion.updateHorasStatus(id, status)

        let solicitante_id = await funcion.getSolicitante(id)
        let soilicitante_nombre = await funcion.getEmpleadoNombre(solicitante_id[0].solicitante)

        if (status != "Finalizado") {
            sendConfirmacionMail(soilicitante_nombre[0].emp_correo, id, username, "mail_rechazo", "Gerencial Planta: Rechazo")
        } else {
            // insert solicitud_horas
            let deleteSolicitudHoras = await funcion.deleteSolicitudHoras(id)
            let arrayHoras = await getArrayHoras(id, solicitante, empleados, fechas, motivo);
            let insertHoras = await funcion.insertSolicitudHoras(arrayHoras)
            let updateHorasA = await funcion.updateHorasStatus(id, "Finalizado")
            //

            sendConfirmacionMail(soilicitante_nombre[0].emp_correo, id, username, "mail_aprobacion", "Gerencial Planta")
        }

        res.json(comment)
    }

    waitForPromise()

}


controller.confirmar_historial_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]


    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render("confirmar_historial.ejs", { sidebar, user })

    } else {
        res.redirect("/acceso_denegado")

    }



}


controller.finalizar_historial_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]


    if (sidebar === "planta" || sidebar === "admin") {

        res.render("finalizar_historial.ejs", { sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}


controller.getHistorialConfirmado_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)
        let sumaSolicitudes = await funcion.getSolicitudesSumaConfirmar(emp_id)

        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialConfirmado(emp_id)
            .then((resu) => {

                result.push(resu)
                result.push(sumaSolicitudes)
                res.json(result)
            })
            .catch((err) => { console.error(err) })

    }
    waitForPromise()

}





controller.getHistorialAprobado_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)
        let sumaSolicitudes = await funcion.getAprobadosSuma(emp_id)

        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialAprobado(emp_id)
            .then((resu) => {

                result.push(resu)
                result.push(sumaSolicitudes)
                res.json(result)
            })
            .catch((err) => { console.error(err) })

    }
    waitForPromise()

}


controller.getHistorialFinalizado_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)
        let sumahorasAprob = await funcion.getSolicitudesSumaFinalizado(emp_id)


        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialFinalizado(emp_id)
            .then((resu) => {

                result.push(resu)
                result.push(sumahorasAprob)
                res.json(result)
            })
            .catch((err) => { console.error(err) })

    }
    waitForPromise()

}


controller.aprobar_list_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]


    if (sidebar === "gerente" || sidebar === "admin") {

        res.render("aprobar_list.ejs", { sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}




controller.aprobar_historial_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]


    if (sidebar === "gerente" || sidebar === "admin") {

        res.render("aprobar_historial.ejs", { sidebar, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.getSolicitudesAprobar_POST = (req, res) => {

    let solicitante = req.connection.user.substring(4)

    console.log(solicitante);

    async function waitForPromise() {
        let result = []
        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(solicitante)
        let myEmpleados = await funcion.getMyEmpleados(emp_id)

        console.log(emp_id);
        console.log(myEmpleados);

        let arrayEmpleados = ""
        let inc = 0
        myEmpleados.forEach(emp => {

            if (inc == 0) {
                arrayEmpleados += `solicitante="${emp.emp_id}"`

            } else {
                arrayEmpleados += ` OR solicitante= "${emp.emp_id}"`
            }
            inc++
        });


        let solicitudesConf = await funcion.getSolicitudesConfirmadas(arrayEmpleados)
        let solicitudesPend = await funcion.getSolicitudesPendientesConf(arrayEmpleados)
        let sumahorasConf = await funcion.getSolicitudesSumaConfirmadas(arrayEmpleados)


        async function processLoop() {
            const indicesToRemove = [];
            
            for (let i = 0; i < solicitudesConf.length; i++) {
                for (let y = 0; y < solicitudesPend.length; y++) {
                    if (solicitudesConf[i].solicitud === solicitudesPend[y].solicitud) {
                        indicesToRemove.push(i);
                        break; // Exit the inner loop since we found a match
                    }
                }
            }
        
            // Remove elements in reverse order to avoid index shifting issues
            for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                solicitudesConf.splice(indicesToRemove[i], 1);
            }
        }

        async function main() {
            await processLoop();
            result.push(allEmpleados)
            result.push(solicitudesConf)
            result.push(sumahorasConf)

            res.json(result)
        }

        main();




    }
    waitForPromise()
}



controller.aprobar_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]


    if (sidebar === "gerente" || sidebar === "admin") {

        res.render('aprobar_NEW.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}



controller.aprobar_solicitud_POST = (req, res) => {


    let id = req.body.id
    let status = req.body.status
    let username = req.connection.user.substring(4)
    let comentario = req.body.comentario

    // info solicitud_horas
    let empleados = req.body.empleados
    let fechas = req.body.fechas
    let motivo = ""
    let solicitante = req.body.solicitante
    //

    if (comentario == "") { comentario = status }

    async function waitForPromise() {

        let aprobador = await funcion.getEmpleadoId(username)
        let update = await funcion.updateAprobar(id, aprobador, status)
        let comment = await funcion.insertHistorial(id, aprobador, status, comentario)
        let updateHoras = await funcion.updateHorasStatus(id, status)



        let solicitante_id = await funcion.getSolicitante(id)
        let soilicitante_nombre = await funcion.getEmpleadoNombre(solicitante_id[0].solicitante)

        if (status != "Aprobado") {
            sendConfirmacionMail(soilicitante_nombre[0].emp_correo, id, username, "mail_rechazo", "gerencial: Rechazo")
        } else {

            // insert solicitud_horas
            let deleteSolicitudHoras = await funcion.deleteSolicitudHoras(id)
            let arrayHoras = await getArrayHoras(id, solicitante, empleados, fechas, motivo);
            let insertHoras = await funcion.insertSolicitudHoras(arrayHoras)
            let updateHorasA = await funcion.updateHorasStatus(id, "Aprobado")
            //

            let gerentePlanta_id = await funcion.getIdJefe(aprobador)
            let gerentePlanta_nombre = await funcion.getEmpleadoNombre(gerentePlanta_id[0].emp_id_jefe)
            sendConfirmacionMail(gerentePlanta_nombre[0].emp_correo, id, username, "mail_gerente_planta", "Gerencial Planta")
        }

        res.json(comment)
    }

    waitForPromise()
}



controller.aprobar_id_POST = (req, res) => {

    let id = req.body.id
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)
        res.json({ result })
    }

    waitForPromise()
}



controller.finalizar_id_POST = (req, res) => {
    let id = req.body.id
    let username = req.connection.user.substring(4)
    // let empSolicitud = []
    // let empturno = []
    // let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudId(id)
        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        // let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        // let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        // let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        // let descanso1
        // let descanso2
        // let inicio
        // let fin


        result.push(emp_id)
        result.push(solicitud)
        result.push(empleados)

        // for (let i = 0; i < solicitud.length; i++) {
        //     if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
        //         empSolicitud.push(solicitud[i].empleado)
        //         empturno.push(solicitud[i].turno)
        //     }
        // }

        // for (let y = 0; y < empSolicitud.length; y++) {
        //     let temp = []

        //     if (empturno[y] == 3) {

        //         descanso1 = startDate
        //         descanso2 = endDate
        //         inicio = tuesday
        //         fin = saturday
        //     } else {
        //         descanso1 = saturday
        //         descanso2 = endDate
        //         inicio = startDate
        //         fin = friday
        //     }

        //     let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
        //     let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
        //     let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
        //     temp.push(empSolicitud[y])
        //     temp.push(getInfoExtra[0].horasExtra)
        //     temp.push(getInfoDescanso1[0].horasDescanso)
        //     temp.push(getInfoDescanso2[0].horasDescanso)
        //     arrayHorasEmp.push(temp)

        // }

        // result.push(arrayHorasEmp)

        let solicitudHoras = await funcion.getSolicitudHoras(id)
        result.push(solicitudHoras)

        res.json({ result })
    }

    waitForPromise()
}



controller.historial_POST = (req, res) => {
    let id = req.body.id
    async function waitForPromise() {

        let historial = await funcion.getHistorial(id)
        let empleados = await funcion.getAllEmpleados(id)
        Promise.all([historial, empleados])
            .then((result) => {

                res.json({ result })

            })
    }

    waitForPromise()
}



controller.getHorasGerente_POST = (req, res) => {

    let fechaSelectInicial = req.body.fecha_inicial
    let fechaSelectFinal = req.body.fecha_final
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    let result = []
    let tabla = req.body.tabla



    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(username)
        let myEmpleados = await funcion.getMyEmpleados(emp_id)

        //console.log(myEmpleados);
        let arrayEmpleados = ""
        let inc = 0
        myEmpleados.forEach(emp => {

            if (inc == 0) {
                arrayEmpleados += `solicitante="${emp.emp_id}"`

            } else {
                arrayEmpleados += ` OR solicitante= "${emp.emp_id}"`
            }
            inc++
        });

        if (fechaSelectInicial == undefined) {

            momentdate = moment()
            weekNumber = moment().week() - 1
            week_day = momentdate.weekday()
            date = moment(momentdate).format('YYYY-MM-DD');
            date = new Date(date)
            let sumdays1
            let sumdays2
            if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
            startDate = startDate.toISOString().split('T')[0]
            endDate = endDate.toISOString().split('T')[0]

        } else {

            let dateObj = new Date(fechaSelectInicial);
            momentdate = moment(dateObj)
            weekNumber = momentdate.week() - 1
            startDate = fechaSelectInicial
            endDate = fechaSelectFinal

        }




        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        let solicitudes
        if (tabla == "aprobado") {

            solicitudes = await funcion.getManagerHorasEmpleados(startDate, endDate, arrayEmpleados)

        }
        // else {
        //     solicitudes = await funcion.getManagerHorasEmpleados(startDate, endDate, arrayEmpleados)
        //     //Se comenta linea para remover horas utilizado por aprobado 
        //     //solicitudes = await funcion.getManagerHorasEmpleadosUtilizado(startDate, endDate, arrayEmpleados)

        // }


        for (let i = 0; i < solicitudes.length; i++) {
            if (empSolicitud.indexOf(solicitudes[i].empleado) === -1) {
                empSolicitud.push(solicitudes[i].empleado)
                empturno.push(solicitudes[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra
            let getInfoDescanso1
            let getInfoDescanso2

            if (tabla == "aprobado") {

                getInfoExtra = await funcion.getInfoExtraManager(empSolicitud[y], arrayEmpleados, inicio, fin)
                getInfoDescanso1 = await funcion.getInfoDescansoManager(empSolicitud[y], arrayEmpleados, descanso1)
                getInfoDescanso2 = await funcion.getInfoDescansoManager(empSolicitud[y], arrayEmpleados, descanso2)

            }
            // else {

            //     getInfoExtra = await funcion.getInfoExtraManager(empSolicitud[y], arrayEmpleados, inicio, fin)
            //     getInfoDescanso1 = await funcion.getInfoDescansoManager(empSolicitud[y], arrayEmpleados, descanso1)
            //     getInfoDescanso2 = await funcion.getInfoDescansoManager(empSolicitud[y], arrayEmpleados, descanso2)

            //     // Se comenta para remover tiempo utilizado
            //     // getInfoExtra = await funcion.getInfoExtraManagerUtilizado(empSolicitud[y], arrayEmpleados, inicio, fin)
            //     // getInfoDescanso1 = await funcion.getInfoDescansoManagerUtilizado(empSolicitud[y], arrayEmpleados, descanso1)
            //     // getInfoDescanso2 = await funcion.getInfoDescansoManagerUtilizado(empSolicitud[y], arrayEmpleados, descanso2)

            // }

            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)
        result.push(weekNumber)
        res.json({ result })

    }
    waitForPromise()


}





controller.getHorasGerentePlanta_POST = (req, res) => {

    let fechaSelectInicial = req.body.fecha_inicial
    let fechaSelectFinal = req.body.fecha_final
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    let result = []
    let tabla = req.body.tabla

    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(username)

        if (fechaSelectInicial == undefined) {
            momentdate = moment()
            weekNumber = moment().week() - 1
            week_day = momentdate.weekday()
            date = moment(momentdate).format('YYYY-MM-DD');
            date = new Date(date)
            let sumdays1
            let sumdays2
            if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
            startDate = startDate.toISOString().split('T')[0]
            endDate = endDate.toISOString().split('T')[0]
        } else {

            let dateObj = new Date(fechaSelectInicial);
            momentdate = moment(dateObj)
            weekNumber = momentdate.week() - 1
            startDate = fechaSelectInicial
            endDate = fechaSelectFinal
        }

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin



        let solicitudes

        if (tabla == "aprobado") {
            solicitudes = await funcion.getPlantManagerHorasEmpleados(startDate, endDate)
        }
        // else {
        //     //Se elimina funcionalidad de horas laboradas
        //    // solicitudes = await funcion.getPlantManagerHorasEmpleadosUtilizado(startDate, endDate)

        //    solicitudes = await funcion.getPlantManagerHorasEmpleados(startDate, endDate)
        // }




        for (let i = 0; i < solicitudes.length; i++) {
            if (empSolicitud.indexOf(solicitudes[i].empleado) === -1) {
                empSolicitud.push(solicitudes[i].empleado)
                empturno.push(solicitudes[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }


            let getInfoExtra
            let getInfoDescanso1
            let getInfoDescanso2
            if (tabla == "aprobado") {
                getInfoExtra = await funcion.getInfoExtraPlantManager(empSolicitud[y], inicio, fin)
                getInfoDescanso1 = await funcion.getInfoDescansoPlantManager(empSolicitud[y], descanso1)
                getInfoDescanso2 = await funcion.getInfoDescansoPlantManager(empSolicitud[y], descanso2)
            }
            // else {
            //     getInfoExtra = await funcion.getInfoExtraPlantManager(empSolicitud[y], inicio, fin)
            //     getInfoDescanso1 = await funcion.getInfoDescansoPlantManager(empSolicitud[y], descanso1)
            //     getInfoDescanso2 = await funcion.getInfoDescansoPlantManager(empSolicitud[y], descanso2)
            //     //Se elimina la funcionalidad de laborado
            //     // getInfoExtra = await funcion.getInfoExtraPlantManagerUtilizado(empSolicitud[y], inicio, fin)
            //     // getInfoDescanso1 = await funcion.getInfoDescansoPlantManagerUtilizado(empSolicitud[y], descanso1)
            //     // getInfoDescanso2 = await funcion.getInfoDescansoPlantManagerUtilizado(empSolicitud[y], descanso2)

            // }

            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)
        result.push(weekNumber)
        res.json({ result })

    }
    waitForPromise()
}


controller.empleados_supervisor_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let solicitud = await funcion.getSolicitudesFechaSupervisor(emp_id, fecha_inicial, fecha_final)
        let empleados = await funcion.getAllEmpleados()

        startDate = fecha_inicial
        endDate = fecha_final

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let condicion = 'status != "Rechazado"'
            let signo = '!='
            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin, 0, condicion, signo)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1, 0, condicion, signo)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2, 0, condicion, signo)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)
        res.json({ result })
    }

    waitForPromise()
}




controller.acumulado_gerente_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    let username = req.connection.user.substring(4)
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let myEmpleados = await funcion.getMyEmpleados(emp_id)


        let arrayEmpleados = ""
        let inc = 0
        myEmpleados.forEach(emp => {

            if (inc == 0) {
                arrayEmpleados += `solicitante="${emp.emp_id}"`

            } else {
                arrayEmpleados += ` OR solicitante= "${emp.emp_id}"`
            }
            inc++
        });


        let solicitud = await funcion.getSolicitudesFechaGerente(arrayEmpleados, fecha_inicial, fecha_final)
        let empleados = await funcion.getAllEmpleados()

        startDate = fecha_inicial
        endDate = fecha_final

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtra(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescanso(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescanso(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)
        res.json({ result })
    }

    waitForPromise()
}




controller.acumulado_planta_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    async function waitForPromise() {
        let result = []


        let solicitud = await funcion.getSolicitudesFechaPlanta(fecha_inicial, fecha_final)

        let empleados = await funcion.getAllEmpleados()

        startDate = fecha_inicial
        endDate = fecha_final

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtraFinalizado(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescansoFinalizado(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescansoFinalizado(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }

        result.push(arrayHorasEmp)
        res.json({ result })
    }

    waitForPromise()
}



controller.acumulado_planta_vacaciones_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    async function waitForPromise() {
        let result = []


        let solicitud = await funcion.getVacacionesFechaPlanta(fecha_inicial, fecha_final)

        result.push(solicitud)
        res.json({ result })
    }

    waitForPromise()
}



controller.reporte_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final

    async function waitForPromise() {

        let solicitud = await funcion.getSolicitudesFechaPlanta(fecha_inicial, fecha_final)


        res.json({ solicitud })
    }

    waitForPromise()
}






controller.gerente_supervisores_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    let username = req.connection.user.substring(4)
    let tabla = req.body.tabla

    async function waitForPromise() {
        let result = []
        let emp_id = await funcion.getEmpleadoId(username)
        let myEmpleados = await funcion.getMyEmpleados(emp_id)




        let arrayEmpleados = ""
        let inc = 0
        myEmpleados.forEach(emp => {

            if (inc == 0) {
                arrayEmpleados += `solicitante="${emp.emp_id}"`

            } else {
                arrayEmpleados += ` OR solicitante= "${emp.emp_id}"`
            }
            inc++
        });

        let suma
        let costototal
        if (tabla == "aprobado") {
            suma = await funcion.getTotalSupervisoresGerente(arrayEmpleados, fecha_inicial, fecha_final)
            costototal = await funcion.getCostoGerenteTotalAprobado(arrayEmpleados, fecha_inicial, fecha_final)
        }
        // else {
        //     suma = await funcion.getTotalSupervisoresGerenteUtilizado(arrayEmpleados, fecha_inicial, fecha_final)
        //     costototal = await funcion.getCostoGerenteTotalUtilizado(arrayEmpleados, fecha_inicial, fecha_final)
        // }


        let empleados = await funcion.getAllEmpleados()


        result.push(suma)
        result.push(empleados)
        result.push(costototal)

        res.json({ result })
    }

    waitForPromise()
}





controller.gerente_gerentes_fecha_POST = (req, res) => {

    let fecha_inicial = req.body.fecha_inicial
    let fecha_final = req.body.fecha_final
    let tabla = req.body.tabla
    async function waitForPromise() {
        let result = []
        let suma
        let costototal
        if (tabla == "aprobado") {
            suma = await funcion.getTotalGerentesGerente(fecha_inicial, fecha_final)
            costototal = await funcion.getCostoPlantaTotalAprobado(fecha_inicial, fecha_final)
        }
        // else {
        //     suma = await funcion.getTotalGerentesGerenteUtilizado(fecha_inicial, fecha_final)
        //     costototal = await funcion.getCostoPlantaTotalUtilizado(fecha_inicial, fecha_final)
        // }

        let empleados = await funcion.getAllEmpleados()
        let input = suma

        const resultado = input.reduce((reduceresult, item) => {
            const existing = reduceresult.find(x => x.aprobado === item.aprobado);
            if (existing) {
                existing.doble += item.doble;
                existing.triple += item.triple;
                existing.descan += item.descan;
            } else {
                reduceresult.push(item);
            }

            return reduceresult;
        }, []);

        result.push(resultado)
        result.push(empleados)
        result.push(costototal)

        res.json({ result })
    }

    waitForPromise()
}



controller.getMotivos_POST = (req, res) => {

    funcion.getMotivos()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}



controller.getAreas_POST = (req, res) => {

    async function waitForPromise() {

        areas = await funcion.getAreas()
        areasCosto = await funcion.getCostos()



        for (let i = 0; i < areasCosto.length; i++) {

            for (let y = 0; y < areas.length; y++) {

                if (areas[y].emp_area == areasCosto[i].area) {
                    areas.splice(y, 1)

                }


            }
        }



        res.json(areas)

    }

    waitForPromise()

}

controller.deleteMotivo_POST = (req, res) => {

    id = req.body.id

    funcion.deleteMotivo(id)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}


controller.deleteCosto_POST = (req, res) => {

    id = req.body.id

    funcion.deleteCosto(id)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

controller.deleteVacaciones_POST = (req, res) => {

    id = req.body.id

    funcion.deleteVacaciones(id)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}


controller.getCostos_POST = (req, res) => {

    funcion.getCostos()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

controller.getVacaciones_POST = (req, res) => {

    funcion.getVacaciones()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })

}




controller.solicitud_editar_GET = (req, res) => {

    let id = req.params.id
    let user = req.res.locals.authData[0]
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('solicitud_editar.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }



}

controller.solicitud_utilizado_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('solicitud_utilizado.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.solicitud_utilizado_historial_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('solicitud_utilizado_historial.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.solicitud_utilizado_id_POST = (req, res) => {

    let id = req.body.id
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
    let tipo = req.body.tipo
    async function waitForPromise() {
        let result = []
        let solicitud
        if (tipo == "historial") {
            solicitud = await funcion.getSolicitudIdUtilizado(id)
        } else {
            solicitud = await funcion.getSolicitudId(id)
        }

        let empleados = await funcion.getAllEmpleados(id)
        let date = solicitud[0].fecha

        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        startDate = startDate.toISOString().split('T')[0]
        endDate = endDate.toISOString().split('T')[0]

        let week_start_moment = moment(startDate)
        let week_end_moment = moment(endDate)
        let saturday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let friday = week_end_moment.subtract(1, "days").format('YYYY-MM-DD')
        let tuesday = week_start_moment.add(1, "days").format('YYYY-MM-DD')
        let descanso1
        let descanso2
        let inicio
        let fin

        result.push(solicitud)
        result.push(empleados)

        for (let i = 0; i < solicitud.length; i++) {
            if (empSolicitud.indexOf(solicitud[i].empleado) === -1) {
                empSolicitud.push(solicitud[i].empleado)
                empturno.push(solicitud[i].turno)
            }
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp = []

            if (empturno[y] == 3) {

                descanso1 = startDate
                descanso2 = endDate
                inicio = tuesday
                fin = saturday
            } else {
                descanso1 = saturday
                descanso2 = endDate
                inicio = startDate
                fin = friday
            }

            let getInfoExtra = await funcion.getInfoExtraUtilizado(empSolicitud[y], inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescansoUtilizado(empSolicitud[y], descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescansoUtilizado(empSolicitud[y], descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)

        }
        result.push(arrayHorasEmp)

        let solicitudHoras
        if (tipo == "historial") {
            solicitudHoras = await funcion.getSolicitudHorasUtilizado(id)
        } else {
            solicitudHoras = await funcion.getSolicitudHoras(id)
        }

        result.push(solicitudHoras)
        res.json({ result })
    }

    waitForPromise()
}




controller.horas_utilizadas_POST = (req, res) => {

    let empleados = req.body.empleados
    let fechas = req.body.fechas
    let motivo = req.body.motivo
    let solicitante = req.connection.user.substring(4)
    let solicitud = req.body.solicitud


    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(solicitante)
        let gerente
        let listaJefes = []


        let insert = await getArrayUtilizado(solicitud, emp_id, empleados, fechas, motivo);
        let arrayHoras = await getArrayHorasUtilizado(solicitud, emp_id, empleados, fechas, motivo);
        let insertHorasUtilizadas = await funcion.insertHorasUtilizadas(arrayHoras)
        let comment = await funcion.insertHistorial(solicitud, emp_id, "Confirmado", "Horas Laboradas")
        let updateFechaUtilizado = await funcion.updateFechaUtilizado(solicitud)

        let insertUtilziadoTabla = await funcion.insertUtilizado(insert)
        res.json(insertUtilziadoTabla)

        // funcion.insertUtilizado(insert)
        //     .then((result) => {
        //         for (let i = 0; i < empleados.length; i++) {
        //             if (empleados[i][12] != emp_id && listaJefes.indexOf(empleados[i][13]) === -1) {
        //                 listaJefes.push(empleados[i][13])
        //             } else {
        //                 gerente = empleados[i][12]
        //                 //console.log(empleados[i][12]);
        //             }
        //         }
        //         for (let i = 0; i < listaJefes.length; i++) { sendConfirmacionMail(listaJefes[i], solicitud, solicitante, "mail_confirmacion", "supervisor") }
        //         if (listaJefes.length == 0) {

        //             async function waitForPromise() {
        //                 let gerente_id = await funcion.getIdJefe(gerente)
        //                 let gerente_alias = await funcion.getEmpleadoNombre(gerente_id[0].emp_id_jefe)
        //                 sendConfirmacionMail(gerente_alias[0].emp_correo, solicitud, solicitante, "mail_gerente", "gerencial")
        //             }
        //             waitForPromise()
        //         }
        //         res.json(result)

        //     })
        //     .catch((err) => { console.error(err) })


    }
    waitForPromise()




}




controller.getSolicitudesPendienteRH_POST = (req, res) => {
    resultado = []

    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        resultado.push(allEmpleados)

        funcion.getSolicitudesPendienteRH()
            .then((result) => {
                resultado.push(result)
                res.json(resultado)
            })
            .catch((err) => { console.error(err) })

    }

    waitForPromise()
}


controller.getBusqueda_POST = (req, res) => {
    resultado = []

    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        resultado.push(allEmpleados)

        funcion.getBusqueda()
            .then((result) => {
                resultado.push(result)
                res.json(resultado)
            })
            .catch((err) => { console.error(err) })

    }

    waitForPromise()
}



controller.InsertCosto_POST = (req, res) => {
    area = req.body.area
    costo = req.body.costo

    funcion.InsertCosto(area, costo)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { console.error(err) })



}


controller.InsertVacaciones_POST = (req, res) => {
    empleado = req.body.empleado
    nombre = req.body.nombre
    tipo = req.body.tipo
    fecha = req.body.fecha

    funcion.InsertVacaciones(empleado, nombre, tipo, fecha)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { console.error(err) })



}




controller.InsertMotivo_POST = (req, res) => {
    motivo = req.body.motivo

    funcion.InsertMotivo(motivo)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { console.error(err) })



}



controller.catalogo_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "rh" || sidebar === "admin" || sidebar === "rhc") {

        res.render("catalogo.ejs", { sidebar, id, user })

    } else {
        res.redirect("/acceso_denegado")
    }

}




controller.insertar_catalogo_POST = (req, res) => {

    let base = "empleados"
    let tabla = "del_empleados"

    let arreglo = [];
    let titulos = [];
    let titulos2 = [];
    let valores = [];
    let emp_id = [];
    let emp_id2;
    let count = 0;

    const wb = new Excel.Workbook();

    funcion.Discover_Search(base, tabla).then((formato) => {


        wb.xlsx.load(req.file.buffer)
            .then(() => {
                worksheet = wb.worksheets[0]
                worksheet.eachRow(function (row, rowNumber) {
                    val = row.values
                    for (let i = 0; i < val.length; i++) {
                        if (val[i] === undefined) {
                            val[i] = " "
                        }

                    }
                    arreglo.push(val)
                });
            })
            .then(() => {
                for (let i = 0; i < arreglo.length; i++) {
                    arreglo[i].shift()
                }
                for (let i = 0; i < arreglo[0].length; i++) {
                    titulos.push(`\`${arreglo[0][i]}\``)
                    titulos2.push((arreglo[0][i]).toUpperCase())
                }
            })
            .then(() => {

                if (formato.length === titulos2.length) {
                    for (let i = 0; i < titulos2.length; i++) {

                        if (titulos2.includes((formato[i].Field).toUpperCase())) { count++ }
                    }




                    if (formato.length != count) {

                        res.json("Titulos del documento no coinciden con la base de datos")

                    } else {

                        for (let i = 0; i < titulos2.length; i++) {
                            if (titulos2[i] == "EMP_ID") {
                                emp_id2 = i
                            }
                        }
                        for (let i = 0; i < arreglo.length; i++) {

                            emp_id.push((arreglo[i][emp_id2]))
                        }
                        let unique = [...new Set(emp_id)];
                        for (let i = 1; i < arreglo.length; i++) {

                            valores.push(arreglo[i])
                        }

                        if (emp_id.length != unique.length) {

                            res.json("Numero de Empleado duplicado verifique su informacion")

                        } else {

                            funcion.Insert_excel(base, tabla, titulos, valores)
                                .then((result) => {

                                    res.json("ok")
                                })
                                .catch((err) => { console.error(err) })


                        }

                    }
                } else {

                    res.json("Columnas del documento no coinciden con la base de datos")
                }
            })



    })
        .catch((err) => { console.error(err) })




}


controller.Search_Empleados_GET = (req, res) => {
    funcion.Search_Empledos()
        .then(result => {
            etiquetas_empleados = result
            base = "base"
            tabla = "tabla"
            res.json(etiquetas_empleados, base, tabla)
        })
        .catch(err => { console.error(err) })
}




controller.cancelar_solicitud_POST = (req, res) => {

    let id = req.body.id
    let solicitante = req.connection.user.substring(4)

    async function waitForPromise() {
        let emp_id = await funcion.getEmpleadoId(solicitante)
        let comment = await funcion.insertHistorial(id, emp_id, "Rechazado", "Solicitud Cancelada")

        funcion.cancelarSolicitud(id)
            .then((result) => {
                res.json(result)
            })
            .catch((err) => { res.json(err) })

    }
    waitForPromise()

}




controller.infoEmpleadoConfig_POST = (req, res) => {

    let empleado = req.body.empleado
    funcion.getInfoEmpleado(empleado)
        .then((result) => {
            res.json(result)
        })


}


controller.InsertVacaciones_POST = (req, res) => {
    let empleado = req.body.empleado
    let nombre = req.body.nombre
    let tipo = req.body.tipo
    let fecha = req.body.fecha

    funcion.InsertVacaciones(empleado, nombre, tipo, fecha)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { console.error(err) })



}




controller.finalizar_solicitud_multiple_POST = (req, res) => {
    let username = req.connection.user.substring(4)
    let ids = req.body.id
    ids.forEach(id => {
        async function waitForPromise() {

            let aprobador = await funcion.getEmpleadoId(username)
            let update = await funcion.updateFinalizar(id, aprobador, "Finalizado")
            let comment = await funcion.insertHistorial(id, aprobador, "Finalizado", "Finalizado")
            let updateHoras = await funcion.updateHorasStatus(id, "Finalizado")
            let solicitante_id = await funcion.getSolicitante(id)
            let soilicitante_nombre = await funcion.getEmpleadoNombre(solicitante_id[0].solicitante)

            sendConfirmacionMail(soilicitante_nombre[0].emp_correo, id, username, "mail_aprobacion", "Gerencial Planta")
        }

        waitForPromise()
    });

    res.json("ok")




}



controller.getDiasVacaciones_POST = (req, res) => {
    let gafete = req.body.numeroEmpleado
    let supervisor = username = req.connection.user.substring(4)

    funcion.getDiasVacaciones(gafete)
        .then((result) => {
            funcion.getUserJefe(result[0].emp_id_jefe).then((result2) => {

                if(result2[0].emp_alias.toUpperCase() == supervisor.toUpperCase()){
                    res.json(result)
                }else{
                    res.json("No es tu empleado")
                
                }

            }).catch((err) => { console.error(err) })
        })
        .catch((err) => { res.json(err) })


}


controller.solicitud_vacaciones_POST = async (req, res) => {
    let data = req.body
    let username = req.connection.user.substring(4)
    let solicitante = await funcion.getEmpleadoId(username)
    let lastSolicitud = await funcion.getSolicitudVacaciones();
    let solicitud

    if (lastSolicitud == undefined) {
        solicitud = 1
    } else {
        solicitud = lastSolicitud.solicitud + 1
    }

   funcion.insertSolicitudVacaciones(solicitante, data, solicitud).then((result) => {
        res.json(result)
   }).catch((err) => { console.error(err) })




}


module.exports = controller;