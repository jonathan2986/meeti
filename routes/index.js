const express = require('express');
const router = express.Router();

// importando los controladores
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentarioControllerFE = require('../controllers/frontend/comentarioControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');
//lo hace disponible en el archivo principal
module.exports = function () {

    // AREA PUBLICA

    //cuando estamos en la pagina principal  redirigimos a inicio
    router.get('/',homeController.home);

    //muestra un meeti en el frontend
    router.get('/meeti/:slug',meetiControllerFE.mostrarMeeti);

    //confirma asistencia
    router.post('/confirmar-asistencia/:slug',meetiControllerFE.confirmarAsistencia);

    //comentarios
    router.post('/meeti/:id',comentarioControllerFE.agregarComentario);
    router.post('/eliminar-comentario',comentarioControllerFE.eliminarComentario);

    //mostrar perfiles en el frontend
    router.get('/asistentes/:slug',meetiControllerFE.mostrarAsistentes);

    //mostrar meeti
    router.get('/usuarios/:id',usuariosControllerFE.mostrarPerfilUsuario);

    //mostrar grupos en el frontend
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    //muestra meeti por categoria
    router.get('/categoria/:categoria', meetiControllerFE.mostrarCategoria);

    //Agrega las busqueda
    router.get('/busqueda',busquedaControllerFE.resultadoBusqueda);
    //Crear y confirmar cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo',usuariosController.confirmarCuenta);

    //Iniciar sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',authController.autenticarUsuario);

    //cerrar sesion
    router.get('/cerrar-sesion', authController.usuarioAutenticado,
                                 authController.cerrarSesion);



    // AREA PRIVADA

    //Panel de administracion
    router.get('/administracion',authController.usuarioAutenticado,
                                 adminController.panelAdministracion);

    //Nuevos grupos
    router.get('/nuevo-grupo', authController.usuarioAutenticado,
                                gruposController.formNuevoGrupo);

    router.post('/nuevo-grupo',authController.usuarioAutenticado,
                                gruposController.subirImagen,
                                gruposController.crearGrupo);

    //Editar grupos
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado,
                                        gruposController.formEditarGrupo);

    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado,
                                        gruposController.editarGrupo);

    //Editar imagen del grupo
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado,
                                         gruposController.formEditarImagen);

    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado,
                                          gruposController.subirImagen,
                                          gruposController.editarImagen);

    //eliminar grupo
    router.get('/eliminar-grupo/:grupoId',authController.usuarioAutenticado,
                                          gruposController.formEliminarGrupo);
    router.post('/eliminar-grupo/:grupoId',authController.usuarioAutenticado,
                                           gruposController.eliminarGrupo);

    //Nuevos Meeti

    router.get('/nuevo-meeti',authController.usuarioAutenticado,
                              meetiController.formNuevoMeeti);

    router.post('/nuevo-meeti',authController.usuarioAutenticado,
                               meetiController.sanitizarMeeti,
                               meetiController.crearMeeti);

    router.get('/editar-meeti/:id',authController.usuarioAutenticado,
                                   meetiController.formEditarMeeti);

    router.post('/editar-meeti/:id',authController.usuarioAutenticado,
                                    meetiController.editarMeeti);

    router.get('/eliminar-meeti/:id',authController.usuarioAutenticado,
                                     meetiController.formEliminarMeeti);

    router.post('/eliminar-meeti/:id',authController.usuarioAutenticado,
                                     meetiController.eliminarMeeti);

    //editar informacion del perfil
    router.get('/editar-perfil',authController.usuarioAutenticado,
                                    usuariosController.formEditarPerfil);

    router.post('/editar-perfil',authController.usuarioAutenticado,
        usuariosController.editarPerfil);

    //modificar el password
    router.get('/cambiar-password',authController.usuarioAutenticado,
                                    usuariosController.formCambiarPassword);

    router.post('/cambiar-password',authController.usuarioAutenticado,
                                     usuariosController.cambiarPassword);

    //imagenes de perfil
    router.get('/imagen-perfil',authController.usuarioAutenticado,
                                usuariosController.formSubirImagenPerfil);

    router.post('/imagen-perfil',authController.usuarioAutenticado,
                                 usuariosController.subirImagen,
                                 usuariosController.guardarImagenPerfil);

    return router;
};