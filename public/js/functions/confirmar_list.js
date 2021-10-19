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

    data= result.data[1]
    dataEmpleados = result.data[0]

    data.forEach(d => {

        revisar=`<button type="submit" class="btn btn-info  rounded-pill"
        id="${d.solicitud}" onClick="search(this.id)"><span class="fas fa-search">` 


        let date = new Date(d.fecha)
        momentdate=moment(date)
        week_day=momentdate.weekday()
        let sumdays1
        let sumdays2
        if(week_day==0){sumdays1=-6, sumdays2=0}else{sumdays1=+1 ,sumdays2=+7}
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
        let s=$.datepicker.formatDate('yy-mm-dd',startDate)
        let e=$.datepicker.formatDate('yy-mm-dd',endDate)

        let nombre
        dataEmpleados.forEach(e => {
          if(d.solicitante== e.emp_id){
            nombre= e.emp_correo.substring(0, e.emp_correo.indexOf('@'))
          }
          
        });


        table.row.add([
            revisar,
            d.solicitud,
            nombre,
            d.horas,
            s+"    /    "+e,
            d.motivo
           
          ]).draw(false);        
    });
  })
  .catch((err) => { console.error(err) })



})


function search(clicked_id)
{
  window.location = `/confirmar/${clicked_id}`
}
