let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);
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
let week_start
let week_end

let diasInput = document.querySelectorAll(".dias")
diasInput.forEach(element => {
  element.addEventListener('keyup', () => { changeValue(element) })
});




let dobleEmpleado
let tripleEmpleado
let descanso1Empleado
let descanso2Empleado



function changeValue(e) {

  let id=e.id.replace(/[^0-9]/g, '')
  let horas= parseInt(e.value)
  let extrax2 = document.getElementById("te" + id)
  let extrax3 = document.getElementById("tem" + id)
  let dl = document.getElementById("l"+ id)
  let dm = document.getElementById("m"+ id)
  let dmc = document.getElementById("mc"+ id)
  let dj = document.getElementById("j"+ id)
  let dv = document.getElementById("v"+ id)
  let ds = document.getElementById("s"+ id)
  let dd = document.getElementById("d"+ id)
  let descansolab=document.getElementById("dl"+ id)
  let turnoEmpleado= document.getElementById("tu"+ id)

  turn=turnoEmpleado.value
  dl=parseInt(dl.value) || 0
  dm=parseInt(dm.value) || 0
  dmc=parseInt(dmc.value) || 0
  dj=parseInt(dj.value) || 0
  dv=parseInt(dv.value) || 0
  ds=parseInt(ds.value) || 0
  dd=parseInt(dd.value) || 0
  desclab =parseInt(descansolab.value) || 0

  let weekArray
  let weekendArray
  if(turn==3){
      weekArray=[dm,dmc,dj,dv,ds]
      weekendArray=[dl,dd]
  }else{
      weekArray=[dl,dm,dmc,dj,dv]
      weekendArray=[ds,dd]
  }
 
  sumExtra = weekArray.reduce((pv, cv) => pv + cv, 0);

  if(dobleEmpleado+sumExtra<9){
    extrax2.value=dobleEmpleado+sumExtra
    extrax3.value=0
    extrax3.classList.remove("danger");
  }else{
    
    temp =9-dobleEmpleado
    rest=sumExtra-temp
    extrax2.value=9
    extrax3.value=tripleEmpleado+rest
    if(extrax3.value !=0){
      extrax3.classList.add("danger");
    }else{
      extrax3.classList.remove("danger");
    }

  }


  desc1= weekendArray[0]
  desc2= weekendArray[1]


  let horasDescanso=0
  let horasDescansoExtra=0
  let horasDescansoExtraAnterior=0
  if(descanso1Empleado>8){
      horasDescansoExtraAnterior = horasDescansoExtraAnterior+ (descanso1Empleado-8)
  }
  if(descanso2Empleado>8){
    horasDescansoExtraAnterior = horasDescansoExtraAnterior+ (descanso2Empleado-8)
  }

  if(descanso1Empleado+desc1<9){
    horasDescanso= descanso1Empleado+desc1
    
  }else{
    horasDescanso=horasDescanso+8
    horasDescansoExtra=(descanso1Empleado+desc1)-8
  }
  if(descanso2Empleado+desc2<9){
    horasDescanso= horasDescanso+(descanso2Empleado+desc2)
  }else{
    horasDescanso=horasDescanso+8
    horasDescansoExtra=horasDescansoExtra+((descanso2Empleado+desc2)-8)
  }

  descansolab.value=horasDescanso
  horasDescansoExtra=horasDescansoExtra-horasDescansoExtraAnterior
  dob= parseInt(extrax2.value)
  trip=parseInt(extrax3.value)

  if(dob+horasDescansoExtra<10){

    extrax2.value=dob+horasDescansoExtra
  }else{

    rest= (dob+horasDescansoExtra)-9
    extrax2.value = 9
    extrax3.value = trip + rest
    extrax3.classList.add("danger");
  }
  
}




let row = 2
let agregar = () => {

  table.row.add([

    `<td><input class="empleado" id="e${row}" style="width: 100%;" type="text" onkeyup="getInfoEmpleado(this)"></td>`,
    `<td><input class="nombre" id="n${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="turno" id="tu${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="lunes dias" id="l${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="martes dias" id="m${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="miercoles dias" id="mc${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="jueves dias" id="j${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="viernes dias" id="v${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="sabado dias" id="s${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="domingo dias" id="d${row}" style="width: 100%;" type="number"></td>`,
    `<td><input class="textra" id="te${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td><input class="textra2" id="tem${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td><input class="dlaborado" id="dl${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td><input class="actual" id="a${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="laborar" id="l${row}" style="width: 100%;" type="text"></td>`,
    `<td><input class="jefe" id="je${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="jefeid" id="jeid${row}" style="width: 100%;" type="text" hidden></td>`,

  ]).draw(false);

  row++

  let diasInput = document.querySelectorAll(".dias")
  diasInput.forEach(element => {
    element.addEventListener('keyup', () => { changeValue(element) })
  });

}


let columnas = [empleado, nombre, turno, lunes, martes, miercoles, jueves, viernes, sabado, domingo, actual, laborar, jefeid, jefe]
let arregloFinal = []


