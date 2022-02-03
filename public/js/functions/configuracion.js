let selectedAreas = document.getElementById("selectedAreas")
let btnGuardarCosto = document.getElementById("btnGuardarCosto")
let btnGuardarMotivo = document.getElementById("btnGuardarMotivo")
let costo = document.getElementById("costo")
let inputmotivo = document.getElementById("inputmotivo")

let table2 = $('#table2').DataTable(
    {
      bFilter: false,
      bInfo: false,
      paging: false
    }
  );

  let table = $('#table').DataTable(
    {
      bFilter: false,
      bInfo: false,
      paging: false
    }
  );


$(document).ready(function () {


    funcionmotivos()
    funcioncostos()
    selectedArea()

})

function funcionmotivos(){


    axios({
        method: 'post',
        url: `/getMotivos`,
        headers: { 'content-type': 'application/json' }
    }).then((response) => {
     
        motivos = response.data

        motivos.forEach(m => {
            
            eliminar=`<button id="${m.id}"
            class="btn btn-danger text-center" data-toggle="tooltip" data-placement="left"
            onclick="eliminarMotivo(this.id)"><span class="icoWhite fas fa-trash-alt"></span></button>`
            
            table2.row.add([
                eliminar,
                m.motivo,

            ]).draw(false);
        });
        

    })



}

function funcioncostos(){


    axios({
        method: 'post',
        url: `/getCostos`,
        headers: { 'content-type': 'application/json' }
    }).then((response) => {
     
        costos = response.data

        costos.forEach(c => {

            eliminar=`<button id="${c.id}"
            class="btn btn-danger text-center" data-toggle="tooltip" data-placement="left"
            onclick="eliminarCosto(this.id)"><span class="icoWhite fas fa-trash-alt"></span></button>`
         
            table.row.add([
                eliminar,
                c.area,
                c.costo,

            ]).draw(false);
        });
        

    })


}

function eliminarMotivo(id){

    data = { "id": `${id}` }
    axios({
        method: 'post',
        url: `/deleteMotivo`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((response) => {
     
        table2.clear().draw();
        funcionmotivos();

    })
    
}


function eliminarCosto(id){

    data = { "id": `${id}` }
    axios({
        method: 'post',
        url: `/deleteCosto`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((response) => {
     
        table.clear().draw();
        funcioncostos();
        selectedArea()

    })
    
}




function selectedArea(){

    axios({
        method: 'post',
        url: `/getAreas`,
        headers: { 'content-type': 'application/json' }
    }).then((response) => {
     
       
        areas = response.data
        if(areas.length>0){
            selectedAreas.disabled=false
            costo.disabled=false
            btnGuardarCosto.disabled=false
            selectedAreas.innerHTML = ""
            option = document.createElement('option')
            option.text = "Seleccionar"
            selectedAreas.add(option)
            areas.forEach(element => {
                motivo = element.emp_area
                option = document.createElement('option')
                option.text = motivo
                selectedAreas.add(option)
            });
        }else{

            selectedAreas.innerHTML = ""
            option = document.createElement('option')
            option.text = "Seleccionar"
            selectedAreas.add(option)
            selectedAreas.disabled=true
            costo.disabled=true
            btnGuardarCosto.disabled=true

        }


    })




}



btnGuardarCosto.addEventListener('click', function (evt) {

    if(selectedAreas.value != "Seleccionar" && costo.value>0)
    {

        data = { "area": `${selectedAreas.value}`, "costo": `${costo.value}` }
        axios({
            method: 'post',
            url: `/InsertCosto`,
            data: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        }).then((response) => {
    
    
            table.clear().draw();
            selectedArea()
            funcioncostos()
            costo.value=""

        })

    }


})




btnGuardarMotivo.addEventListener('click', function (evt) {


    if(inputmotivo.value != "")
    {

        data = { "motivo": `${inputmotivo.value}` }
        axios({
            method: 'post',
            url: `/InsertMotivo`,
            data: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        }).then((response) => {
    
    
            table2.clear().draw();
            funcionmotivos();
            inputmotivo.value=""

        })

    }


})