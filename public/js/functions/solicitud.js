let table = $('#table2').DataTable(
  {bFilter: false, 
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

let textra = document.querySelectorAll(".textra")
textra.forEach(element => {
  element.addEventListener('change',()=>{changeValue()} )
});

function changeValue(){
  console.log("testt");
}

let row=2
let agregar = () =>{

    table.row.add([

        `<td><input class="empleado" id="e${row}" style="width: 100%;" type="text" onkeyup="getInfoEmpleado(this)"></td>`,
        `<td><input class="nombre" id="n${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="turno" id="tu${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="lunes" id="l${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="martes" id="m${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="miercoles" id="mc${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="jueves" id="j${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="viernes" id="v${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="sabado" id="s${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="domingo" id="d${row}" style="width: 100%;" type="number"></td>`,
        `<td><input class="textra" id="te${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="textra2" id="tem${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="dlaborado" id="dl${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="actual" id="a${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="laborar" id="l${row}" style="width: 100%;" type="text"></td>`,
        `<td><input class="jefe" id="je${row}" style="width: 100%;" type="text" disabled></td>`,
        `<td><input class="jefeid" id="jeid${row}" style="width: 100%;" type="text" hidden></td>`,
        
      ]).draw(false);

      row++

}


let columnas = [empleado, nombre, turno, lunes, martes, miercoles, jueves, viernes, sabado, domingo, actual, laborar, jefeid]
let arregloFinal=[]


let send = () =>{

for (let i = 0; i < empleado.length; i++) {
    let temp=[];
    columnas.forEach(column => {
      temp.push(column[i].value)
    });
    arregloFinal.push(temp)
}

let data = { "empleados": arregloFinal, "fechas": fechas, "motivo": `${selectMotivo.value}`}

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



let getInfoEmpleado = (e) =>{

  let id= e.id.substring(1);
 
  if(e.value===""){
    valorInput=0
  }else{
    valorInput=e.value
  }

    let data = { "empleado": `${valorInput}`, "week_start": `${week_start}`, "week_end": `${week_end}`}

    axios({
      method: 'post',
      url: `/infoEmpleado`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
    })
      .then((result) => {
    
        

        if(result.data.result != undefined){
           let infoEmpleado=result.data.result[0]
           let infoArray= result.data.result[1]
           let infoJefe= infoArray[0]
           let horasExtraInfo=infoArray[1]
           let horasDescansoInfo1=infoArray[2]
           let horasDescansoInfo2=infoArray[3]
           let horasExtra=horasExtraInfo[0].horasExtra
           let horasDescanso1 = horasDescansoInfo1[0].horasDescanso
           let horasDescanso2 = horasDescansoInfo2[0].horasDescanso


           let name= document.getElementById("n"+id)
           let actual= document.getElementById("a"+id)
           let jefe= document.getElementById("je"+id)
           let jefeid= document.getElementById("jeid"+id)
           let turno= document.getElementById("tu"+id)
           let extrax2= document.getElementById("te"+id)
           let extrax3= document.getElementById("tem"+id)
           let descanso= document.getElementById("dl"+id)



           name.value=infoEmpleado[0].emp_nombre
           actual.value=infoEmpleado[0].emp_categoria
           jefe.value=infoJefe[0].emp_correo.substring(0,infoJefe[0].emp_correo.indexOf('@'))
           jefeid.value=infoJefe[0].emp_id
           turno.value=infoEmpleado[0].emp_activo

          
           extrax2.value=horasExtra

           //Horas extra dobles y triples
           if(horasExtra<10){
            extrax2.value=horasExtra
           }else{
             extrax2.value=9
             extrax3.value=horasExtra-9
           }
           //Horas descanso laborado

           let doble= extrax2.value
           let triple= extrax3.value

           if(horasDescanso1<9){
             descanso.value=horasDescanso1
           }else{
             descanso.value=8
             restante= horasDescanso1-8
             if((doble+restante)<10){
               extrax2.value= doble+restante
             }else{
              //  extrax3.value= 
             }

           }

          



        }else{
      
          let name= document.getElementById("n"+id)
          let actual= document.getElementById("a"+id)
          let jefe= document.getElementById("je"+id)
          let jefeid= document.getElementById("jeid"+id)

           name.value=""
           actual.value=""
           jefe.value=""
           jefeid.value=""

        }
  
      })
      .catch((err) => { console.error(err) })
    
}




let fechas =[];
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

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
        let dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat;
        $('#startDate').val($.datepicker.formatDate(dateFormat, startDate, inst.settings));
        $('#endDate').val($.datepicker.formatDate(dateFormat, endDate, inst.settings));

        $('#btnSeleccionar').show();

        $('#week').val($.datepicker.formatDate(dateFormat, startDate, inst.settings) + "   a   "+ $.datepicker.formatDate(dateFormat, endDate, inst.settings))

        week_start=$.datepicker.formatDate(dateFormat, startDate, inst.settings)
        week_end= $.datepicker.formatDate(dateFormat, endDate, inst.settings)

        fechas=[];
        for (let i = 1; i < 8; i++) {
          let fecha= new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + i)
          fechas.push($.datepicker.formatDate(dateFormat, fecha, inst.settings))
          
        }


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