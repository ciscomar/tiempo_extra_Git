let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);


let id = document.getElementById("id").value
let selectedMotivo = document.getElementById("selectedMotivo")
let btnAgregar = document.getElementById("btnAgregar")
let empleado = document.getElementsByClassName("empleado")
let nombre = document.getElementsByClassName("nombre")
let turno = document.getElementsByClassName("turno")
let lunes = document.getElementsByClassName("lunes")
let martes = document.getElementsByClassName("martes")
let miercoles = document.getElementsByClassName("miercoles")
let jueves = document.getElementsByClassName("jueves")
let viernes = document.getElementsByClassName("viernes")
let sabado = document.getElementsByClassName("sabado")
let domingo = document.getElementsByClassName("domingo")
let actual = document.getElementsByClassName("actual")
let laborar = document.getElementsByClassName("laborar")
let jefe = document.getElementsByClassName("jefe")
let jefeid = document.getElementsByClassName("jefeid")
let semanaInput = document.getElementById("week")
let doblesActual = document.getElementsByClassName("dobles")
let triplesActual = document.getElementsByClassName("triples")
let descansoActual = document.getElementsByClassName("descanso")
let costohra = document.getElementsByClassName("costohra")
let costototal = document.getElementsByClassName("costototal")
let week_start
let week_end

let diasInput = document.querySelectorAll(".dias")
diasInput.forEach(element => {
  element.addEventListener('keyup', () => { changeValue(element) })
});

diasInput.forEach(element => {
  element.addEventListener('focus', () => { changeValue(element) })
});


let rowNumber = 1;

let dobleEmpleado
let tripleEmpleado
let descanso1Empleado
let descanso2Empleado

