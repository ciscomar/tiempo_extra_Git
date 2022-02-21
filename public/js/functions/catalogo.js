let formData = new FormData()
let excelFile = document.getElementById("excelFile")
let modal_errorText = document.getElementById("modal_errorText")
let btnExcelDownload = document.getElementById("btnExcelDownload")
let myTable
let dTableBtns = document.getElementsByClassName("dt-buttons")



excelFile.addEventListener("change", () => {
    if (document.getElementById("excelFile").files.length == 0) {
        btn_excel.disabled = true;
        btn_excel.classList.remove("animate__flipInX")
        btn_excel.classList.add("animate__flipOutX")
    } else {
        btn_excel.disabled = false;
        btn_excel.classList.remove("animate__flipOutX")
        btn_excel.classList.add("animate__flipInX")
    }
});


btnExcelDownload.addEventListener("click", () => {

    myTable.button('0').trigger()



})


$(document).ready(function () {

    loadTable()

})


function sendData() {


    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    formData.delete('excelFile')
    formData.append('excelFile', excelFile.files[0])

    axios({
        method: 'post',
        url: `/insertar_catalogo`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((response) => {

            if (response.data === "ok") {
                setTimeout(function () { $('#modalSpinner').modal('hide') }, 100);
                myTable.clear().destroy()
                loadTable()

                $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })



            } else {
                setTimeout(function () { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
                modal_errorText.innerHTML = response.data

            }

            excelFile.value = ""
            btn_excel.disabled = true;
            btn_excel.classList.remove("animate__flipInX")
            btn_excel.classList.add("animate__flipOutX")
        })
        .catch((err) => {

        })
}



function loadTable() {

    let fileDate = new Date()
    axios({
        method: 'get',
        url: "/search_empleados",
        data: JSON.stringify(),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then(result => {
            //Se crea la variable con la informaicon en JSON
            let empleados = result.data
            data = []
            empleados.forEach(empleado => {
                let info = [
                    empleado.emp_id,
                    empleado.emp_activo,
                    empleado.emp_nombre,
                    empleado.emp_correo,
                    empleado.emp_alias,
                    empleado.emp_fecha_ingreso.substring(0, empleado.emp_fecha_ingreso.indexOf("T")),
                    empleado.emp_genero,
                    empleado.emp_categoria,
                    empleado.emp_id_jefe,
                    empleado.emp_turno,
                    empleado.emp_area
                ]
                data.push(info)
            });

            myTable = $('#myTable').DataTable({
                dom: "<'row'<'col-lg-4'l><'col-lg-4 text-center'B><'col-lg-4'f>><'row'<'col-lg-2't>><'row'<'col-lg-3'i><'col-lg-6'><'col-lg-3'p>>",
                data: data,
                bInfo: false,
                buttons: [
                    {
                        extend: 'excelHtml5',
                        title: null,
                        filename: `Catalogo_Empleados_Tristone_${fileDate.toDateString().replace(/\s+/g, '')}`,
                        className: "d-none"

                    }

                ]
            })



        })

}