
let fechas = [];
let fileDate
let btnExcelDownloadCon = document.getElementById("btnExcelDownloadCon")
let tableSinFormato
let table2
let reloadCounter = 0


let numero_semana = document.getElementById("numero_semana")
let tableAcumulado = $('#tableAcumulado').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false,
    ordering: false

  }
);





btnExcelDownloadCon.addEventListener("click", () => {

  table2.button('0').trigger()

})


$(document).ready(function () {



  let selectCurrentWeek = function () {
    window.setTimeout(function () {
      $('.week-picker').find('.ui-datepicker-current-day a').addClass('ui-state-active')
    }, 1);
  }

  $('.week-picker').datepicker({
    dateFormat: 'yy-mm-dd',
    showOtherMonths: true,
    selectOtherMonths: true,
    firstDay: 1,
    showWeek: true,
    onSelect: function (dateText, inst) {
      let date = $(this).datepicker('getDate');
      momentdate = moment(date)
      week_day = momentdate.weekday()
      let sumdays1
      let sumdays2
      if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }

      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays1);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + sumdays2);
      let dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat;
      $('#startDate').val($.datepicker.formatDate(dateFormat, startDate, inst.settings));
      $('#endDate').val($.datepicker.formatDate(dateFormat, endDate, inst.settings));

      $('#btnSeleccionar').show();

      $('#week').val($.datepicker.formatDate(dateFormat, startDate, inst.settings) + "   a   " + $.datepicker.formatDate(dateFormat, endDate, inst.settings))

      fileDate = $.datepicker.formatDate(dateFormat, startDate, inst.settings) + " / " + $.datepicker.formatDate(dateFormat, endDate, inst.settings)
      //console.log(fileDate);

      week_start = $.datepicker.formatDate(dateFormat, startDate, inst.settings)
      week_end = $.datepicker.formatDate(dateFormat, endDate, inst.settings)

      fechas = [];
      for (let i = 1; i < 8; i++) {
        let fecha
        if (week_day == 0) { fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 7 + i) }
        else { fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + i) }
        fechas.push($.datepicker.formatDate(dateFormat, fecha, inst.settings))
      }

      selectCurrentWeek();
      //tableAcumulado.clear().draw();
      if (reloadCounter > 0) {  table2.clear().destroy() }


      $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
      //Axios
      data = { "fecha_inicial": `${$.datepicker.formatDate(dateFormat, startDate, inst.settings)}`, "fecha_final": `${$.datepicker.formatDate(dateFormat, endDate, inst.settings)}` }
      axios({
        method: 'post',
        url: `/reporte_fecha`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
      })
        .then((result) => {

          setTimeout(function () { $('#modalSpinner').modal('hide') }, 500);

          dataresult = result.data


          arrayresult = dataresult.solicitud

          let row = []


          arrayresult.forEach(element => {

            let info2 = [
              element.solicitud,
              element.solicitante,
              element.empleado,
              element.turno,
              element.horas,
              element.motivo,
              element.area_req,
              element.fecha.substring(0, element.fecha.indexOf("T")),

            ]
            row.push(info2)



          })




          table2 = $('#table2').DataTable({
            //dom: "<'row'<'col-lg-4'l><'col-lg-4 text-center'B><'col-lg-4'f>><'row'<'col-lg-2't>><'row'<'col-lg-3'i><'col-lg-6'><'col-lg-3'p>>",
            data: row,
            bInfo: false,
            buttons: [
              {
                extend: 'excelHtml5',
                title: null,
                filename: `Tiempo Extra`,
                className: "d-none"

              }

            ]
          })


          //// Tabla sin formato

          reloadCounter++



        })
        .catch((err) => { console.error(err) })


    },
    beforeShowDay: function (date) {
      let cssClass = '';
      if (date >= startDate && date <= endDate)
        cssClass = 'ui-datepicker-current-day';
      return [true, cssClass];
    },
    onChangeMonthYear: function (year, month, inst) {
      selectCurrentWeek();

    }
  });


})