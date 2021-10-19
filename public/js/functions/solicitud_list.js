let table = $('#table2').DataTable(
    {bFilter: true, 
      bInfo: true,
       paging: true
    }
  );


$(document).ready(function () {
  
  var url = window.location.href;
  var idurl = url.substring(url.lastIndexOf('/') + 1);
  if(idurl != "sidebar"){
    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
  }


axios({
  method: 'post',
  url: `/getSolicitudes`,
  headers: { 'content-type': 'application/json' }
})
  .then((result) => {

    data= result.data
    let solicitudId=[]
    let solicitud=[]

    for (let i = 0; i < data.length; i++) {
      if (solicitudId.indexOf(data[i].solicitud) === -1) {
        solicitudId.push(data[i].solicitud)
  
        temp=[]
        temp.push(data[i].solicitud)
        temp.push(data[i].fecha)
        temp.push(data[i].horas)
        temp.push(data[i].motivo)
        temp.push(data[i].status)
        solicitud.push(temp)

      }else{
        if(data[i].status=="Pendiente"){
          solicitud.pop()
          temp=[]
          temp.push(data[i].solicitud)
          temp.push(data[i].fecha)
          temp.push(data[i].horas)
          temp.push(data[i].motivo)
          temp.push(data[i].status)
          solicitud.push(temp)
        }
        
      }

      
    }

    console.log(solicitud);



    solicitud.forEach(d => {

      if (d[4] == 'Pendiente') { icon = `<span class="icoSidebar fas fa-user-clock text-secondary""></span>` } else
      if (d[4] == 'Confirmado') { icon = `<span class="icoSidebar fas fa-user-plus text-info""></span>` } else
        if (d[4] == 'Rechazado') { icon = `<span class="icoSidebar fas fa-user-times text-danger""></span>` } else
          if (d[4] == 'Aprobado') { icon = `<span class="icoSidebar fas fa-user-check text-primary""></span>` } else
            if (d[4] == 'Finalizado') { icon = `<span class="icoSidebar fas fa-user-tie text-success""></span>` }

        revisar=`<button type="submit" class="btn"
        id="${d[0]}" onClick="search(this.id)">${icon}` 
      console.log(d);

        let date = new Date(d[1])
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
            d[2],
            s+"    /    "+e,
            d[3]



            
          ]).draw(false);

  
        
    });

  })
  .catch((err) => { console.error(err) })



})


function search(clicked_id)
{
  window.location = `/solicitud_historial/${clicked_id}`
}
