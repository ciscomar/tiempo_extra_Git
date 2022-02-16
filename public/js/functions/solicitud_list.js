let table = $('#table2').DataTable(
  {
    bFilter: true,
    bInfo: true,
    paging: true
  }
);


$(document).ready(function () {

  var url = window.location.href;
  var idurl = url.substring(url.lastIndexOf('/') + 1);
  if (idurl == "confirmada") {
    $('#modalConfirmado').modal({ backdrop: 'static', keyboard: false })
  }else if (idurl != "sidebar") {
    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
  }


  axios({
    method: 'post',
    url: `/getSolicitudes`,
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {


      data = result.data[1]
      horas_solicitudes = result.data[0]
      let solicitudId = []
      let solicitud = []



      for (let i = 0; i < data.length; i++) {
        if (solicitudId.indexOf(data[i].solicitud) === -1) {
          solicitudId.push(data[i].solicitud)
          temp = []
          temp.push(data[i].solicitud)
          temp.push(data[i].fecha)
          for (let y = 0; y < horas_solicitudes.length; y++) {
            if (horas_solicitudes[y].solicitud == data[i].solicitud) {
              temp.push(horas_solicitudes[y].horas)
            }
          }
          temp.push(data[i].motivo)
          temp.push(data[i].status)
          temp.push(data[i].fecha_utilizado)
          solicitud.push(temp)

        } else {
          if (data[i].status == "Pendiente") {

            solicitud.pop()
            temp = []
            temp.push(data[i].solicitud)
            temp.push(data[i].fecha)
            for (let y = 0; y < horas_solicitudes.length; y++) {
              if (horas_solicitudes[y].solicitud == data[i].solicitud) {
                temp.push(horas_solicitudes[y].horas)
              }
            }
            temp.push(data[i].motivo)
            temp.push(data[i].status)
            temp.push(data[i].fecha_utilizado)
            solicitud.push(temp)
          }

        }


      }

      solicitud.forEach(d => {


        if (d[4] == 'Pendiente') { icon = `<span class="icoSidebar fas fa-user-clock text-secondary""></span>` } else
          if (d[4] == 'Confirmado') { icon = `<span class="icoSidebar fas fa-user-plus text-info""></span>` } else
            if (d[4] == 'Rechazado') { icon = `<span class="icoSidebar fas fa-user-times text-danger""></span>` } else
              if (d[4] == 'Aprobado') { icon = `<span class="icoSidebar fas fa-user-check text-primary""></span>` } else
                if (d[4] == 'Finalizado') { icon = `<span class="icoSidebar fas fa-user-tie text-success""></span>` }

        revisar = `<button type="submit" class="btn"
        id="${d[0]}" onClick="search(this.id)">${icon}`


        if (d[4] != 'Finalizado') { icon = `<span class="icoSidebar fas fa-stopwatch text-secondary""></span>`; enabled = "disabled" } else
          if (d[4] == 'Finalizado' && d[5] != null) { icon = `<span class="icoSidebar fas fa-check text-success""></span>`; enabled = "" }
        if (d[4] == 'Finalizado' && d[5] == null) { icon = `<span class="icoSidebar fas fa-times text-danger""></span>`; enabled = "" }



        if (d[4] == 'Finalizado' && d[5] != null) {

          real = `<button type="submit" class="btn"
          id="${d[0]}" onClick="solicitud_utilizado_historial(this.id)" ${enabled}>${icon}`

        }else {
          
          real = `<button type="submit" class="btn"
          id="${d[0]}" onClick="solicitud_utilizado(this.id)" ${enabled}>${icon}`

        }










        let date = new Date(d[1])
        momentdate = moment(date)
        week_day = momentdate.weekday()
        let sumdays1
        let sumdays2
        if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);

        let s = $.datepicker.formatDate('yy-mm-dd', startDate)
        let e = $.datepicker.formatDate('yy-mm-dd', endDate)



        table.row.add([
          revisar,
          d[0],
          d[2],
          s + "    /    " + e,
          d[3],
          real
        ]).draw(false);

      });

    })
    .catch((err) => { console.error(err) })



})


function search(clicked_id) {
  window.location = `/solicitud_historial/${clicked_id}`
}


function solicitud_utilizado(clicked_id) {
  window.location = `/solicitud_utilizado/${clicked_id}`
}


function solicitud_utilizado_historial(clicked_id) {
  window.location = `/solicitud_utilizado_historial/${clicked_id}`
}