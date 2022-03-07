const funcion = {};

const dbE = require('../../db/conn_empleados');
const dbT = require('../../db/conn_tiempo_extra');

var schedule = require('node-schedule');
const moment = require('moment')


funcion.getInfoEmpleado = (empleado) => {
    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            *
        FROM
            del_empleados
        WHERE
            emp_id = ${empleado}
 
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.insertSolicitud = (insert) => {
    return new Promise((resolve, reject) => {

        let sql = `INSERT INTO solicitud (solicitud,solicitante, empleado,turno, jefe, horas, motivo, area_actual, area_req, fecha, status,confirmado, fecha_conf, costo_hra) VALUES ?`;

        dbT(sql, [insert])
            .then((result) => {
                resolve(result.affectedRows)

            })
            .catch((error) => { console.error(error); reject(error) })

    })
}


funcion.insertUtilizado = (insert) => {
    return new Promise((resolve, reject) => {

        let sql = `INSERT INTO utilizado (solicitud,solicitante, empleado,turno, jefe, horas, motivo, area_actual, area_req, fecha, fecha_utilizado, costo_hra) VALUES ?`;

        dbT(sql, [insert])
            .then((result) => {
                resolve(result.affectedRows)

            })
            .catch((error) => { console.error(error); reject(error) })

    })
}



funcion.insertSolicitudHoras = (insert) => {
    return new Promise((resolve, reject) => {

        let sql = `INSERT INTO horas_solicitud (solicitud,solicitante, empleado,dobles, triples, descanso,status, fecha, costo_total) VALUES ?`;

        dbT(sql, [insert])
            .then((result) => {
                resolve(result.affectedRows)

            })
            .catch((error) => { console.error(error); reject(error) })

    })
}



funcion.insertHorasUtilizadas = (insert) => {
    return new Promise((resolve, reject) => {

        let sql = `INSERT INTO horas_utilizado (solicitud,solicitante, empleado,dobles, triples, descanso, fecha, costo_total) VALUES ?`;

        dbT(sql, [insert])
            .then((result) => {
                resolve(result.affectedRows)

            })
            .catch((error) => { console.error(error); reject(error) })

    })
}


funcion.getSolicitud = () => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud FROM solicitud ORDER BY solicitud DESC LIMIT 1`)
            .then((result) => { resolve(result[0]) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudes = (username) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *
        FROM 
            solicitud WHERE solicitante = "${username}" 
        GROUP BY 
            solicitud,status
        ORDER BY 
            solicitud DESC`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}

funcion.getSolicitudesSuma = (username) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud WHERE solicitante = "${username}" 
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}

funcion.getSolicitudesSumaConfirmar = (username) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud WHERE jefe = "${username}" 
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}

funcion.getAprobadosSuma = (username) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud WHERE aprobado = "${username}" 
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}


