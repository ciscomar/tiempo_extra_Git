let table = $('#table2').DataTable(
    {bFilter: true, 
      bInfo: true,
       paging: true
    }
  );


$(document).ready(function () {


  var url = window.location.href;
  var idurl = url.substring(url.lastIndexOf('/') + 1);
  if(idurl == "Confirmado"){
    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
  }
  if(idurl == "Rechazado"){
    $('#modalRechazado').modal({ backdrop: 'static', keyboard: false })
  }

axios({
  method: 'post',
  url: `/getConfirmar`,
  headers: { 'content-type': 'application/json' }
})
  .then((result) => {

    console.log(result.data);
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
      console.log(d);
      
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



})


function search(clicked_id)
{
  window.location = `/confirmar/${clicked_id}`
}
