let fechas = [];


let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);

let tableUtilizado = $('#table2Utilizado').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);

let numero_semana = document.getElementById("numero_semana")
let numero_semana2 = document.getElementById("numero_semana2")
let costoAprobado = document.getElementById("costoAprobado")
let costoLaborado = document.getElementById("costoLaborado")
let tableAcumulado = $('#tableAcumulado').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false,
    ordering: false

  }
);

let tableAcumuladoUtilizado = $('#tableAcumuladoUtilizado').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false,
    ordering: false

  }
);


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
      table.clear().draw();
      tableAcumulado.clear().draw();
      tableUtilizado.clear().draw();
      tableAcumuladoUtilizado.clear().draw();


      //Axios
      data = { "fecha_inicial": `${$.datepicker.formatDate(dateFormat, startDate, inst.settings)}`, "fecha_final": `${$.datepicker.formatDate(dateFormat, endDate, inst.settings)}`,  "tabla": `aprobado`}
      axios({
        method: 'post',
        url: `/gerente_supervisores_fecha`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
      })
        .then((result) => {
          let data = result.data.result
          let datasupervisores = data[0]
          let dataempleados = data[1]
          let costo = data[2]

          if(costo[0].costo==null){
            costoAprobado.textContent="Costo: $0 pesos"
          }else{
            costoAprobado.textContent="Costo: $"+(costo[0].costo).toFixed(2)+" pesos"
          }



          let temp = []
          let row = []
          for (let i = 0; i < datasupervisores.length; i++) {

            temp.push(datasupervisores[i].solicitante)

            for (let y = 0; y < dataempleados.length; y++) {

              if (datasupervisores[i].solicitante == dataempleados[y].emp_id) {
                temp.push(dataempleados[y].emp_nombre)
                
              }
            }

            temp.push(datasupervisores[i].dobles)
            temp.push(datasupervisores[i].triples)
            temp.push(datasupervisores[i].descanso)
            row.push(temp)
            table.row.add(temp).draw(false);
            temp = []

          }

        })
        .catch((err) => { console.error(err) })




              //Axios Utilizado
      data = { "fecha_inicial": `${$.datepicker.formatDate(dateFormat, startDate, inst.settings)}`, "fecha_final": `${$.datepicker.formatDate(dateFormat, endDate, inst.settings)}`,  "tabla": `utilizado`}
      axios({
        method: 'post',
        url: `/gerente_supervisores_fecha`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
      })
        .then((result) => {
          let data = result.data.result
          let datasupervisores = data[0]
          let dataempleados = data[1]
          let costo = data[2]

          if(costo[0].costo==null){
            costoLaborado.textContent="Costo: $0 pesos"
          }else{
          costoLaborado.textContent="Costo: $"+(costo[0].costo).toFixed(2)+" pesos"
          }

          let temp = []
          let row = []
          for (let i = 0; i < datasupervisores.length; i++) {

            temp.push(datasupervisores[i].solicitante)

            for (let y = 0; y < dataempleados.length; y++) {

              if (datasupervisores[i].solicitante == dataempleados[y].emp_id) {
                temp.push(dataempleados[y].emp_nombre)
                
              }
            }

            temp.push(datasupervisores[i].dobles)
            temp.push(datasupervisores[i].triples)
            temp.push(datasupervisores[i].descanso)
            row.push(temp)
            tableUtilizado.row.add(temp).draw(false);
            temp = []

          }

        })
        .catch((err) => { console.error(err) })





      data2 = { "fecha_inicial": `${$.datepicker.formatDate(dateFormat, startDate, inst.settings)}`, "fecha_final": `${$.datepicker.formatDate(dateFormat, endDate, inst.settings)}`,
      "tabla": `aprobado`
     }
      axios({
        method: 'post',
        url: `/getHorasGerente`,
        data: JSON.stringify(data2),
        headers: { 'content-type': 'application/json' }
      })
        .then((result) => {

          resultados = result.data.result
          dataHoras = resultados[0]
          week_number = resultados[1]


          numero_semana.textContent = "Semana: " + week_number

          let dobles = 0
          let triples = 0
          let descansoAcumulado = 0
          let temp = []

          for (let z = 0; z < dataHoras.length; z++) {

            let extrax2 = 0
            let extrax3 = 0
            let descanso = 0
            let horasExtra = dataHoras[z][1]
            let horasDescanso1 = dataHoras[z][2]
            let horasDescanso2 = dataHoras[z][3]

            extrax2 = horasExtra

            //Horas extra dobles y triples
            if (horasExtra == null) {
              horasExtra = 0
            }
            if (horasExtra <=9) {
              extrax2 = horasExtra
            } else {
              extrax2 = 9
              extrax3 = horasExtra - 9
            }

            //Horas descanso laborado1

            if (isNaN(horasDescanso1)) {
              horasDescanso1 = 0
            }

            let doble = extrax2
            let triple = extrax3

            if (horasDescanso1 <= 8) {
              descanso = horasDescanso1
            } else {
              descanso = 8
              restante = horasDescanso1 - 8

              if ((doble + restante) <=9) {
                extrax2 = doble + restante
              } else {

                extrax2 = 9
                extrax3 = triple + ((doble + restante) - 9)

              }

            }

            //Horas descanso laborado2

            if (isNaN(horasDescanso2)) {
              horasDescanso2 = 0
            }

            let doble2 = extrax2
            let triple2 = extrax3

            if (horasDescanso2 <= 8) {
              descanso = descanso + horasDescanso2
            } else {
              descanso = descanso + 8
              restante2 = horasDescanso2 - 8

              if ((doble2 + restante2) <= 9) {
                extrax2 = doble2 + restante2
              } else {

                extrax2 = 9
                extrax3 = triple2 + ((doble2 + restante2) - 9)

              }

            }

            dobles = dobles + extrax2
            triples = triples + extrax3
            descansoAcumulado = descansoAcumulado + descanso

          }
          let classColor = ""
          if (triples > 0) { classColor = "danger" } else { classColor = "" }
          temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dobles}" disabled>`)
          temp.push(`<input type="text" class="${classColor}" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${triples}" disabled>`)
          temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${descansoAcumulado}" disabled>`)

          tableAcumulado.row.add(temp)
          tableAcumulado.draw(false);

        })
        .catch((err) => { console.error(err) })





        data3 = { "fecha_inicial": `${$.datepicker.formatDate(dateFormat, startDate, inst.settings)}`, "fecha_final": `${$.datepicker.formatDate(dateFormat, endDate, inst.settings)}`,
      "tabla": `utilizado`
     }
      axios({
        method: 'post',
        url: `/getHorasGerente`,
        data: JSON.stringify(data3),
        headers: { 'content-type': 'application/json' }
      })
        .then((result) => {

          resultados = result.data.result
          dataHoras = resultados[0]
          week_number = resultados[1]

          numero_semana2.textContent = "Semana: " + week_number

          let dobles = 0
          let triples = 0
          let descansoAcumulado = 0
          let temp = []

          for (let z = 0; z < dataHoras.length; z++) {

            let extrax2 = 0
            let extrax3 = 0
            let descanso = 0
            let horasExtra = dataHoras[z][1]
            let horasDescanso1 = dataHoras[z][2]
            let horasDescanso2 = dataHoras[z][3]

            extrax2 = horasExtra

            //Horas extra dobles y triples
            if (horasExtra == null) {
              horasExtra = 0
            }
            if (horasExtra <= 9) {
              extrax2 = horasExtra
            } else {
              extrax2 = 9
              extrax3 = horasExtra - 9
            }

            //Horas descanso laborado1

            if (isNaN(horasDescanso1)) {
              horasDescanso1 = 0
            }

            let doble = extrax2
            let triple = extrax3

            if (horasDescanso1 <= 8) {
              descanso = horasDescanso1
            } else {
              descanso = 8
              restante = horasDescanso1 - 8

              if ((doble + restante) <= 9) {
                extrax2 = doble + restante
              } else {

                extrax2 = 9
                extrax3 = triple + ((doble + restante) - 9)

              }

            }

            //Horas descanso laborado2

            if (isNaN(horasDescanso2)) {
              horasDescanso2 = 0
            }

            let doble2 = extrax2
            let triple2 = extrax3

            if (horasDescanso2 <= 8) {
              descanso = descanso + horasDescanso2
            } else {
              descanso = descanso + 8
              restante2 = horasDescanso2 - 8

              if ((doble2 + restante2) <= 9) {
                extrax2 = doble2 + restante2
              } else {

                extrax2 = 9
                extrax3 = triple2 + ((doble2 + restante2) - 9)

              }

            }

            dobles = dobles + extrax2
            triples = triples + extrax3
            descansoAcumulado = descansoAcumulado + descanso

          }
          let classColor = ""
          if (triples > 0) { classColor = "danger" } else { classColor = "" }
          temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${dobles}" disabled>`)
          temp.push(`<input type="text" class="${classColor}" style="width: 100%; text-align:center;" name="idPlan" id="test" value="${triples}" disabled>`)
          temp.push(`<input type="text"  style="width: 100%; text-align:center;" name="idPlan" id="test" value="${descansoAcumulado}" disabled>`)

          tableAcumuladoUtilizado.row.add(temp)
          tableAcumuladoUtilizado.draw(false);

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