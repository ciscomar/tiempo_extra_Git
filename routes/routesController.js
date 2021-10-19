//Conexion a base de datos
const controller = {};


const moment = require('moment')
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');

// Require email and email template
const ejs = require("ejs");
const nodeMailer = require('../public/mail/conn')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util');


function acceso(req) {
    let acceso = []
    let userGroups = req.connection.userGroups

    return new Promise((resolve, reject) => {
        userGroups.forEach(element => {
            if (element.toString() === 'TFT\\TFT.DEL.PAGES_Extrusion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CambioProduccion') {
                acceso.push(element.toString())
            }
        });
        let response = acceso.length == 0 ? reject("noAccess") : resolve(acceso)
    })

}

async function sendConfirmacionMail(to, solicitud, solicitante, corre_template, nivel) {
    // console.log({ to }, { solicitud }, { solicitante }, { corre_template }, { nivel });

    const data = await ejs.renderFile(path.join(__dirname, `../public/mail/${corre_template}.ejs`), { supervisor: solicitante, solicitud: solicitud });
    let mailOptions = {
        from: "noreply@tristone.com",
        to: `${to}@tristone.com`,
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
    user = req.connection.user
    res.render('index.ejs', {
        user
    });
}


controller.accesoDenegado_GET = (req, res) => {
    user = req.connection.user
    res.render('acceso_denegado.ejs', {
        user
    });
}


controller.crear_solicitud_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {
                res.render("solicitud.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
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

                if (info[0].emp_activo == 3) {

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



                async function waitForPromise() {
                    let getInfoEmpleado = await funcion.getInfoEmpleado(info[0].emp_id_jefe)
                    let getInfoExtra = await funcion.getInfoExtra(empleado, inicio, fin)
                    let getInfoDescanso1 = await funcion.getInfoDescanso(empleado, descanso1)
                    let getInfoDescanso2 = await funcion.getInfoDescanso(empleado, descanso2)


                    result.push(info)
                    Promise.all([getInfoEmpleado, getInfoExtra, getInfoDescanso1, getInfoDescanso2])
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

        funcion.insertSolicitud(insert)
            .then((result) => {
                for (let i = 0; i < empleados.length; i++) {
                    if (empleados[i][12] != emp_id && listaJefes.indexOf(empleados[i][13]) === -1) {
                        listaJefes.push(empleados[i][13])
                    } else {
                        gerente = empleados[i][12]
                        console.log(empleados[i][12]);
                    }
                }
                for (let i = 0; i < listaJefes.length; i++) { sendConfirmacionMail(listaJefes[i], solicitud, solicitante, "mail_confirmacion", "supervisor") }
                if (listaJefes.length == 0) {

                    async function waitForPromise() {
                        let gerente_id = await funcion.getIdJefe(gerente)
                        let gerente_alias = await funcion.getEmpleadoNombre(gerente_id[0].emp_id_jefe)
                        sendConfirmacionMail(gerente_alias[0].emp_alias, solicitud, solicitante, "mail_gerente", "gerencial")
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


                    arreglo_insertar.push(temp)
                }
                datenum++

            }

        });
        resolve(arreglo_insertar)
    })
}



controller.solicitud_list_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    let id = req.param.id

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("solicitud_list.ejs", { result, id })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}


controller.getSolicitudes_POST = (req, res) => {

    let username = req.connection.user.substring(4)

    async function waitForPromise() {

        let emp_id = await funcion.getEmpleadoId(username)
        funcion.getSolicitudes(emp_id)
            .then((result) => {
                res.json(result)
            })
            .catch((err) => { console.error(err) })


    }

    waitForPromise()
}


controller.solicitud_historial_GET = (req, res) => {

    let id = req.params.id

    res.render('solicitud_historial.ejs', {
        id
    });


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
        res.json({ result })
    }

    waitForPromise()
}



