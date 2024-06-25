let id = document.getElementById("id").value
let semanaInput = document.getElementById("semana")
let motivo = document.getElementById("motivo")
let btnCerrar = document.getElementById("btnCerrar")

let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false

  }
);

let tableHistorial = $('#tableHistorial').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);


let numero_semana = document.getElementById("numero_semana")
let tableAcumulado = $('#tableAcumulado').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false,
    ordering: false

  }
);


$(document).ready(function () {



  data = { "id": `${id}` }


  axios({
    method: 'post',
    url: `/aprobar_historial_id`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      let supervisor=result.data.result[0]
      data = result.data.result[1]
      dataempleados = result.data.result[2]
      dataHoras = result.data.result[3]
      dataSolicitudHoras = result.data.result[4]

      fecha = data[0].fecha
       let datef = new Date(fecha.substring(0,fecha.indexOf('T'))+'T08:00:00.000z')



      momentdate=moment(datef)
      week_day=momentdate.weekday()
      let sumdays1
      let sumdays2

      if(week_day==0){sumdays1=-6, sumdays2=0 }else{sumdays1=+1 ,sumdays2=+7}


      semanaInput.value = $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + sumdays1)) + "  a  " +
        $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + sumdays2))



      motivo.value = data[0].motivo
      let semana = []
      for (let i = 1; i < 8; i++) {
        if(week_day==0){semana.push($.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() -7 + i)))}
        else{semana.push($.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + i)))}
      }

      let empleados = []
      let empleados_jefe = []
      let empleados_confirmado = []
      let empleados_aprobado = []
      let empleados_turno = []
      
      for (let i = 0; i < data.length; i++) {

        if (empleados.indexOf(data[i].empleado) === -1) {
          empleados.push(data[i].empleado)
          empleados_jefe.push(data[i].jefe)
          empleados_confirmado.push(data[i].confirmado)
          empleados_aprobado.push(data[i].aprobado)
          empleados_turno.push(data[i].turno)
        }
      }

      let empleados_nombre = []
      for (let i = 0; i < empleados.length; i++) {
        for (let y = 0; y < dataempleados.length; y++) {
          if (empleados[i] == dataempleados[y].emp_id) {
            empleados_nombre.push(dataempleados[y].emp_nombre)
          }

        }
      }

      let jefe_nombre = []
      for (let i = 0; i < empleados_jefe.length; i++) {

        if (empleados_jefe[i] != null) {
          for (let y = 0; y < dataempleados.length; y++) {
            if (empleados_jefe[i] == dataempleados[y].emp_id) {
              jefe_nombre.push(dataempleados[y].emp_correo.substring(0, dataempleados[y].emp_correo.indexOf('@')))
            }
          }
        } else {
          jefe_nombre.push("")
        }


      }



      let temp = []
      let row = []
      let area_actual
      let area_req
      let status

      for (let i = 0; i < empleados.length; i++) {

        temp.push(empleados[i])
        temp.push(empleados_nombre[i])
        temp.push(empleados_turno[i])

        for (let y = 0; y < semana.length; y++) {
          let found = false;

          for (let x = 0; x < data.length; x++) {

            if (data[x].empleado == empleados[i] && semana[y] === data[x].fecha.substring(0, data[x].fecha.indexOf("T"))) {
              temp.push(data[x].horas)
              area_actual = data[x].area_actual
              area_req = data[x].area_req
              status = data[x].status
              found = true;
            }
          }
          if (!found) {
            temp.push(0)

          }
        }


        for (let s = 0; s < dataSolicitudHoras.length; s++) {

          if (empleados[i] == dataSolicitudHoras[s].empleado) {

            let classColor2 = ""
            if (dataSolicitudHoras[s].triples > 0) { classColor2 = "danger" } else { classColor2 = "extraA" }
            temp.push(`<input type="text"  class="extraA" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dataSolicitudHoras[s].dobles}" disabled>`)
            temp.push(`<input type="text" class="${classColor2}" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dataSolicitudHoras[s].triples}" disabled>`)
            temp.push(`<input type="text"  class="extraA" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dataSolicitudHoras[s].descanso}" disabled>`)
          }
        }


        temp.push(area_actual)
        temp.push(area_req)
        temp.push(jefe_nombre[i])

        for (let z = 0; z < dataHoras.length; z++) {

          if(dataHoras[z][0]===empleados[i]){

          let extrax2 = 0
          let extrax3 = 0
          let descanso = 0
          let horasExtra = dataHoras[z][1]
          let horasDescanso1 = dataHoras[z][2]
          let horasDescanso2 = dataHoras[z][3]

          extrax2 = horasExtra

          //Horas extra dobles y triples
          if (horasExtra == null) {
            horasExtra = 0
          }
          if (horasExtra <= 9) {
            extrax2 = horasExtra
          } else {
            extrax2 = 9
            extrax3 = horasExtra - 9
          }

          //Horas descanso laborado1

          if (isNaN(horasDescanso1)) {
            horasDescanso1 = 0
          }

          let doble = extrax2
          let triple = extrax3

          if (horasDescanso1 <= 8) {
            descanso = horasDescanso1
          } else {
            descanso = 8
            restante = horasDescanso1 - 8

            if ((doble + restante) <= 9) {
              extrax2 = doble + restante
            } else {

              extrax2 = 9
              extrax3 = triple + ((doble + restante) - 9)

            }

          }

          //Horas descanso laborado2

          if (isNaN(horasDescanso2)) {
            horasDescanso2 = 0
          }

          let doble2 = extrax2
          let triple2 = extrax3

          if (horasDescanso2 <= 8) {
            descanso = descanso + horasDescanso2
          } else {
            descanso = descanso + 8
            restante2 = horasDescanso2 - 8

            if ((doble2 + restante2) <= 9) {
              extrax2 = doble2 + restante2
            } else {

              extrax2 = 9
              extrax3 = triple2 + ((doble2 + restante2) - 9)

            }

          }

          let classColor=""
          if(extrax3>0){classColor="danger"}else{classColor="extraS"}
          temp.push(`<input type="text"  class="extraS" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${extrax2}" disabled>`)
          temp.push(`<input type="text" class="${classColor}" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${extrax3}" disabled>`)
          temp.push(`<input type="text"  class="extraS" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${descanso}" disabled>`)

          }
        }

        

        if (status == 'Pendiente') { icon = `<span class="icoSidebar fas fa-user-clock text-secondary" onclick="historial()"></span>` } else
          if (status == 'Confirmado') { icon = `<span class="icoSidebar fas fa-user-plus text-info" onclick="historial()"></span>` } else
            if (status == 'Rechazado') { icon = `<span class="icoSidebar fas fa-user-times text-danger" onclick="historial()"></span>` } else
              if (status == 'Aprobado') { icon = `<span class="icoSidebar fas fa-user-check text-primary" onclick="historial()"></span>` } else
                if (status == 'Finalizado') { icon = `<span class="icoSidebar fas fa-user-tie text-success" onclick="historial()"></span>` }



        temp.push(icon)
        row.push(temp)
        table.row.add(temp).draw(false);
        temp = []

      }
    })
    .catch((err) => { console.error(err) })





    data = { "tabla": `aprobado`}
  
  axios({
    method: 'post',
    url: `/getHorasGerente`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
      .then((result) => {
    
        resultados=  result.data.result
        dataHoras= resultados[0]
        week_number=resultados[1]
  
        numero_semana.textContent="Semana: " +week_number
  
        let dobles=0
        let triples=0
        let descansoAcumulado=0
        let temp=[]
  
        for (let z = 0; z < dataHoras.length; z++) {
  
          let extrax2 = 0
          let extrax3 = 0
          let descanso = 0
          let horasExtra = dataHoras[z][1]
          let horasDescanso1 = dataHoras[z][2]
          let horasDescanso2 = dataHoras[z][3]
  
          extrax2 = horasExtra
  
          //Horas extra dobles y triples
          if (horasExtra == null) {
            horasExtra = 0
          }
          if (horasExtra <=9) {
            extrax2 = horasExtra
          } else {
            extrax2 = 9
            extrax3 = horasExtra - 9
          }
  
          //Horas descanso laborado1
  
          if (isNaN(horasDescanso1)) {
            horasDescanso1 = 0
          }
  
          let doble = extrax2
          let triple = extrax3
  
          if (horasDescanso1 <= 8) {
            descanso = horasDescanso1
          } else {
            descanso = 8
            restante = horasDescanso1 - 8
  
            if ((doble + restante) <= 9) {
              extrax2 = doble + restante
            } else {
  
              extrax2 = 9
              extrax3 = triple + ((doble + restante) - 9)
  
            }
  
          }
  
          //Horas descanso laborado2
  
          if (isNaN(horasDescanso2)) {
            horasDescanso2 = 0
          }
  
          let doble2 = extrax2
          let triple2 = extrax3
  
          if (horasDescanso2 <= 8) {
            descanso = descanso + horasDescanso2
          } else {
            descanso = descanso + 8
            restante2 = horasDescanso2 - 8
  
            if ((doble2 + restante2) <= 9) {
              extrax2 = doble2 + restante2
            } else {
  
              extrax2 = 9
              extrax3 = triple2 + ((doble2 + restante2) - 9)
  
            }
  
          }
  
          dobles=dobles+extrax2
          triples=triples+extrax3
          descansoAcumulado=descansoAcumulado+descanso
  
        }
        let classColor=""
        if(triples>0){classColor="danger"}else{classColor=""}
        temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dobles}" disabled>`)
        temp.push(`<input type="text" class="${classColor}" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${triples}" disabled>`)
        temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${descansoAcumulado}" disabled>`)
  
        tableAcumulado.row.add(temp)
        tableAcumulado.draw(false);
  
      })
      .catch((err) => { console.error(err) })
  





})