let send = () => {

  for (let i = 0; i < empleado.length; i++) {
    let temp = [];
    columnas.forEach(column => {
      temp.push(column[i].value)
    });
    arregloFinal.push(temp)
  }

  let data = { "empleados": arregloFinal, "fechas": fechas, "motivo": `${selectMotivo.value}` }

  axios({
    method: 'post',
    url: `/sendSolicitud`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      window.location = `/solicitud_list/enviada`

    })
    .catch((err) => { console.error(err) })



}



let getInfoEmpleado = (e) => {

  let id = e.id.substring(1);

  if (e.value === "") {
    valorInput = 0
  } else {
    valorInput = e.value
  }

  let data = { "empleado": `${valorInput}`, "week_start": `${week_start}`, "week_end": `${week_end}` }

  axios({
    method: 'post',
    url: `/infoEmpleado`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {



      if (result.data.result != undefined) {
        let infoEmpleado = result.data.result[0]
        let infoArray = result.data.result[1]
        let infoJefe = infoArray[0]
        let horasExtraInfo = infoArray[1]
        let horasDescansoInfo1 = infoArray[2]
        let horasDescansoInfo2 = infoArray[3]
        let horasExtra = horasExtraInfo[0].horasExtra
        let horasDescanso1 = parseInt(horasDescansoInfo1[0].horasDescanso)
        let horasDescanso2 = parseInt(horasDescansoInfo2[0].horasDescanso)


        let name = document.getElementById("n" + id)
        let actual = document.getElementById("a" + id)
        let jefe = document.getElementById("je" + id)
        let jefeid = document.getElementById("jeid" + id)
        let turno = document.getElementById("tu" + id)
        let extrax2 = document.getElementById("te" + id)
        let extrax3 = document.getElementById("tem" + id)
        let descanso = document.getElementById("dl" + id)



        name.value = infoEmpleado[0].emp_nombre
        actual.value = infoEmpleado[0].emp_categoria
        jefe.value = infoJefe[0].emp_correo.substring(0, infoJefe[0].emp_correo.indexOf('@'))
        jefeid.value = infoJefe[0].emp_id
        turno.value = infoEmpleado[0].emp_activo



        extrax2.value = 0
        extrax3.value = 0
        descanso.value = 0
        extrax2.value = horasExtra


        //Horas extra dobles y triples
        if (horasExtra == null) {
          horasExtra = 0
        }
        if (horasExtra < 10) {
          extrax2.value = horasExtra
        } else {
          extrax2.value = 9
          extrax3.value = horasExtra - 9
          extrax3.classList.add("danger");
        }

        //Horas descanso laborado1

        if (isNaN(horasDescanso1)) {
          horasDescanso1 = 0
        }

        let doble = parseInt(extrax2.value)
        let triple = parseInt(extrax3.value)

        if (horasDescanso1 < 9) {
          descanso.value = horasDescanso1
        } else {
          descanso.value = 8
          restante = horasDescanso1 - 8

          if ((doble + restante) < 10) {
            extrax2.value = doble + restante
          } else {

            extrax2.value = 9
            extrax3.value = triple + ((doble + restante) - 9)
            extrax3.classList.add("danger");

          }

        }
  


        //Horas descanso laborado2

        if (isNaN(horasDescanso2)) {
          horasDescanso2 = 0
        }

        let doble2 = parseInt(extrax2.value)
        let triple2 = parseInt(extrax3.value)

        if (horasDescanso2 < 9) {
          descanso.value = parseInt(descanso.value) + horasDescanso2
        } else {
          descanso.value = parseInt(descanso.value) + 8
          restante2 = horasDescanso2 - 8

          if ((doble2 + restante2) < 10) {
            extrax2.value = doble2 + restante2
          } else {

              extrax2.value = 9
              extrax3.value = triple2 + ((doble2 + restante2) - 9)
              extrax3.classList.add("danger");

          }

        }


        dobleEmpleado = parseInt(extrax2.value)
        tripleEmpleado = parseInt(extrax3.value)
        descanso1Empleado=horasDescanso1
        descanso2Empleado=horasDescanso2




      } else {

        let name = document.getElementById("n" + id)
        let actual = document.getElementById("a" + id)
        let jefe = document.getElementById("je" + id)
        let jefeid = document.getElementById("jeid" + id)
        let turno = document.getElementById("tu" + id)
        let te = document.getElementById("te" + id)
        let tem = document.getElementById("tem" + id)
        let dl = document.getElementById("dl" + id)

        name.value = ""
        actual.value = ""
        jefe.value = ""
        jefeid.value = ""
        turno.value = ""
        te.value = ""
        tem.value = ""
        dl.value = ""

      }

    })
    .catch((err) => { console.error(err) })

}




let fechas = [];
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
      momentdate=moment(date)
      week_day=momentdate.weekday()
      let sumdays1
      let sumdays2
      if(week_day==0){sumdays1=-6, sumdays2=0}else{sumdays1=+1 ,sumdays2=+7}

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
        if(week_day==0){ fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() -7 + i)}
        else{ fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + i)}
        fechas.push($.datepicker.formatDate(dateFormat, fecha, inst.settings))
      }

      console.log(fechas);


      selectCurrentWeek();
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