function changeValue(e) {
  

  if (parseFloat(e.value) > parseFloat(e.getAttribute("max")) || parseFloat(e.value) < parseFloat(e.getAttribute("min"))) {

    e.value=""

  } else {
      
    let id = e.id.replace(/[^0-9]/g, '')
    let extrax2 = document.getElementById("te" + id)
    let extrax3 = document.getElementById("tem" + id)
    let dl = document.getElementById("l" + id)
    let dm = document.getElementById("m" + id)
    let dmc = document.getElementById("mc" + id)
    let dj = document.getElementById("j" + id)
    let dv = document.getElementById("v" + id)
    let ds = document.getElementById("s" + id)
    let dd = document.getElementById("d" + id)
    let descansolab = document.getElementById("dl" + id)
    let turnoEmpleado = document.getElementById("tu" + id)
    let da = document.getElementById("da" + id)
    let ta = document.getElementById("ta" + id)
    let desca = document.getElementById("desca" + id)

    let descanso1Inicial = document.getElementById("descanso1Inicial" + id)
    let descanso2Inicial = document.getElementById("descanso2Inicial" + id)

    let extrax2Incial = document.getElementById("extrax2Incial" + id)
    let extrax3Incial = document.getElementById("extrax3Incial" + id)

    dobleEmpleado = parseFloat(extrax2Incial.value)
    tripleEmpleado = parseFloat(extrax3Incial.value)
    descanso1Empleado = parseFloat(descanso1Inicial.value)
    descanso2Empleado = parseFloat(descanso2Inicial.value)


    turn = turnoEmpleado.value
    dl = parseFloat(dl.value) || 0
    dm = parseFloat(dm.value) || 0
    dmc = parseFloat(dmc.value) || 0
    dj = parseFloat(dj.value) || 0
    dv = parseFloat(dv.value) || 0
    ds = parseFloat(ds.value) || 0
    dd = parseFloat(dd.value) || 0
    desclab = parseFloat(descansolab.value) || 0



    let weekArray
    let weekendArray
    if (turn == 3) {
      weekArray = [dm, dmc, dj, dv, ds]
      weekendArray = [dl, dd]
    } else {
      weekArray = [dl, dm, dmc, dj, dv]
      weekendArray = [ds, dd]
    }


    sumExtra = weekArray.reduce((pv, cv) => pv + cv, 0);


    if (dobleEmpleado + sumExtra < 9) {

      extrax2.value = dobleEmpleado + sumExtra
      extrax3.value = 0
      extrax3.classList.remove("danger");
      extrax3.classList.add("extraS");

    } else {

      temp = 9 - dobleEmpleado
      rest = sumExtra - temp
      extrax2.value = 9
      extrax3.value = tripleEmpleado + rest

      if (extrax3.value != 0) {
        extrax3.classList.remove("extraS");
        extrax3.classList.add("danger");
      } else {
        extrax3.classList.remove("danger");
        extrax3.classList.add("extraS");
      }

    }


    desc1 = weekendArray[0]
    desc2 = weekendArray[1]


    let horasDescanso = 0
    let horasDescansoExtra = 0
    let horasDescansoExtraAnterior = 0
    if (descanso1Empleado > 8) {
      horasDescansoExtraAnterior = horasDescansoExtraAnterior + (descanso1Empleado - 8)
    }
    if (descanso2Empleado > 8) {
      horasDescansoExtraAnterior = horasDescansoExtraAnterior + (descanso2Empleado - 8)
    }

    if (descanso1Empleado + desc1 <= 8) {
      horasDescanso = descanso1Empleado + desc1

    } else {
      horasDescanso = horasDescanso + 8
      horasDescansoExtra = (descanso1Empleado + desc1) - 8

    }
    if (descanso2Empleado + desc2 <= 8) {
      horasDescanso = horasDescanso + (descanso2Empleado + desc2)
    } else {
      horasDescanso = horasDescanso + 8
      horasDescansoExtra = horasDescansoExtra + ((descanso2Empleado + desc2) - 8)
    }


    descansolab.value = horasDescanso
    horasDescansoExtra = horasDescansoExtra - horasDescansoExtraAnterior
    dob = parseFloat(extrax2.value)
    trip = parseFloat(extrax3.value)



    if (dob + horasDescansoExtra <= 9) {

      extrax2.value = dob + horasDescansoExtra

    } else {

      rest = (dob + horasDescansoExtra) - 9
      extrax2.value = 9
      extrax3.value = trip + rest
      extrax3.classList.remove("extraS");
      extrax3.classList.add("danger");

    }




    // Horas solicitud actual

    da.value = extrax2.value - dobleEmpleado
    ta.value = extrax3.value - tripleEmpleado

    if (descanso1Empleado > 8 && descanso2Empleado < 8) { desca.value = parseFloat(descansolab.value) - (8 + descanso2Empleado) } else
      if (descanso2Empleado > 8 && descanso1Empleado < 8) { desca.value = parseFloat(descansolab.value) - (8 + descanso1Empleado) } else
        if (descanso2Empleado > 8 && descanso1Empleado > 8) { desca.value = parseFloat(descansolab.value) - 16 } else
          if (descanso2Empleado < 8 && descanso1Empleado < 8) { desca.value = parseFloat(descansolab.value) - (descanso1Empleado + descanso2Empleado) }


    if (ta.value != 0) {
      ta.classList.remove("extraA");
      ta.classList.add("danger");
    } else {
      ta.classList.remove("danger");
      ta.classList.add("extraA");
    }

    let costototal= document.getElementById("costototal" + id)
    let costohra= document.getElementById("costohra" + id)
    costototal.value=(desca.value*(costohra.value*2))+(da.value*(costohra.value*2))+(ta.value*(costohra.value*3))
  
  }




}







let columnas = [empleado, nombre, turno, lunes, martes, miercoles, jueves, viernes, sabado, domingo, actual, laborar, jefeid, jefe, doblesActual, triplesActual, descansoActual,costohra, costototal]
let arregloFinal = []
let send = () => {

  for (let i = 0; i < empleado.length; i++) {
    let temp = [];
    columnas.forEach(column => {
      temp.push(column[i].value)
    });
    arregloFinal.push(temp)
  }

  let data = { "empleados": arregloFinal, "fechas": fechas, "motivo": `${selectedMotivo.value}`, "solicitud": `${id}` }

  axios({
    method: 'post',
    url: `/horas_utilizadas`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      window.location = `/solicitud_list/confirmada`

    })
    .catch((err) => { console.error(err) })



}





