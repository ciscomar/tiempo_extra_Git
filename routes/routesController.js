//Conexion a base de datos
const controller = {};

const moment = require('moment')
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');
const schedule = require('../public/js/functions/controllerSchedule');



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

    

    res.render('index.ejs', {user,sidebar});

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

    if (sidebar === "supervisor" || sidebar==="admin" ) {

        res.render("solicitud.ejs", { user,sidebar})

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

                async function waitForPromise() {
                    let getInfoEmpleado = await funcion.getInfoEmpleado(info[0].emp_id_jefe)
                    let getInfoExtra = await funcion.getInfoExtra(empleado, inicio, fin)
                    let getInfoDescanso1 = await funcion.getInfoDescanso(empleado, descanso1)
                    let getInfoDescanso2 = await funcion.getInfoDescanso(empleado, descanso2)
                    let getWeekInfoEmpleado = await funcion.getWeekInfoEmpleado(empleado, week_start, week_end)
                    let getEmpleadoPendiente = await funcion.getEmpleadoPendiente(empleado)
                    let getCostoArea = await funcion.getCostoArea(area_actual)


                    result.push(info)
                    Promise.all([getInfoEmpleado, getInfoExtra, getInfoDescanso1, getInfoDescanso2, getWeekInfoEmpleado, getEmpleadoPendiente, getCostoArea])
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
                
                for (let i = 0; i < listaJefes.length; i++) 
                { 
                    sendConfirmacionMail(listaJefes[i]+"@tristone.com", solicitud, solicitante, "mail_confirmacion", "supervisor") 
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

                    sendConfirmacionMail(listaJefes[i]+"@tristone.com", solicitud, solicitante, "mail_confirmacion", "supervisor") 
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
            let empLaboro=false

            for (let y = 3; y < 10; y++) {

                if (emp[y] > 0) {
                    empLaboro=true
                }

            }

            if(empLaboro){

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
            }else{

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

        res.render("solicitud_list.ejs", { id, sidebar, user})

    } else {
        res.redirect("/acceso_denegado")
    }

}



controller.pendiente_utilizado_GET = (req, res) => {
    let user = req.res.locals.authData[0]
    let id = req.param.id
    let sidebar = req.res.locals.authData[1]

    if (sidebar === "rh" || sidebar === "admin") {


        res.render("pendiente_utilizado.ejs", { sidebar, id, user })

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


controller.solicitud_historial_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('solicitud_historial.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }



}


controller.solicitud_historial_id_POST = (req, res) => {

    let id = req.body.id
    let empSolicitud = []
    let empturno = []
    let arrayHorasEmp = []
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
        let solicitudesPend = await funcion.getSolicitudesPendientes()
        let sumahorasAprob = await funcion.getSolicitudesSumaAprobado()


        for (let i = 0; i < solicitudesAprob.length; i++) {
            for (let y = 0; y < solicitudesPend.length; y++) {
                if (solicitudesAprob.length > 0) {
                    if (solicitudesAprob[i].solicitud == solicitudesPend[y].solicitud) {
                        solicitudesAprob.splice(i, 1)
                    }
                }
            }

        }

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

        res.render('confirmar.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.finalizar_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render('finalizar.ejs', { id, user, sidebar });

    } else {
        res.redirect("/acceso_denegado")
    }



}


controller.confirmar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "supervisor" || sidebar === "admin") {

        res.render('confirmar_historial_id.ejs', { id, sidebar, user});

    } else {
        res.redirect("/acceso_denegado")
    }


}

controller.aprobar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "gerente" || sidebar === "admin") {

        res.render('aprobar_historial_id.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}


controller.finalizar_historial_id_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]

    if (sidebar === "planta" || sidebar === "admin") {

        res.render('finalizar_historial_id.ejs', { id, sidebar, user });

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

    async function waitForPromise() {
        let result = []
        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(solicitante)
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



        let solicitudesConf = await funcion.getSolicitudesConfirmadas(arrayEmpleados)
        let solicitudesPend = await funcion.getSolicitudesPendientesConf(arrayEmpleados)
        let sumahorasConf = await funcion.getSolicitudesSumaConfirmadas(arrayEmpleados)




        for (let i = 0; i < solicitudesConf.length; i++) {
            for (let y = 0; y < solicitudesPend.length; y++) {
                if (solicitudesConf.length > 0) {
                    if (solicitudesConf[i].solicitud == solicitudesPend[y].solicitud) {
                        solicitudesConf.splice(i, 1)
                    }
                }
            }

        }

        result.push(allEmpleados)
        result.push(solicitudesConf)
        result.push(sumahorasConf)
        res.json(result)


    }
    waitForPromise()
}



controller.aprobar_GET = (req, res) => {

    let id = req.params.id
    let sidebar = req.res.locals.authData[1]
    let user = req.res.locals.authData[0]


    if (sidebar === "gerente" || sidebar === "admin") {

        res.render('aprobar.ejs', { id, sidebar, user });

    } else {
        res.redirect("/acceso_denegado")
    }


}



controller.aprobar_solicitud_POST = (req, res) => {


    let id = req.body.id
    let status = req.body.status
    let username = req.connection.user.substring(4)
    let comentario = req.body.comentario

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

        } else {
            solicitudes = await funcion.getManagerHorasEmpleadosUtilizado(startDate, endDate, arrayEmpleados)

        }


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

            } else {
                getInfoExtra = await funcion.getInfoExtraManagerUtilizado(empSolicitud[y], arrayEmpleados, inicio, fin)
                getInfoDescanso1 = await funcion.getInfoDescansoManagerUtilizado(empSolicitud[y], arrayEmpleados, descanso1)
                getInfoDescanso2 = await funcion.getInfoDescansoManagerUtilizado(empSolicitud[y], arrayEmpleados, descanso2)

            }

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
        } else {
            solicitudes = await funcion.getPlantManagerHorasEmpleadosUtilizado(startDate, endDate)
        }





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
            } else {
                getInfoExtra = await funcion.getInfoExtraPlantManagerUtilizado(empSolicitud[y], inicio, fin)
                getInfoDescanso1 = await funcion.getInfoDescansoPlantManagerUtilizado(empSolicitud[y], descanso1)
                getInfoDescanso2 = await funcion.getInfoDescansoPlantManagerUtilizado(empSolicitud[y], descanso2)

            }

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
        res.json({ result })
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
        } else {
            suma = await funcion.getTotalSupervisoresGerenteUtilizado(arrayEmpleados, fecha_inicial, fecha_final)
            costototal = await funcion.getCostoGerenteTotalUtilizado(arrayEmpleados, fecha_inicial, fecha_final)
        }


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
        } else {
            suma = await funcion.getTotalGerentesGerenteUtilizado(fecha_inicial, fecha_final)
            costototal = await funcion.getCostoPlantaTotalUtilizado(fecha_inicial, fecha_final)
        }

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


controller.getCostos_POST = (req, res) => {

    funcion.getCostos()
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

        res.render('solicitud_editar.ejs', { id, sidebar,user });

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




controller.getSolicitudesPendienteUtilizado_POST = (req, res) => {
    resultado = []

    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        resultado.push(allEmpleados)

        funcion.getSolicitudesPendienteUtilizado()
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




controller.InsertMotivo_POST = (req, res) => {
    motivo = req.body.motivo

    funcion.InsertMotivo(motivo)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { console.error(err) })



}




module.exports = controller;