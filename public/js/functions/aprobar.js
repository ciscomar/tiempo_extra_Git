let id = document.getElementById("id").value
let semanaInput = document.getElementById("semana")
let motivo = document.getElementById("motivo")
let btnAprobar = document.getElementById("btnAprobar")
let btnRechazar = document.getElementById("btnRechazar")
let comentario = document.getElementById("comentario")
let btnCerrar = document.getElementById("btnCerrar")

let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false,
    scrollY:false,
    scrollX:false

  }
);


let tableHistorial = $('#tableHistorial').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);

btnAprobar.addEventListener("click", ()=>{aprobar("Aprobado")})
btnRechazar.addEventListener("click", ()=>{modalComentario()})



function aprobar(status){
    
  let data = { "id": id, "status": status,"comentario": `${comentario.value}`}
  
  axios({
    method: 'post',
    url: `/aprobar_solicitud`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {
      
      window.location = `/aprobar_list/${status}`
  
    })
    .catch((err) => { console.error(err) })
  
  }


$(document).ready(function () {

  data = { "id": `${id}` }


  axios({
    method: 'post',
    url: `/aprobar_id`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      let allResults=result.data
      let supervisor=allResults.result[0]
      let solEmpleados=allResults.result[1]

 

      data = solEmpleados[0]
      dataempleados = solEmpleados[1]
      fecha = data[0].fecha
      let datef = new Date(fecha)



      semanaInput.value = $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + 1)) + "  a  " +
        $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + 7))
      motivo.value = data[0].motivo

      let semana = []
      for (let i = 1; i < 8; i++) {
        semana.push($.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + i)))
      }

      let empleados = []
      let empleados_jefe=[]
      let empleados_aprobador=[]
      for (let i = 0; i < data.length; i++) {
        if(empleados.indexOf(data[i].empleado) === -1){
          empleados.push(data[i].empleado)
          empleados_jefe.push(data[i].jefe)
          empleados_aprobador.push(data[i].aprobador)
          }
      }

      
      let empleados_nombre=[]
      for (let i = 0; i < empleados.length; i++) {
        for (let y = 0; y < dataempleados.length; y++) {
          if(empleados[i] == dataempleados[y].emp_id){
            empleados_nombre.push(dataempleados[y].emp_nombre)
          }
          
        }  
      }

      let jefe_nombre=[]
      for (let i = 0; i < empleados_jefe.length; i++) {
        for (let y = 0; y < dataempleados.length; y++) {
          if(empleados_jefe[i]==dataempleados[y].emp_id){
            jefe_nombre.push(dataempleados[y].emp_correo.substring(0,dataempleados[y].emp_correo.indexOf('@')))
          }        
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
        temp.push("")

        for (let y = 0; y < semana.length; y++) {
          let found = false;

          for (let x = 0; x < data.length; x++) {

            if (data[x].empleado == empleados[i] && semana[y] === data[x].fecha.substring(0, data[x].fecha.indexOf("T"))) {
              temp.push(data[x].horas)
              area_actual=data[x].area_actual
              area_req=data[x].area_req
              status=data[x].status
              found = true;
            }
          }
          if (!found) {
            temp.push(0)

          }
        }

        temp.push("")
        temp.push("")
        temp.push("")

        temp.push(area_actual)
        temp.push(area_req)

        if (status=='Pendiente'){icon = `<span class="icoSidebar fas fa-user-clock text-secondary" onclick="historial()"></span>`}else
        if (status=='Confirmado'){icon = `<span class="icoSidebar fas fa-user-plus text-info" onclick="historial()"></span>`}else
        if (status=='Rechazado'){icon = `<span class="icoSidebar fas fa-user-times text-danger" onclick="historial()"></span>`}else
        if (status=='Aprobado'){icon = `<span class="icoSidebar fas fa-user-check text-primary" onclick="historial()"></span>`}else
        if (status=='Finalizado'){icon = `<span class="icoSidebar fas fa-user-tie text-success" onclick="historial()"></span>`}

        temp.push(jefe_nombre[i]) 
        temp.push(icon)



        let foundMyEmployee=false

          if(supervisor==empleados_jefe[i]){
            foundMyEmployee=true
          }   
        
       
        if(foundMyEmployee)
        {
          table.row.add(temp).node().id='Employee'+i
          $("#Employee"+i).addClass('text-success')
        }else{

          table.row.add(temp).node().id='notEmployee'+i
          
        } 

        table.draw(false);
        row.push(temp)
        $("#notEmployee"+i).addClass('text-secondary')

        temp = []

      }
    })
    .catch((err) => { console.error(err) })



})


function modalComentario() {

  $('#modalComentario').modal({ backdrop: 'static', keyboard: false })


}


formComentario.addEventListener("submit", (e) => {
  e.preventDefault();
  aprobar("Rechazado")

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