function historial() {

  $('#modalHistorial').modal({ backdrop: 'static', keyboard: false })

  data = { "id": `${id}` }
  axios({
    method: 'post',
    url: `/historial`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

    let historial= result.data.result[0]
    let dataempleados= result.data.result[1]


    for (let i = 0; i < historial.length; i++) {

      
      if (historial[i].status=='Pendiente'){icon = `<span class="icoSidebar fas fa-user-clock text-secondary"></span>`}else
      if (historial[i].status=='Confirmado'){icon = `<span class="icoSidebar fas fa-user-plus text-info"></span>`}else
      if (historial[i].status=='Rechazado'){icon = `<span class="icoSidebar fas fa-user-times text-danger"></span>`}else
      if (historial[i].status=='Aprobado'){icon = `<span class="icoSidebar fas fa-user-check text-primary"></span>`}else
      if (historial[i].status=='Finalizado'){icon = `<span class="icoSidebar fas fa-user-tie text-success"></span>`}

      for (let y = 0; y < dataempleados.length; y++) {
        if( historial[i].empleado == dataempleados[y].emp_id){
          empleado_nombre=dataempleados[y].emp_correo.substring(0,dataempleados[y].emp_correo.indexOf('@'))
        }

        }
      
      tableHistorial.row.add([

        empleado_nombre,
        historial[i].comentario,
        icon,
        new Date(historial[i].fecha).toLocaleString(),

      ]).draw(false);
      
    }
    })
    .catch((err) => { console.error(err) })


}



btnCerrar.addEventListener("click", ()=>{  
  tableHistorial.clear().draw();
})




