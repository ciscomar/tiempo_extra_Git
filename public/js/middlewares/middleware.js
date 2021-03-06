
const nodeSSPI = require('node-sspi');
const middleware = {};
const funcion = require('../functions/controllerFunctions');



middleware.sspi = (req, res, next) => {
    let nodeSSPIObj = new nodeSSPI({
        retrieveGroups: true,

    });
    nodeSSPIObj.authenticate(req, res, function (err) {
        res.finished || next()
    });
}


middleware.userType = (req, res, next) => {

    let sidebar="no"
    let access = ""
    let userGroups = req.connection.userGroups
    let user = req.connection.user

    let userInfo = []
    userInfo.push(user)

    userGroups.forEach(element => {
                
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_Supervisor") {access = "ok", sidebar="supervisor"}
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_Gerente") {access = "ok", sidebar="gerente"}
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_GerentePlanta") {access = "ok", sidebar="planta"}
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_RH") {access = "ok", sidebar="rh"}
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_Admin") {access = "ok", sidebar="admin"}
                if (element === "TFT\\TFT.DEL.PAGES_TiempoExtra_RH_Catalogo") {access = "ok", sidebar="rhc"}
                
            });

            funcion.getEmpleadoCorreo(user.substring(4))
            .then((result) => {

    
                if(result.length != 1){
                    sidebar="no"
                }

                if (access === "ok" && result.length===1) {

                    userInfo.push(sidebar)
                    res.locals.authData=userInfo
                    next()
                    
                }else{
                    res.render('acceso_denegado.ejs',{sidebar, user})
                    
                }

            })

            


}



module.exports = middleware;