let fechas = [];
$(document).ready(function () {

  data = { "id": `${id}` }
  axios({
    method: 'post',
    url: `/solicitud_utilizado_id`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      data = result.data.result[0]
      dataempleados = result.data.result[1]
      dataHoras = result.data.result[2]
      dataSolicitudHoras = result.data.result[3]


      fecha = data[0].fecha
       let datef = new Date(fecha.substring(0,fecha.indexOf('T'))+'T08:00:00.000z')


      momentdate = moment(datef)
      week_day = momentdate.weekday()
      let sumdays1
      let sumdays2

      if (week_day == 0) { sumdays1 = -6, sumdays2 = 0 } else { sumdays1 = +1, sumdays2 = +7 }


      semanaInput.value = $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + sumdays1)) + "  a  " +
        $.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + sumdays2))


      selectedMotivo.value = data[0].motivo
      let semana = []
      for (let i = 1; i < 8; i++) {
        if (week_day == 0) { semana.push($.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() - 7 + i))) }
        else { semana.push($.datepicker.formatDate('yy-mm-dd', new Date(datef.getFullYear(), datef.getMonth(), datef.getDate() - datef.getDay() + i))) }
      }


      fechas = semana




      let empleados = []
      let empleados_jefe = []
      let empleados_confirmado = []
      let empleados_aprobado = []
      let empleados_turno = []
      let empleados_hra = []
      for (let i = 0; i < data.length; i++) {

        if (empleados.indexOf(data[i].empleado) === -1) {
          empleados.push(data[i].empleado)
          empleados_jefe.push(data[i].jefe)
          empleados_confirmado.push(data[i].confirmado)
          empleados_aprobado.push(data[i].aprobado)
          empleados_turno.push(data[i].turno)
          empleados_hra.push(data[i].costo_hra)
        }
      }

      let empleados_nombre = []
      for (let i = 0; i < empleados.length; i++) {
        for (let y = 0; y < dataempleados.length; y++) {
          if (empleados[i] == dataempleados[y].emp_id) {
            empleados_nombre.push(dataempleados[y].emp_nombre)
          }

        }
      }

      let jefe_nombre = []
      for (let i = 0; i < empleados_jefe.length; i++) {

        if (empleados_jefe[i] != null) {
          for (let y = 0; y < dataempleados.length; y++) {
            if (empleados_jefe[i] == dataempleados[y].emp_id) {
              jefe_nombre.push(dataempleados[y].emp_correo.substring(0, dataempleados[y].emp_correo.indexOf('@')))
            }
          }
        } else {
          jefe_nombre.push("")
        }


      }



      let temp = []
      let row = []
      let area_actual
      let area_req
      let status
      let iddias = ["l", "m", "mc", "j", "v", "s", "d"]
      let classdia = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
      for (let i = 0; i < empleados.length; i++) {

        temp.push(`<td><input class="empleado" id="e${rowNumber}" style="width: 100%;" type="number" value="${empleados[i]}"disabled></td>`)
        temp.push(`<td><input class="nombre" id="n${rowNumber}" style="width: 100%;" type="text" value="${empleados_nombre[i]}" disabled></td>`)
        temp.push(`<td><input class="turno" id="tu${rowNumber}" style="width: 100%;" type="text" value="${empleados_turno[i]}" disabled></td>`)

        for (let y = 0; y < semana.length; y++) {
          let found = false;

          for (let x = 0; x < data.length; x++) {

            if (data[x].empleado == empleados[i] && semana[y] === data[x].fecha.substring(0, data[x].fecha.indexOf("T"))) {

              temp.push(`<td><input class="${classdia[y]} dias" id="${iddias[y]}${rowNumber}" style="width: 100%;" type="number" min="0"; max="${data[x].horas}"; value="${data[x].horas}"></td>`)
              area_actual = data[x].area_actual
              area_req = data[x].area_req
              status = data[x].status
              found = true;
            }
          }
          if (!found) {

            temp.push(`<td><input class="${classdia[y]} dias" id="${iddias[y]}${rowNumber}" style="width: 100%;" type="number" min="0" max="${0}" value="${0}"></td>`)

          }

        }

        let costototal
        for (let s = 0; s < dataSolicitudHoras.length; s++) {

          if (empleados[i] == dataSolicitudHoras[s].empleado) {

            let classColor2 = ""
            if (dataSolicitudHoras[s].triples > 0) { classColor2 = "danger" } else { classColor2 = "extraA" }

            temp.push(`<td><input class="dobles extraA" id="da${rowNumber}" style="width: 100%;" type="text" value="0" disabled></td>`)
            temp.push(`<td><input class="triples extraA" id="ta${rowNumber}" style="width: 100%;" type="text" value="0" disabled></td>`)
            temp.push(`<td><input class="descanso extraA" id="desca${rowNumber}" style="width: 100%;" type="text" value="0" disabled></td>`)
            costototal = dataSolicitudHoras[s].costo_total

          }
        }


        temp.push(`<td><input class="actual" id="a${rowNumber}" style="width: 100%;" type="text" value="${area_actual}" disabled></td>`)
        temp.push(`<td><input class="laborar" id="lab${rowNumber}" style="width: 100%;" type="text"  value="${area_req}" disabled></td>`)
        temp.push(`<td><input class="jefe" id="je${rowNumber}" style="width: 100%;" type="text" value="${jefe_nombre[i]}"disabled></td>`)




        let horasDescanso1 = 0
        let horasDescanso2 = 0
        let extrax2 = 0
        let extrax3 = 0
        for (let z = 0; z < dataHoras.length; z++) {

          if (dataHoras[z][0] === empleados[i]) {

            extrax2 = 0
            extrax3 = 0
            let descanso = 0
            let horasExtra = dataHoras[z][1]
            horasDescanso1 = dataHoras[z][2]
            horasDescanso2 = dataHoras[z][3]

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

            if (isNaN(horasDescanso1) || horasDescanso1 == null) {
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
            if (isNaN(horasDescanso2) || horasDescanso2 == null) {

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

            let classColor = ""
            if (extrax3 > 0) { classColor = "danger" } else { classColor = "extraS" }

            temp.push(`<td><input class="textra extraS" id="te${rowNumber}" style="width: 100%; text-align:center;" type="text" value="${extrax2}" disabled></td>`)
            temp.push(`<td><input class="textra2 extraS" id="tem${rowNumber}" style="width: 100%; text-align:center;" type="text" value="${extrax3}" disabled></td>`)
            temp.push(`<td><input class="dlaborado extraS" id="dl${rowNumber}" style="width: 100%; text-align:center;" type="text" value="${descanso}" disabled></td>`)


          }
        }


        temp.push(`<td hidden ><input class="jefeid" id="jeid${rowNumber}" style="width: 100%;" type="text" value="${empleados_jefe[i]}" hidden ></td>`)
        temp.push(`<td hidden ><input class="descans1Incialc" id="descanso1Inicial${rowNumber}" style="width: 100%;" type="text" value="${horasDescanso1}" hidden ></td>`)
        temp.push(`<td hidden ><input class="descans2Incialc" id="descanso2Inicial${rowNumber}" style="width: 100%;" type="text" value="${horasDescanso2}" hidden ></td>`)
        temp.push(`<td hidden ><input class="extrax2Incialc" id="extrax2Incial${rowNumber}" style="width: 100%;" type="text" value="${extrax2}" hidden ></td>`)
        temp.push(`<td hidden ><input class="extrax3Incialc" id="extrax3Incial${rowNumber}" style="width: 100%;" type="text" value="${extrax3}" hidden ></td>`)

        temp.push(`<td><input class="costohra" id="costohra${rowNumber}" style="width: 100%;" type="text" value="${empleados_hra[i]}" hidden></td>`)
        temp.push(`<td><input class="costototal" id="costototal${rowNumber}" style="width: 100%;" type="text" value="${costototal}" hidden></td>`)

        row.push(temp)
        table.row.add(temp).draw(false);
        temp = []
        rowNumber++

        let diasInput = document.querySelectorAll(".dias")
        diasInput.forEach(element => {
          element.addEventListener('keyup', () => { changeValue(element) })
        });

      }


      let startdate = document.getElementsByClassName("lunes")
      for (let r = 0; r < startdate.length; r++) {
        changeValue(startdate[r])

      }




    })
    .catch((err) => { console.error(err) })



})




function enableUserInfo(id, accion) {
  let e = document.getElementById("e" + id)
  let dl = document.getElementById("l" + id)
  let dm = document.getElementById("m" + id)
  let dmc = document.getElementById("mc" + id)
  let dj = document.getElementById("j" + id)
  let dv = document.getElementById("v" + id)
  let ds = document.getElementById("s" + id)
  let dd = document.getElementById("d" + id)
  let lab = document.getElementById("lab" + id)

  if (accion == "enable") {
    dl.disabled = false
    dm.disabled = false
    dmc.disabled = false
    dj.disabled = false
    dv.disabled = false
    ds.disabled = false
    dd.disabled = false
    lab.disabled = false
    btnAgregar.disabled = false

  } else if (accion == "disable") {
    dl.disabled = true
    dm.disabled = true
    dmc.disabled = true
    dj.disabled = true
    dv.disabled = true
    ds.disabled = true
    dd.disabled = true
    lab.disabled = true
    btnAgregar.disabled = true

  } else {
    e.disabled = false

  }


}