funcion.getSolicitudId = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE solicitud = ${id}`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getSolicitudIdUtilizado = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM utilizado WHERE solicitud = ${id}`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudesFechaSupervisor = (emp_id, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE jefe = ${emp_id}
        AND 
        (fecha BETWEEN  "${week_start}" AND "${week_end}")
        
        AND status != "Rechazado"

        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudesFechaGerente = (arrayEmpleados, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE (${arrayEmpleados})
        AND 
        (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND
        status != "Rechazado"

        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getTotalSupervisoresGerente = (arrayEmpleados, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM (dobles) AS dobles, SUM(triples) AS triples, SUM(descanso) AS descanso
        FROM 
            horas_solicitud WHERE (${arrayEmpleados})
        AND 
            (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND
            status != "Rechazado"
        GROUP BY 
            solicitante
        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getCostoGerenteTotalAprobado = (arrayEmpleados, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM (costo_total) AS costo
        FROM 
            horas_solicitud WHERE (${arrayEmpleados})
        AND 
            (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND
            status != "Rechazado"
        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getCostoPlantaTotalAprobado = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM (costo_total) AS costo
        FROM 
            horas_solicitud 
        WHERE
            (fecha BETWEEN  "${week_start}" AND "${week_end}")

        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getCostoGerenteTotalUtilizado = (arrayEmpleados, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM (costo_total) AS costo
        FROM 
            horas_utilizado WHERE (${arrayEmpleados})
        AND 
            (fecha BETWEEN  "${week_start}" AND "${week_end}")
        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getCostoPlantaTotalUtilizado = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM (costo_total) AS costo
        FROM 
            horas_utilizado 
        WHERE 
            (fecha BETWEEN  "${week_start}" AND "${week_end}")
        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getTotalSupervisoresGerenteUtilizado = (arrayEmpleados, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM (dobles) AS dobles, SUM(triples) AS triples, SUM(descanso) AS descanso
        FROM 
            horas_utilizado WHERE (${arrayEmpleados})
        AND 
            (fecha BETWEEN  "${week_start}" AND "${week_end}")

        GROUP BY 
            solicitante
        
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}





funcion.getTotalGerentesGerente = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *
        FROM (SELECT *, SUM(dobles) AS doble, SUM(triples) AS triple, SUM(descanso) AS descan FROM horas_solicitud WHERE status ="Finalizado" AND (fecha BETWEEN  "${week_start}" AND "${week_end}") GROUP BY solicitud,solicitante) h
         RIGHT JOIN (SELECT DISTINCT solicitud,solicitante, aprobado FROM solicitud WHERE status="Finalizado" AND (fecha BETWEEN  "${week_start}" AND "${week_end}") ) s 
        ON h.solicitud = s.solicitud
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getTotalGerentesGerenteUtilizado = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *
        FROM (SELECT *, SUM(dobles) AS doble, SUM(triples) AS triple, SUM(descanso) AS descan FROM horas_utilizado WHERE (fecha BETWEEN  "${week_start}" AND "${week_end}") GROUP BY solicitud,solicitante) h
         RIGHT JOIN (SELECT DISTINCT solicitud,solicitante, aprobado FROM solicitud WHERE status="Finalizado" AND (fecha BETWEEN  "${week_start}" AND "${week_end}") ) s 
        ON h.solicitud = s.solicitud
        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudesFechaPlanta = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE
        (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND status = "Finalizado"


        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getAllEmpleados = () => {
    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            emp_id, emp_nombre, emp_correo
        FROM
            del_empleados

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getEmpleadoId = (username) => {

    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            emp_id
        FROM
            del_empleados 
        WHERE 
            emp_correo LIKE "${username}%"

        `)
            .then((result) => { resolve(result[0].emp_id) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMyEmpleados = (emp_id) => {

    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            emp_id
        FROM
            del_empleados 
        WHERE 
            emp_id_jefe = ${emp_id}

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMyAprobaciones = (emp_id) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status= "Pendiente" 
        AND
            jefe= ${emp_id}

        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMyHistorialConfirmado = (idEmp) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            confirmado=${idEmp}
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMyHistorialAprobado = (idEmp) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            aprobado=${idEmp}
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMyHistorialFinalizado = (idEmp) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            finalizado=${idEmp}
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


// funcion.getMyAprobacionesFinalizar = () => {
//     return new Promise((resolve, reject) => {

//         dbT(`SELECT *, SUM(horas) AS horas 
//         FROM 
//             solicitud 
//         WHERE
//             status= "Confirmado" 

//         GROUP BY 
//             solicitud
//         ORDER BY 
//             solicitud DESC`)

//             .then((result) => { resolve(result) })
//             .catch((error) => { reject(error) })
//     })
// }


funcion.updateConfirmarConfirmar = (id, emp_id, status) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
            status = "${status}", confirmado=${emp_id}, fecha_conf=NOW()
        WHERE 
            solicitud = ${id} 
        AND 
            jefe=${emp_id}

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateConfirmarRechazar = (id, emp_id, status) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
            status = "${status}", confirmado=${emp_id}, fecha_conf=NOW()
        WHERE 
            solicitud = ${id} 

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateHorasStatus = (id, status) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE horas_solicitud
        SET 
            status = "${status}"
        WHERE 
            solicitud = ${id} 

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.updateFinalizar = (id, aprobado, status) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
            status = "${status}", finalizado=${aprobado}, fecha_fin=NOW()
        WHERE 
            solicitud = ${id} 

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getSolicitudesAprobadas = () => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Aprobado"
        AND 
            aprobado IS NOT NULL
            
        GROUP BY 
            solicitud`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudesPendientes = () => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Pendiente"
        OR
            status = "Rechazado" 
        OR
            status = "Confirmado" 

        GROUP BY 
            solicitud`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}




funcion.getSolicitudesConfirmadas = (arrayEmpleados) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Confirmado" 
        AND
            (${arrayEmpleados})
        GROUP BY 
            solicitud`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getSolicitudesSumaConfirmadas = (arrayEmpleados) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Confirmado" 
        AND
            (${arrayEmpleados})
        GROUP BY 
            solicitud`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}

funcion.getSolicitudesSumaAprobado = () => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Aprobado" 

        GROUP BY 
            solicitud`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}


funcion.getSolicitudesSumaFinalizado = (idEmp) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT solicitud, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            finalizado=${idEmp} 
            
        GROUP BY 
            solicitud`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}


funcion.getSolicitudesPendientesConf = (arrayEmpleados) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *, SUM(horas) AS horas 
        FROM 
            solicitud 
        WHERE
            status = "Pendiente"
        OR
            status = "Rechazado"  
        AND
            (${arrayEmpleados})

        GROUP BY 
            solicitud`)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateAprobar = (id, emp_id, status) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
            status = "${status}", aprobado=${emp_id}, fecha_aprob=NOW()
        WHERE 
            solicitud = ${id} 

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateSolicitudConf = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
             fecha_conf=NOW()
        WHERE 
            solicitud = ${id} 
        AND status="Confirmado"

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.insertHistorial = (id, aprobador, status, comentario) => {


    return new Promise((resolve, reject) => {
        dbT(`
        INSERT INTO 
            historial(solicitud,empleado,comentario,status)
        VALUES
            ('${id}','${aprobador}','${comentario}','${status}')
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getHistorial = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *
        FROM 
            historial 
        WHERE
            solicitud = "${id}"
        ORDER BY id DESC
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoExtra = (empleado, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")

        AND status != "Rechazado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoDescanso = (empleado, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
        AND fecha="${descanso}"

        AND status != "Rechazado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}




funcion.getInfoExtraFinalizado = (empleado, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")

        AND status = "Finalizado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoDescansoFinalizado = (empleado, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
        AND fecha="${descanso}"

        AND status = "Finalizado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

//Se elimina funcionalidad de horas laboradas

// funcion.getInfoExtraUtilizado = (empleado, week_start, week_end) => {
//     return new Promise((resolve, reject) => {

//         dbT(`SELECT SUM(horas) as horasExtra
//         FROM 
//             utilizado 
//         WHERE
//             empleado = "${empleado}"
//         AND (fecha BETWEEN  "${week_start}" AND "${week_end}")
//             `)

//             .then((result) => { resolve(result) })
//             .catch((error) => { reject(error) })
//     })
// }


// funcion.getInfoDescansoUtilizado = (empleado, descanso) => {
//     return new Promise((resolve, reject) => {

//         dbT(`SELECT SUM(horas) as horasDescanso
//         FROM 
//             utilizado 
//         WHERE
//             empleado = "${empleado}"
//         AND fecha="${descanso}"

//             `)

//             .then((result) => { resolve(result) })
//             .catch((error) => { reject(error) })
//     })
// }


funcion.getConfirmadoStatus = (solicitud) => {
    return new Promise((resolve, reject) => {

        dbT(`
        SELECT 
            DISTINCT(status) 
        FROM
         tiempo_extra.solicitud
        WHERE
            solicitud = ${solicitud};
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getSolicitante = (id) => {
    return new Promise((resolve, reject) => {

        dbE(`
        SELECT 
            solicitante
        FROM
            tiempo_extra.solicitud
        WHERE
            solicitud = ${id};
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getIdJefe = (solicitante) => {
    return new Promise((resolve, reject) => {

        dbE(`
        SELECT 
            emp_id_jefe
        FROM
            empleados.del_empleados
        WHERE
            emp_id = ${solicitante};
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getEmpleadoNombre = (solicitante) => {
    return new Promise((resolve, reject) => {

        dbE(`
        SELECT 
            emp_correo
        FROM
            empleados.del_empleados
        WHERE
            emp_id = ${solicitante};
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getManagerHorasEmpleados = (week_start, week_end, arrayempleados) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud 
        WHERE 
            (${arrayempleados}) 
        AND 
            (fecha BETWEEN "${week_start}" AND "${week_end}")
        AND
            status = "Aprobado"
            `)


            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getManagerHorasEmpleadosUtilizado = (week_start, week_end, arrayempleados) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM utilizado 
        WHERE 
            (${arrayempleados}) 
        AND 
            (fecha BETWEEN "${week_start}" AND "${week_end}")
            `)


            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getPlantManagerHorasEmpleados = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE fecha BETWEEN "${week_start}" AND "${week_end}"
        AND
            status = "Finalizado"
        `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getPlantManagerHorasEmpleadosUtilizado = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM utilizado WHERE fecha BETWEEN "${week_start}" AND "${week_end}"

        `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoExtraManager = (empleado, solicitantes, week_start, week_end) => {

    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
           
        AND 
            (${solicitantes})

        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")

        AND
            (status = "Aprobado" || status= "Finalizado")
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getInfoExtraManagerUtilizado = (empleado, solicitantes, week_start, week_end) => {

    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            utilizado 
        WHERE
            empleado = "${empleado}"
           
        AND 
            (${solicitantes})

        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")

            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoExtraPlantManager = (empleado, week_start, week_end) => {

    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
           
        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND
            status = "Finalizado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getInfoExtraPlantManagerUtilizado = (empleado, week_start, week_end) => {

    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasExtra
        FROM 
            utilizado 
        WHERE
            empleado = "${empleado}"
           
        AND (fecha BETWEEN  "${week_start}" AND "${week_end}")
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getInfoDescansoManager = (empleado, solicitantes, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
        AND 
            (${solicitantes})
            
        AND 
            fecha="${descanso}"
        AND
            (status = "Aprobado" || status="Finalizado")
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoDescansoManagerUtilizado = (empleado, solicitantes, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            utilizado 
        WHERE
            empleado = "${empleado}"
        AND 
            (${solicitantes})
            
        AND 
            fecha="${descanso}"

            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getInfoDescansoPlantManager = (empleado, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            solicitud 
        WHERE
            empleado = "${empleado}"
            
        AND fecha="${descanso}"
        AND
            status = "Finalizado"
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getInfoDescansoPlantManagerUtilizado = (empleado, descanso) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT SUM(horas) as horasDescanso
        FROM 
            utilizado 
        WHERE
            empleado = "${empleado}"
            
        AND fecha="${descanso}"

            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getMotivos = () => {
    return new Promise((resolve, reject) => {
        dbT(`
        SELECT 
            *
        FROM
            motivo
        ORDER BY
            motivo
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getAreas = () => {
    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            DISTINCT(emp_area)
        FROM
            del_empleados

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getCostos = () => {
    return new Promise((resolve, reject) => {
        dbT(`
        SELECT 
            *
        FROM
            costos

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getSolicitudHoras = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        SELECT 
            *
        FROM
            horas_solicitud
        WHERE 
            solicitud=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudHorasUtilizado = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        SELECT 
            *
        FROM
            horas_utilizado
        WHERE 
            solicitud=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getWeekInfoEmpleado = (empleado, week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud 
        WHERE
            empleado=${empleado}
        AND
            (fecha BETWEEN  "${week_start}" AND "${week_end}")
        AND
            status != "Rechazado"


        `
        )
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.deleteSolicitud = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        DELETE 
            
        FROM
            solicitud 
        WHERE 
            solicitud=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.deleteMotivo = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        DELETE 
            
        FROM
            motivo
        WHERE 
            id=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.deleteCosto = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        DELETE 
            
        FROM
            costos
        WHERE 
            id=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.deleteSolicitudHoras = (id) => {
    return new Promise((resolve, reject) => {
        dbT(`
        DELETE 
            
        FROM
            horas_solicitud 
        WHERE 
            solicitud=${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getEmpleadoPendiente = (empleado) => {

    return new Promise((resolve, reject) => {
        dbT(`
        SELECT COUNT(*) as pendiente 
            
        FROM
            solicitud 
        WHERE 
            empleado=${empleado}
        AND
            (status != "Finalizado" && status != "Rechazado")
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateFechaUtilizado = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`UPDATE solicitud
        SET 
            fecha_utilizado = NOW()
        WHERE 
            solicitud = ${id} 

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSolicitudesPendienteRH = () => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT *
        FROM 
            solicitud WHERE  (status = "Aprobado" || status="Pendiente" || status="Confirmado")
        GROUP BY 
            solicitud
        ORDER BY 
            solicitud DESC`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}



funcion.getCostoArea = (area) => {

    return new Promise((resolve, reject) => {
        dbT(`
        SELECT *
            
        FROM
            costos
        WHERE 
            area="${area}"

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.InsertCosto = (area, costo) => {


    return new Promise((resolve, reject) => {
        dbT(`
        INSERT INTO 
            costos(area,costo)
        VALUES
            ('${area}','${costo}')
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.InsertMotivo = (motivo) => {


    return new Promise((resolve, reject) => {
        dbT(`
        INSERT INTO 
            motivo(motivo)
        VALUES
            ('${motivo}')
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.Discover_Search = (base, tabla) => {
    return new Promise((resolve, reject) => {

        dbE(`SHOW COLUMNS FROM  del_empleados`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })


}



funcion.Insert_excel = (base, tabla, titulos, valores, callback) => {

    return new Promise((resolve, reject) => {
        let valor
        let = valores_finales = []
        let duplicate = []
        let promises = []

        //let date= new Date(valores[0][5]

        for (let i = 0; i < valores.length; i++) {

            valores_finales = []
            duplicate = []
            for (let y = 0; y < titulos.length; y++) {

                if (y == 5) {
                    if (typeof (valores[i][5]) === "object") {

                        let date = new Date(valores[0][5])
                        valor = `" ${date.toISOString().split("T")[0]}"`

                    } else {
                        valor = `"${valores[i][y]}"`
                    }
                } else {
                    if (typeof (valores[i][y]) === "string") {
                        valor = `"${valores[i][y]}"`
                    } else if (typeof (valores[i][y])) {
                        valor = valores[i][y]
                    } else if (valores[i][y] === undefined) {
                        valor = " "
                    }
                    else {
                        valor = valores[i][y]
                    }

                }

                valores_finales.push(valor)
                duplicate.push(`${titulos[y]}=${valor}`)
            }


            let promise = dbE(`INSERT INTO ${tabla} (${titulos.join()}) VALUES (${valores_finales}) ON DUPLICATE KEY UPDATE ${duplicate} `)
            promises.push(promise)

        }

        Promise.all(promises)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })

    })

}


funcion.Search_Empledos = () => {
    return new Promise((resolve, reject) => {
        dbE(`SELECT * FROM del_empleados WHERE 1`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getEmpleadoCorreo = (username) => {

    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            emp_id
        FROM
            del_empleados 
        WHERE 
            emp_correo LIKE "${username}%"

        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}
module.exports = funcion;