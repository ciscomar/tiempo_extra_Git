const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')

const multer = require('multer')
const upload = multer()

//Routes

router.get('/',middleware.sspi,middleware.userType, routesController.index_GET);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/crear_solicitud', middleware.sspi, middleware.userType, routesController.crear_solicitud_GET);
router.get('/solicitud_list/:id', middleware.sspi, middleware.userType, routesController.solicitud_list_GET);
router.post('/infoEmpleado', middleware.sspi, middleware.userType, routesController.infoEmpleado_POST);
router.post('/sendSolicitud', middleware.sspi, middleware.userType, routesController.sendSolicitud_POST);
router.post('/getSolicitudes', middleware.sspi, middleware.userType, routesController.getSolicitudes_POST);
router.get('/solicitud_historial/:id', middleware.sspi, middleware.userType, routesController.solicitud_historial_GET);
router.post('/solicitud_historial_id', middleware.sspi, middleware.userType, routesController.solicitud_historial_id_POST);
router.get('/confirmar_list/:id', middleware.sspi, middleware.userType, routesController.confirmar_list_GET);
router.post('/getConfirmar', middleware.sspi, middleware.userType, routesController.getConfirmar_POST);
router.get('/confirmar/:id', middleware.sspi, middleware.userType, routesController.confirmar_GET);
router.post('/confirmar_id', middleware.sspi, middleware.userType, routesController.confirmar_id_POST);
router.post('/confirmar_solicitud', middleware.sspi, middleware.userType, routesController.confirmar_solicitud_POST);
router.get('/confirmar_historial', middleware.sspi, middleware.userType, routesController.confirmar_historial_GET);
router.post('/getHistorialConfirmado', middleware.sspi, middleware.userType, routesController.getHistorialConfirmado_POST);
router.get('/confirmar_historial_id/:id', middleware.sspi, middleware.userType, routesController.confirmar_historial_id_GET);
router.post('/confirmar_historial_id', middleware.sspi, middleware.userType, routesController.confirmar_historial_id_POST);
router.get('/finalizar_list/:id', middleware.sspi, middleware.userType, routesController.finalizar_list_GET);
router.post('/getSolicitudesFinalizar', middleware.sspi, middleware.userType, routesController.getSolicitudesFinalizar_POST);
router.get('/finalizar/:id', middleware.sspi, middleware.userType, routesController.finalizar_GET);
router.post('/finalizar_solicitud', middleware.sspi, middleware.userType, routesController.finalizar_solicitud_POST);
router.get('/aprobar_list/:id', middleware.sspi, middleware.userType, routesController.aprobar_list_GET);
router.post('/getSolicitudesAprobar', middleware.sspi, middleware.userType, routesController.getSolicitudesAprobar_POST);
router.get('/aprobar/:id', middleware.sspi, middleware.userType, routesController.aprobar_GET);
router.post('/aprobar_solicitud', middleware.sspi, middleware.userType, routesController.aprobar_solicitud_POST);
router.post('/aprobar_id', middleware.sspi, middleware.userType, routesController.aprobar_id_POST);
router.get('/aprobar_historial', middleware.sspi, middleware.userType, routesController.aprobar_historial_GET);
router.post('/getHistorialAprobado', middleware.sspi, middleware.userType, routesController.getHistorialAprobado_POST);
router.post('/finalizar_id', middleware.sspi, middleware.userType, routesController.finalizar_id_POST);
router.get('/aprobar_historial_id/:id', middleware.sspi, middleware.userType, routesController.aprobar_historial_id_GET);
router.post('/aprobar_historial_id', middleware.sspi, middleware.userType, routesController.aprobar_historial_id_POST);
router.get('/finalizar_historial', middleware.sspi, middleware.userType, routesController.finalizar_historial_GET);
router.post('/getHistorialFinalizado', middleware.sspi, middleware.userType, routesController.getHistorialFinalizado_POST);
router.get('/finalizar_historial_id/:id', middleware.sspi, middleware.userType, routesController.finalizar_historial_id_GET);
router.post('/finalizar_historial_id', middleware.sspi, middleware.userType, routesController.finalizar_historial_id_POST);
router.post('/historial', middleware.sspi, middleware.userType, routesController.historial_POST);
router.post('/getHorasGerente', middleware.sspi, middleware.userType, routesController.getHorasGerente_POST);
router.post('/getHorasGerentePlanta', middleware.sspi, middleware.userType, routesController.getHorasGerentePlanta_POST);
router.get('/empleados_supervisor', middleware.sspi, middleware.userType, routesController.empleados_supervisor_GET);
router.post('/empleados_supervisor_fecha', middleware.sspi, middleware.userType, routesController.empleados_supervisor_fecha_POST);
router.get('/acumulado_gerente', middleware.sspi, middleware.userType, routesController.acumulado_gerente_GET);
router.post('/acumulado_gerente_fecha', middleware.sspi, middleware.userType, routesController.acumulado_gerente_fecha_POST);
router.get('/acumulado_planta', middleware.sspi, middleware.userType, routesController.acumulado_planta_GET);
router.post('/acumulado_planta_fecha', middleware.sspi, middleware.userType, routesController.acumulado_planta_fecha_POST);
router.get('/gerente_supervisores', middleware.sspi, middleware.userType, routesController.gerente_supervisores_GET);
router.post('/gerente_supervisores_fecha', middleware.sspi, middleware.userType, routesController.gerente_supervisores_fecha_POST);
router.get('/gerente_gerentes', middleware.sspi, middleware.userType, routesController.gerente_gerentes_GET);
router.post('/gerente_gerentes_fecha', middleware.sspi, middleware.userType, routesController.gerente_gerentes_fecha_POST);
router.post('/getMotivos', middleware.sspi, middleware.userType, routesController.getMotivos_POST);
router.get('/solicitud_editar/:id', middleware.sspi, middleware.userType, routesController.solicitud_editar_GET);
router.post('/editarSolicitud', middleware.sspi, middleware.userType, routesController.editarSolicitud_POST);
router.get('/solicitud_utilizado/:id', middleware.sspi, middleware.userType, routesController.solicitud_utilizado_GET);
router.post('/solicitud_utilizado_id', middleware.sspi, middleware.userType, routesController.solicitud_utilizado_id_POST);
router.get('/solicitud_utilizado_historial/:id', middleware.sspi, middleware.userType, routesController.solicitud_utilizado_historial_GET);
router.post('/horas_utilizadas', middleware.sspi, middleware.userType, routesController.horas_utilizadas_POST);
router.get('/pendiente_rh/:id', middleware.sspi, middleware.userType, routesController.pendiente_rh_GET);
router.post('/getSolicitudesPendienteRH', middleware.sspi, middleware.userType, routesController.getSolicitudesPendienteRH_POST);
router.get('/configuracion', middleware.sspi, middleware.userType, routesController.configuracion_GET);
router.post('/getCostos', middleware.sspi, middleware.userType, routesController.getCostos_POST);
router.post('/deleteMotivo', middleware.sspi, middleware.userType, routesController.deleteMotivo_POST);
router.post('/deleteCosto', middleware.sspi, middleware.userType, routesController.deleteCosto_POST);
router.post('/getAreas', middleware.sspi, middleware.userType, routesController.getAreas_POST);
router.post('/InsertCosto', middleware.sspi, middleware.userType, routesController.InsertCosto_POST);
router.post('/InsertMotivo', middleware.sspi, middleware.userType, routesController.InsertMotivo_POST);
router.get('/catalogo', middleware.sspi, middleware.userType, routesController.catalogo_GET);
router.post('/insertar_catalogo', middleware.sspi, middleware.userType, upload.single("excelFile"), routesController.insertar_catalogo_POST);
router.get('/search_empleados',middleware.sspi, middleware.userType, routesController.Search_Empleados_GET);
router.post('/cancelar_solicitud', middleware.sspi, middleware.userType, routesController.cancelar_solicitud_POST);
router.post('/getVacaciones', middleware.sspi, middleware.userType, routesController.getVacaciones_POST);
router.post('/deleteVacaciones', middleware.sspi, middleware.userType, routesController.deleteVacaciones_POST);
router.post('/InsertVacaciones', middleware.sspi, middleware.userType, routesController.InsertVacaciones_POST);
router.get('/busqueda/:id', middleware.sspi, middleware.userType, routesController.busqueda_GET);
router.post('/getBusqueda', middleware.sspi, middleware.userType, routesController.getBusqueda_POST);
router.post('/infoEmpleadoConfig', middleware.sspi, middleware.userType, routesController.infoEmpleadoConfig_POST);


module.exports = router;