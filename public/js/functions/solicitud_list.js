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

    data.forEach(d => {

        revisar=`<button type="submit" class="btn btn-info  rounded-pill"
        id="${d.solicitud}" onClick="search(this.id)"><span class="fas fa-search">` 


        let date = new Date(d.fecha)
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
        let s=$.datepicker.formatDate('yy-mm-dd',startDate) 
        let e=$.datepicker.formatDate('yy-mm-dd',endDate) 

        table.row.add([
            revisar,
            d.solicitud,
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
  window.location = `/solicitud_historial/${clicked_id}`
}