controller.confirmar_list_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("confirmar_list.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}


controller.finalizar_list_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("finalizar_list.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}



controller.getConfirmar_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)

        let result = []
        result.push(allEmpleados)
        funcion.getMyAprobaciones(emp_id)
            .then((resu) => {

                result.push(resu)
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
        res.json(result)


    }
    waitForPromise()


}



controller.confirmar_GET = (req, res) => {

    let id = req.params.id

    res.render('confirmar.ejs', {
        id
    });


}


controller.finalizar_GET = (req, res) => {

    let id = req.params.id

    res.render('finalizar.ejs', {
        id
    });


}


controller.confirmar_historial_id_GET = (req, res) => {

    let id = req.params.id

    res.render('confirmar_historial_id.ejs', {
        id
    });


}

controller.aprobar_historial_id_GET = (req, res) => {

    let id = req.params.id

    res.render('aprobar_historial_id.ejs', {
        id
    });


}


controller.finalizar_historial_id_GET = (req, res) => {

    let id = req.params.id

    res.render('finalizar_historial_id.ejs', {
        id
    });


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
        let update = await funcion.updateConfirmar(id, aprobador, status)
        let comment = await funcion.insertHistorial(id, aprobador, status, comentario)
        let confirmadoStatus = await funcion.getConfirmadoStatus(id)

        confirmadoStatus.forEach(element => {
            if (element.status != "Confirmado") pendiente++
        })
        if (status != "Confirmado") sendConfirmacionMail(nombreSolicitante[0].emp_alias, id, username, "mail_rechazo", "supervisor: Rechazo")
        if (pendiente == 0) sendConfirmacionMail(gerente[0].emp_alias, id, nombreSolicitante[0].emp_alias, "mail_gerente", "gerencial")

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

        let solicitante_id = await funcion.getSolicitante(id)
        let soilicitante_nombre = await funcion.getEmpleadoNombre(solicitante_id[0].solicitante)

        if (status != "Finalizado") {
            sendConfirmacionMail(soilicitante_nombre[0].emp_alias, id, username, "mail_rechazo", "Gerencial Planta: Rechazo")
        } else {

            sendConfirmacionMail(soilicitante_nombre[0].emp_alias, id, username, "mail_aprobacion", "Gerencial Planta")
        }

        res.json(comment)
    }

    waitForPromise()

}


controller.confirmar_historial_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("confirmar_historial.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}


controller.finalizar_historial_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("finalizar_historial.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}


controller.getHistorialConfirmado_POST = (req, res) => {

    let username = req.connection.user.substring(4)


    async function waitForPromise() {

        let allEmpleados = await funcion.getAllEmpleados()
        let emp_id = await funcion.getEmpleadoId(username)


        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialConfirmado(emp_id)
            .then((resu) => {

                result.push(resu)
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


        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialAprobado(emp_id)
            .then((resu) => {

                result.push(resu)
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


        let result = []
        result.push(allEmpleados)
        funcion.getMyHistorialFinalizado(emp_id)
            .then((resu) => {

                result.push(resu)
                res.json(result)
            })
            .catch((err) => { console.error(err) })

    }
    waitForPromise()

}


controller.aprobar_list_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("aprobar_list.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}




controller.aprobar_historial_GET = (req, res) => {
    user = req.connection.user
    let access = ""

    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {

                res.render("aprobar_historial.ejs", { result })

            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
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
        res.json(result)


    }
    waitForPromise()
}



controller.aprobar_GET = (req, res) => {

    let id = req.params.id

    res.render('aprobar.ejs', {
        id
    });


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

        let solicitante_id = await funcion.getSolicitante(id)
        let soilicitante_nombre = await funcion.getEmpleadoNombre(solicitante_id[0].solicitante)

        if (status != "Aprobado") {
            sendConfirmacionMail(soilicitante_nombre[0].emp_alias, id, username, "mail_rechazo", "gerencial: Rechazo")
        } else {
            let gerentePlanta_id = await funcion.getIdJefe(aprobador)
            let gerentePlanta_nombre = await funcion.getEmpleadoNombre(gerentePlanta_id[0].emp_id_jefe)
            sendConfirmacionMail(gerentePlanta_nombre[0].emp_alias, id, username, "mail_gerente_planta", "Gerencial Planta")
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

    let username = req.connection.user.substring(4)
    let empSolicitud=[]
    let empturno=[]
    let arrayHorasEmp=[]

    async function waitForPromise() {

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
        
        momentdate=moment()
        week_day=momentdate.weekday()
        date= moment(momentdate).format('YYYY-MM-DD');
        date= new Date(date)
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

        let solicitudes= await funcion.getManagerHorasEmpleados(startDate, endDate,arrayEmpleados)

        for (let i = 0; i < solicitudes.length; i++) {
            if (empSolicitud.indexOf(solicitudes[i].empleado) === -1) {
                empSolicitud.push(solicitudes[i].empleado)
                empturno.push(solicitudes[i].turno)
            }   
        }

        for (let y = 0; y < empSolicitud.length; y++) {
            let temp=[]

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

            let getInfoExtra = await funcion.getInfoExtraManager(empSolicitud[y],arrayEmpleados, inicio, fin)
            let getInfoDescanso1 = await funcion.getInfoDescansoManager(empSolicitud[y],arrayEmpleados, descanso1)
            let getInfoDescanso2 = await funcion.getInfoDescansoManager(empSolicitud[y],arrayEmpleados, descanso2)
            temp.push(empSolicitud[y])
            temp.push(getInfoExtra[0].horasExtra)
            temp.push(getInfoDescanso1[0].horasDescanso)
            temp.push(getInfoDescanso2[0].horasDescanso)
            arrayHorasEmp.push(temp)
            
        }

        console.log(arrayHorasEmp);


    }
    waitForPromise()


}

module.exports = controller;