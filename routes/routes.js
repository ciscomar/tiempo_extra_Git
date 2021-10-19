const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')



//Routes

router.get('/', routesController.index_GET);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/crear_solicitud', middleware.sspi, routesController.crear_solicitud_GET);
router.get('/solicitud_list/:id', middleware.sspi, routesController.solicitud_list_GET);
router.post('/infoEmpleado', middleware.sspi, routesController.infoEmpleado_POST);
router.post('/sendSolicitud', middleware.sspi, routesController.sendSolicitud_POST);
router.post('/getSolicitudes', middleware.sspi, routesController.getSolicitudes_POST);
router.get('/solicitud_historial/:id', middleware.sspi, routesController.solicitud_historial_GET);
router.post('/solicitud_historial_id', middleware.sspi, routesController.solicitud_historial_id_POST);
router.get('/confirmar_list/:id', middleware.sspi, routesController.confirmar_list_GET);
router.post('/getConfirmar', middleware.sspi, routesController.getConfirmar_POST);
router.get('/confirmar/:id', middleware.sspi, routesController.confirmar_GET);
router.post('/confirmar_id', middleware.sspi, routesController.confirmar_id_POST);
router.post('/confirmar_solicitud', middleware.sspi, routesController.confirmar_solicitud_POST);
router.get('/confirmar_historial', middleware.sspi, routesController.confirmar_historial_GET);
router.post('/getHistorialConfirmado', middleware.sspi, routesController.getHistorialConfirmado_POST);
router.get('/confirmar_historial_id/:id', middleware.sspi, routesController.confirmar_historial_id_GET);
router.post('/confirmar_historial_id', middleware.sspi, routesController.confirmar_historial_id_POST);
router.get('/finalizar_list/:id', middleware.sspi, routesController.finalizar_list_GET);
router.post('/getSolicitudesFinalizar', middleware.sspi, routesController.getSolicitudesFinalizar_POST);
router.get('/finalizar/:id', middleware.sspi, routesController.finalizar_GET);
router.post('/finalizar_solicitud', middleware.sspi, routesController.finalizar_solicitud_POST);
router.get('/aprobar_list/:id', middleware.sspi, routesController.aprobar_list_GET);
router.post('/getSolicitudesAprobar', middleware.sspi, routesController.getSolicitudesAprobar_POST);
router.get('/aprobar/:id', middleware.sspi, routesController.aprobar_GET);
router.post('/aprobar_solicitud', middleware.sspi, routesController.aprobar_solicitud_POST);
router.post('/aprobar_id', middleware.sspi, routesController.aprobar_id_POST);
router.get('/aprobar_historial', middleware.sspi, routesController.aprobar_historial_GET);
router.post('/getHistorialAprobado', middleware.sspi, routesController.getHistorialAprobado_POST);
router.post('/finalizar_id', middleware.sspi, routesController.finalizar_id_POST);
router.get('/aprobar_historial_id/:id', middleware.sspi, routesController.aprobar_historial_id_GET);
router.post('/aprobar_historial_id', middleware.sspi, routesController.aprobar_historial_id_POST);
router.get('/finalizar_historial', middleware.sspi, routesController.finalizar_historial_GET);
router.post('/getHistorialFinalizado', middleware.sspi, routesController.getHistorialFinalizado_POST);
router.get('/finalizar_historial_id/:id', middleware.sspi, routesController.finalizar_historial_id_GET);
router.post('/finalizar_historial_id', middleware.sspi, routesController.finalizar_historial_id_POST);
router.post('/historial', middleware.sspi, routesController.historial_POST);
router.post('/getHorasGerente', middleware.sspi, routesController.getHorasGerente_POST);



module.exports = router;