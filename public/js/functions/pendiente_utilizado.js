let table = $('#table2').DataTable(
    {bFilter: true, 
      bInfo: true,
       paging: true
    }
  );


$(document).ready(function () {
  
  // var url = window.location.href;
  // var idurl = url.substring(url.lastIndexOf('/') + 1);
  // if(idurl != "sidebar"){
  //   $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
  // }


axios({
  method: 'post',
  url: `/getSolicitudesPendienteUtilizado`,
  headers: { 'content-type': 'application/json' }
})
  .then((result) => {

    data=result.data
    dataEmpleados=data[0]
    dataSolicitud= data[1]




    for (let i = 0; i < dataSolicitud.length; i++) {

      let nombre
      for (let z = 0; z < dataEmpleados.length; z++) {
        if(dataSolicitud[i].solicitante== dataEmpleados[z].emp_id){
          nombre=  dataEmpleados[z].emp_correo.substring(0,  dataEmpleados[z].emp_correo.indexOf('@'))
        }
      }

      
      let date = new Date(dataSolicitud[i].fecha)
      momentdate=moment(date)
      week_day=momentdate.weekday()
      let sumdays1
      let sumdays2
      if(week_day==0){sumdays1=-6, sumdays2=0}else{sumdays1=+1 ,sumdays2=+7}
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
      
      let s=$.datepicker.formatDate('yy-mm-dd',startDate) 
      let e=$.datepicker.formatDate('yy-mm-dd',endDate) 


      revisar=`<button type="submit" class="btn"
      id="${dataSolicitud[i].solicitud}" onClick="search(this.id)"><span class="icoSidebar fas fa-search text-dark""></span>`

            table.row.add([
              revisar,
              dataSolicitud[i].solicitud,
              nombre,
              s+"    /    "+e,
              dataSolicitud[i].motivo,
              
          ]).draw(false);   
      
    }

  })
  .catch((err) => { console.error(err) })



})


function search(clicked_id)
{
  window.location = `/confirmar_historial_id/${clicked_id}`
}
