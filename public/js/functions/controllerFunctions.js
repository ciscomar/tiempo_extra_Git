const funcion = {};

const dbE = require('../../db/conn_empleados');
const dbT = require('../../db/conn_tiempo_extra');


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



funcion.insertSolicitud= (insert) => {
    return new Promise((resolve, reject) => {
        
    let sql  = `INSERT INTO solicitud (solicitud,solicitante, empleado,turno, jefe, horas, motivo, area_actual, area_req, fecha, status,confirmado, fecha_conf) VALUES ?`;
            
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

        dbT(`SELECT *, SUM(horas) AS horas 
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


funcion.getSolicitudId = (id) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE solicitud = ${id}`)
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


funcion.updateConfirmar = (id, emp_id, status) => {
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


funcion.updateAprobar= (id, emp_id, status) => {
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
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getConfirmadoStatus = (solicitud)=>{
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

funcion.getSolicitante = (id)=>{
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

funcion.getIdJefe = (solicitante)=>{
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

funcion.getEmpleadoNombre = (solicitante)=>{
    return new Promise((resolve, reject) => {

        dbE(`
        SELECT 
            emp_alias
        FROM
            empleados.del_empleados
        WHERE
            emp_id = ${solicitante};
            `)

            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getManagerHorasEmpleados = (week_start, week_end) => {
    return new Promise((resolve, reject) => {

        dbT(`SELECT * FROM solicitud WHERE 
        AND (fecha BETWEEN  "${week_start}" AND "${week_end}`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

module.exports = funcion;