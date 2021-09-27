  // A $( document ).ready() block.
$( document ).ready(function() {
      
      $('#myTable').dataTable( {
        // "pageLength" : 7,
        "ordering": true,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": false,
        "bInfo": false,
        "bAutoWidth": false,
        responsive: true,
        rowGroup: {
            dataSrc: 'group'
        },
        rowReorder: true,
        select: true,
        autoFill: true,
        "order": [[ 0, "desc" ]]
      } );

// Ocultar boton de atenter si ya esta atendida
      if($('#status_cerrar2').text()=='Atendida'){
      $('#atender').hide()
      }

});
