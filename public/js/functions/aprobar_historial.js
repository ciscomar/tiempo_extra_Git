let table = $('#table2').DataTable(
    {bFilter: true, 
      bInfo: true,
       paging: true
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



axios({
  method: 'post',
  url: `/getHistorialAprobado`,
  headers: { 'content-type': 'application/json' }
})
  .then((result) => {

    data= result.data[1]
    dataEmpleados = result.data[0]
    horas_solicitudes=result.data[2]
    let solicitudId=[]
    let solicitud=[]


    for (let i = 0; i < data.length; i++) {
      if (solicitudId.indexOf(data[i].solicitud) === -1) {
        solicitudId.push(data[i].solicitud)
  
        temp=[]
        temp.push(data[i].solicitud)

        for (let z = 0; z < dataEmpleados.length; z++) {
          let nombre
          if(data[i].solicitante== dataEmpleados[z].emp_id){
            nombre=  dataEmpleados[z].emp_correo.substring(0,  dataEmpleados[z].emp_correo.indexOf('@'))
            temp.push(nombre)
          }
        }
        temp.push(data[i].fecha)
        for (let y = 0; y < horas_solicitudes.length; y++) {
          if(horas_solicitudes[y].solicitud==data[i].solicitud){
            temp.push(horas_solicitudes[y].horas)
          }   
        }
        temp.push(data[i].motivo)
        temp.push(data[i].status)
        solicitud.push(temp)

      }else{
        if(data[i].status=="Pendiente"){
          solicitud.pop()
          temp=[]
          temp.push(data[i].solicitud)

          for (let z = 0; z < dataEmpleados.length; z++) {
            let nombre
            if(data[i].solicitante== dataEmpleados[z].emp_id){
              nombre=  dataEmpleados[z].emp_correo.substring(0,  dataEmpleados[z].emp_correo.indexOf('@'))
              temp.push(nombre)
            }
          }

          temp.push(data[i].fecha)
          for (let y = 0; y < horas_solicitudes.length; y++) {
            if(horas_solicitudes[y].solicitud==data[i].solicitud){
              temp.push(horas_solicitudes[y].horas)
            }   
          }
          temp.push(data[i].motivo)
          temp.push(data[i].status)
          solicitud.push(temp)
        }
        
      }

      
    }


    solicitud.forEach(d => {

      if (d[5] == 'Pendiente') { icon = `<span class="icoSidebar fas fa-user-clock text-secondary""></span>` } else
      if (d[5] == 'Confirmado') { icon = `<span class="icoSidebar fas fa-user-plus text-info""></span>` } else
        if (d[5] == 'Rechazado') { icon = `<span class="icoSidebar fas fa-user-times text-danger""></span>` } else
          if (d[5] == 'Aprobado') { icon = `<span class="icoSidebar fas fa-user-check text-primary""></span>` } else
            if (d[5] == 'Finalizado') { icon = `<span class="icoSidebar fas fa-user-tie text-success""></span>` }

        revisar=`<button type="submit" class="btn"
        id="${d[0]}" onClick="search(this.id)">${icon}` 

        let date = new Date(d[2])
        momentdate=moment(date)
        week_day=momentdate.weekday()
        let sumdays1
        let sumdays2
        if(week_day==0){sumdays1=-6, sumdays2=0}else{sumdays1=+1 ,sumdays2=+7}
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        
        let s=$.datepicker.formatDate('yy-mm-dd',startDate) 
        let e=$.datepicker.formatDate('yy-mm-dd',endDate) 

        table.row.add([
            revisar,
            d[0],
            d[1],
            d[3],
            s+"    /    "+e,
            d[4]



            
          ]).draw(false);

  
        
    });
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


function search(clicked_id)
{
  window.location = `/aprobar_historial_id/${clicked_id}`
}
