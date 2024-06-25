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
    url: `/getSolicitudesVacaciones`,
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      let solicitud = result.data

      solicitud.forEach(d => {

        revisar = `<button type="submit" class="btn"
        id="${d.solicitud}" onClick="search(this.id)"><span class="icoSidebar fas fa-search text-success""></span>`


        let date = new Date(d.fecha_solicitud);

        // Extract the date parts
        let year = date.getFullYear();
        let month = ('0' + (date.getMonth() + 1)).slice(-2); // Add leading zero and slice to ensure two digits
        let day = ('0' + date.getDate()).slice(-2); // Add leading zero and slice to ensure two digits
    
        // Extract the time parts
        let hours = ('0' + date.getHours()).slice(-2); // Add leading zero and slice to ensure two digits
        let minutes = ('0' + date.getMinutes()).slice(-2); // Add leading zero and slice to ensure two digits
    
        // Combine them into the desired format
        let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    
        table.row.add([
          revisar,
          d.solicitud,
          formattedDate,
          // s + "    /    " + e,

          //real
        ]).draw(false);

      });

    })
    .catch((err) => { console.error(err) })



})


function search(clicked_id) {

  $.ajax({
      url: '/getSolicitudVacaciones', // Actualiza esta URL con la ruta correcta
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ id: clicked_id }), 
      success: function(response) {
          let searchResultsBody = $('#searchResultsBody');
          searchResultsBody.empty(); // Clear any previous data
          response.forEach(d => {
            let dateInicial = new Date(d.fecha_inicial);
            let dateFinal = new Date(d.fecha_final);
            let dateSolicitud = new Date(d.fecha_solicitud);
        
            // Check if the dates are invalid and handle them
            if (isNaN(dateInicial)) dateInicial = new Date(Date.parse(d.fecha_inicial));
            if (isNaN(dateFinal)) dateFinal = new Date(Date.parse(d.fecha_final));
            if (isNaN(dateSolicitud)) dateSolicitud = new Date(Date.parse(d.fecha_solicitud));
        
            let formattedDateInicial = `${dateInicial.getUTCFullYear()}-${('0' + (dateInicial.getUTCMonth() + 1)).slice(-2)}-${('0' + dateInicial.getUTCDate()).slice(-2)}`;
            let formattedDateFinal = `${dateFinal.getUTCFullYear()}-${('0' + (dateFinal.getUTCMonth() + 1)).slice(-2)}-${('0' + dateFinal.getUTCDate()).slice(-2)}`;
            let formattedDateSolicitud = `${dateSolicitud.getUTCFullYear()}-${('0' + (dateSolicitud.getUTCMonth() + 1)).slice(-2)}-${('0' + dateSolicitud.getUTCDate()).slice(-2)} ${('0' + dateSolicitud.getUTCHours()).slice(-2)}:${('0' + dateSolicitud.getUTCMinutes()).slice(-2)}`;
        
            let row = `<tr>
                          <td>${d.id}</td>
                          <td>${d.solicitud}</td>
                          <td>${d.solicitante}</td>
                          <td>${d.empleado}</td>
                          <td>${formattedDateInicial}</td>
                          <td>${formattedDateFinal}</td>
                          <td>${d.tipo}</td>
                          <td>${formattedDateSolicitud}</td>
                       </tr>`;
            searchResultsBody.append(row);
        });

          // Show the modal
          $('#modalSearchResults').modal({ backdrop: 'static', keyboard: false });
      },
      error: function(error) {
          console.error(error);
          // Handle the error case
      }
  });
}

