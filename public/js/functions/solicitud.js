let table = $('#table2').DataTable(
  {
    bFilter: false,
    bInfo: false,
    paging: false
  }
);

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
let doblesActual = document.getElementsByClassName("dobles")
let triplesActual = document.getElementsByClassName("triples")
let descansoActual = document.getElementsByClassName("descanso")
let costohra = document.getElementsByClassName("costohra")
let costototal = document.getElementsByClassName("costototal")
let week_start
let week_end
let btnSend = document.getElementById("btnSend")
let errorMessage = document.getElementById("errorMessage")


let diasInput = document.querySelectorAll(".dias")
diasInput.forEach(element => {
  element.addEventListener('keyup', () => { changeValue(element) })
});



let dobleEmpleado
let tripleEmpleado
let descanso1Empleado
let descanso2Empleado



function changeValue(e) {

  if ( parseFloat(e.value) < parseFloat(e.getAttribute("min"))) {

    e.value=""

  } else {

  let id=e.id.replace(/[^0-9]/g, '')
  let horas= parseFloat(e.value)
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
  let da = document.getElementById("da"+ id)
  let ta = document.getElementById("ta"+ id)
  let desca = document.getElementById("desca"+ id)

  let descanso1Inicial = document.getElementById("descanso1Inicial" + id)
  let descanso2Inicial = document.getElementById("descanso2Inicial" + id)
  let extrax2Incial = document.getElementById("extrax2Inicial" + id)
  let extrax3Incial = document.getElementById("extrax3Inicial" + id)


   dobleEmpleado = parseFloat(extrax2Incial.value)
   tripleEmpleado = parseFloat(extrax3Incial.value)
   descanso1Empleado = parseFloat(descanso1Inicial.value)
   descanso2Empleado = parseFloat(descanso2Inicial.value)
  


  turn=turnoEmpleado.value
  dl=parseFloat(dl.value) || 0
  dm=parseFloat(dm.value) || 0
  dmc=parseFloat(dmc.value) || 0
  dj=parseFloat(dj.value) || 0
  dv=parseFloat(dv.value) || 0
  ds=parseFloat(ds.value) || 0
  dd=parseFloat(dd.value) || 0
  desclab =parseFloat(descansolab.value) || 0


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
    extrax3.classList.add("extraS");

  }else{

    temp =9-dobleEmpleado
    rest=sumExtra-temp
    extrax2.value=9
    extrax3.value=tripleEmpleado+rest

    
    if(extrax3.value !=0){
      extrax3.classList.remove("extraS");
      extrax3.classList.add("danger");
    }else{
      extrax3.classList.remove("danger");
      extrax3.classList.add("extraS");
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

  if(descanso1Empleado+desc1<=8){
    horasDescanso= descanso1Empleado+desc1
    
  }else{
    horasDescanso=horasDescanso+8
    horasDescansoExtra=(descanso1Empleado+desc1)-8
    
  }
  if(descanso2Empleado+desc2<=8){
    horasDescanso= horasDescanso+(descanso2Empleado+desc2)
  }else{
    horasDescanso=horasDescanso+8
    horasDescansoExtra=horasDescansoExtra+((descanso2Empleado+desc2)-8)
  }

 

  descansolab.value=horasDescanso
  horasDescansoExtra=horasDescansoExtra-horasDescansoExtraAnterior
  dob= parseFloat(extrax2.value)
  trip=parseFloat(extrax3.value)

 

  if(dob+horasDescansoExtra<=9){

    extrax2.value=dob+horasDescansoExtra

  }else{

    rest= (dob+horasDescansoExtra)-9
    extrax2.value = 9
    extrax3.value = trip + rest
    extrax3.classList.remove("extraS");
    extrax3.classList.add("danger");

  }


  // Horas solicitud actual

    da.value= extrax2.value-dobleEmpleado
    ta.value= extrax3.value-tripleEmpleado

    if(descanso1Empleado>=8 && descanso2Empleado<8){desca.value=parseFloat(descansolab.value)-(8+descanso2Empleado)}else
    if(descanso2Empleado>=8 && descanso1Empleado<8){desca.value=parseFloat(descansolab.value)-(8+descanso1Empleado)}else
    if(descanso2Empleado>=8 && descanso1Empleado>=8){desca.value=parseFloat(descansolab.value)-16}else
    if(descanso2Empleado<8 && descanso1Empleado<8){desca.value=parseFloat(descansolab.value)-(descanso1Empleado+descanso2Empleado)}


    if(ta.value !=0){
      ta.classList.remove("extraA");
      ta.classList.add("danger");
    }else{
      ta.classList.remove("danger");
      ta.classList.add("extraA");
    }

    let costototal= document.getElementById("costototal" + id)
    let costohra= document.getElementById("costohra" + id)
    costototal.value=(desca.value*(costohra.value*2))+(da.value*(costohra.value*2))+(ta.value*(costohra.value*3))

  }
  
}

 //Reviewd Decimales -->


 let deleteRow = (row) => {

  table.row(`#${row}`).remove().draw();

}

let row = 2
let agregar = () => {

  btnAgregar.disabled=true

  table.row.add([
  
    `<button type="submit" class="btn" id="btnDelete${row}" onClick="deleteRow(${row})"> <span class="icoSidebar fas fa-trash text-danger""></span> `,
    `<td><input class="empleado" id="e${row}" style="width: 100%;" type="number" min="0" onkeyup="getInfoEmpleado(this)"></td>`,
    `<td><input class="nombre" id="n${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="turno" id="tu${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="lunes dias" id="l${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="martes dias" id="m${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="miercoles dias" id="mc${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="jueves dias" id="j${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="viernes dias" id="v${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="sabado dias" id="s${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="domingo dias" id="d${row}" style="width: 100%;" type="number" min="0" disabled></td>`,
    `<td><input class="dobles extraA" id="da${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="triples extraA" id="ta${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="descanso extraA" id="desca${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="actual" id="a${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="laborar" id="lab${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="jefe" id="je${row}" style="width: 100%;" type="text" disabled></td>`,
    `<td><input class="textra extraS" id="te${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td><input class="textra2 extraS" id="tem${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td><input class="dlaborado extraS" id="dl${row}" style="width: 100%; text-align:center;" type="text" disabled></td>`,
    `<td ><input class="jefeid" id="jeid${row}" style="width: 100%;" type="text" hidden ></td>`,
    `<td ><input class="descanso1Incialc" id="descanso1Inicial${row}" style="width: 100%;" type="text" hidden></td>`,
    `<td ><input class="descanso2Incialc" id="descanso2Inicial${row}" style="width: 100%;" type="text" hidden></td>`,
    `<td ><input class="extrax2Inicialc" id="extrax2Inicial${row}" style="width: 100%;" type="text" hidden></td>`,
    `<td ><input class="extrax3Inicialc" id="extrax3Inicial${row}" style="width: 100%;" type="text" hidden></td>`,
    `<td ><input class="costohra" id="costohra${row}" style="width: 100%;" type="text" hidden></td>`,
    `<td ><input class="costototal" id="costototal${row}" style="width: 100%;" type="text" hidden></td>`,

  ]).node().id = `${row}`;
  table.draw(false);


  row++

  let diasInput = document.querySelectorAll(".dias")
  diasInput.forEach(element => {
    element.addEventListener('keyup', () => { changeValue(element) })
  });

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


  let data = { "empleados": arregloFinal, "fechas": fechas, "motivo": `${selectedMotivo.value}` }

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
  let duplicated=0
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

        let empleadoIdAll = document.querySelectorAll(".empleado")
        for (var i = 0, len = empleadoIdAll.length; i < len; i++) {
          if(valorInput===empleadoIdAll[i].value){
            duplicated++
          }
        }

        if(duplicated===1){


          let arrayPend =result.data.result[1]
          let pendientes=arrayPend[5]
          let cantpendiente=pendientes[0].pendiente
          let costoArray= arrayPend[6]
  
          if(costoArray != ""){
  
            let costo=costoArray[0].costo
  
            if(cantpendiente<1){
  
              let infoEmpleado = result.data.result[0]
              let infoArray = result.data.result[1]
              let infoJefe = infoArray[0]
              let horasExtraInfo = infoArray[1]
              let horasDescansoInfo1 = infoArray[2]
              let horasDescansoInfo2 = infoArray[3]
              let horasExtra = horasExtraInfo[0].horasExtra
              let horasDescanso1 = parseFloat(horasDescansoInfo1[0].horasDescanso)
              let horasDescanso2 = parseFloat(horasDescansoInfo2[0].horasDescanso)
              let solicitudesEmpleado = infoArray[4]
      
      
              let name = document.getElementById("n" + id)
              let actual = document.getElementById("a" + id)
              let jefe = document.getElementById("je" + id)
              let jefeid = document.getElementById("jeid" + id)
              let turno = document.getElementById("tu" + id)
              let extrax2 = document.getElementById("te" + id)
              let extrax3 = document.getElementById("tem" + id)
              let descanso = document.getElementById("dl" + id)
      
              let descanso1Inicial = document.getElementById("descanso1Inicial" + id)
              let descanso2Inicial = document.getElementById("descanso2Inicial" + id)
              let extrax2Incial = document.getElementById("extrax2Inicial" + id)
              let extrax3Incial = document.getElementById("extrax3Inicial" + id)
    
              let costohra = document.getElementById("costohra" + id)
      
      
      
              name.value = infoEmpleado[0].emp_nombre
              actual.value = infoEmpleado[0].emp_area
              jefe.value = infoJefe[0].emp_correo.substring(0, infoJefe[0].emp_correo.indexOf('@'))
              jefeid.value = infoJefe[0].emp_id
              turno.value = infoEmpleado[0].emp_turno
              costohra.value= costo
      
      
      
      
              extrax2.value = 0
              extrax3.value = 0
              descanso.value = 0
              extrax2.value = horasExtra
      
      
              //Horas extra dobles y triples
              if (horasExtra == null) {
                horasExtra = 0
              }
              if (horasExtra <= 9) {
                extrax2.value = horasExtra
              } else {
                extrax2.value = 9
                extrax3.value = horasExtra - 9
                extrax3.classList.remove("extraS");
                extrax3.classList.add("danger");
              }
      
              //Horas descanso laborado1
      
              if (isNaN(horasDescanso1) || horasDescanso1==null) {
                horasDescanso1 = 0
              }
      
              let doble = parseFloat(extrax2.value)
              let triple = parseFloat(extrax3.value)
      
              if (horasDescanso1 <= 8) {
                descanso.value = horasDescanso1
              } else {
                descanso.value = 8
                restante = horasDescanso1 - 8
      
                if ((doble + restante) <= 9) {
                  extrax2.value = doble + restante
                } else {
      
                  extrax2.value = 9
                  extrax3.value = triple + ((doble + restante) - 9)
                  extrax3.classList.remove("extraS");
                  extrax3.classList.add("danger");
      
                }
      
              }
        
      
      
              //Horas descanso laborado2
              
              if (isNaN(horasDescanso2) || horasDescanso2==null) {
              
                horasDescanso2 = 0
              }
      
              let doble2 = parseFloat(extrax2.value)
              let triple2 = parseFloat(extrax3.value)
      
              if (horasDescanso2 <= 8) {
                descanso.value = parseFloat(descanso.value) + horasDescanso2
              } else {
                descanso.value = parseFloat(descanso.value) + 8
                restante2 = horasDescanso2 - 8
      
                if ((doble2 + restante2) <= 9) {
                  extrax2.value = doble2 + restante2
                } else {
      
                    extrax2.value = 9
                    extrax3.value = triple2 + ((doble2 + restante2) - 9)
                    extrax3.classList.remove("extraS");
                    extrax3.classList.add("danger");
      
                }
      
              }
      
      
              descanso1Inicial.value=horasDescanso1
              descanso2Inicial.value=horasDescanso2
              extrax2Incial.value=parseFloat(extrax2.value)
              extrax3Incial.value=parseFloat(extrax3.value)
      
              // dobleEmpleado = parseFloat(extrax2.value)
              // tripleEmpleado = parseFloat(extrax3.value)
              // descanso1Empleado=horasDescanso1
              // descanso2Empleado=horasDescanso2
      
      
              enableUserInfo(id, "enable")
      
      
      
              for (let i = 0; i < fechas.length; i++) {
                
                for (let y = 0; y < solicitudesEmpleado.length; y++) {
                  if(solicitudesEmpleado[y].fecha.substring(0,solicitudesEmpleado[y].fecha.indexOf("T"))==fechas[i])
                  {
    
      
                    if(i==0){let dl = document.getElementById("l"+ id); dl.disabled=true}
                    if(i==1){let dm = document.getElementById("m"+ id); dm.disabled=true}
                    if(i==2){let dmc = document.getElementById("mc"+ id); dmc.disabled=true}
                    if(i==3){let dj = document.getElementById("j"+ id); dj.disabled=true}
                    if(i==4){let dv = document.getElementById("v"+ id); dv.disabled=true}
                    if(i==5){let ds = document.getElementById("s"+ id); ds.disabled=true}
                    if(i==6){let dd = document.getElementById("d"+ id); dd.disabled=true}
      
                  }
                  
                }
                
              }
    
    
            }else{
    
              $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
              errorMessage.innerHTML="Empleado con Solicitud Pendiente"
    
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
      
              enableUserInfo(id, "disable")
    
            }
  
  
  
          }else{
            $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
            errorMessage.innerHTML="Costo de Area no Registrado Contacte a Recursos Humanos"
          }

        }else{
          $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
          errorMessage.innerHTML="Empleado Duplicado"
        }

///////////


      

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

        enableUserInfo(id, "disable")

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


      selectCurrentWeek();
      enableMotivo();

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


function enableMotivo() {
  selectedMotivo.disabled = false

  axios({
      method: 'post',
      url: `/getMotivos`,
      headers: { 'content-type': 'application/json' }
  }).then((response) => {
   
      motivos = response.data
      selectedMotivo.innerHTML = ""
      option = document.createElement('option')
      option.text = "Seleccionar"
      selectedMotivo.add(option)
      motivos.forEach(element => {
          motivo = element.motivo
          option = document.createElement('option')
          option.text = motivo
          selectedMotivo.add(option)
      });
  })
}



function enableUserInfo(id, accion) {
  let e= document.getElementById("e"+ id)
  let dl= document.getElementById("l"+ id)
  let dm = document.getElementById("m"+ id)
  let dmc = document.getElementById("mc"+ id)
  let dj = document.getElementById("j"+ id)
  let dv = document.getElementById("v"+ id)
  let ds = document.getElementById("s"+ id)
  let dd = document.getElementById("d"+ id)
  let lab = document.getElementById("lab"+ id)

  if(accion=="enable"){
    dl.disabled=false
    dm.disabled=false
    dmc.disabled=false
    dj.disabled=false
    dv.disabled=false
    ds.disabled=false
    dd.disabled=false
    lab.disabled=false
    btnAgregar.disabled=false

  }else if(accion=="disable"){
    dl.disabled=true
    dm.disabled=true
    dmc.disabled=true
    dj.disabled=true
    dv.disabled=true
    ds.disabled=true
    dd.disabled=true
    lab.disabled=true
    btnAgregar.disabled=true

  }else{
    e.disabled=false

  }


}


selectedMotivo.addEventListener('change', function (evt) {
  enableUserInfo(1,"enableEmp")
});

btnSend.addEventListener('click', function (evt) {
  let empleadoAll = document.querySelectorAll(".nombre")
  let doblesAll = document.querySelectorAll(".dobles")
  let laborarAll = document.querySelectorAll(".laborar")
  let costoAll = document.querySelectorAll(".costototal")

  let empty = false

  for (var i = 0, len = empleadoAll.length; i < len; i++) {

    if(empleadoAll[i].value==""){
      empty=true
    }
  }

  for (var i = 0, len = doblesAll.length; i < len; i++) {

    if(doblesAll[i].value==""){
      empty=true
    }
  }

  for (var i = 0, len = laborarAll.length; i < len; i++) {

    if(laborarAll[i].value==""){
      empty=true
    }
  }

  for (var i = 0, len = costoAll.length; i < len; i++) {

    if(costoAll[i].value=="0"){
      empty=true
    }
  }

  if(selectedMotivo.value != "" && selectedMotivo.value != "Seleccionar" && empty ==false){
    send()
  }else{

    $('#modalError').modal({ backdrop: 'static', keyboard: false })
  }


});