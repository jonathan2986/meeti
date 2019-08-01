const Usuarios = require('../models/Usuarios');
const enviarEmail =  require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

//subir imagen al servidor
const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        //donde se va a guardar
        destination: (req, file, next) =>{
            next(null, __dirname+'/../public/uploads/perfiles');
        },
        filename: (req, file, next) => { //extension de el archivo
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension }`);
        }
    }),
    //limitar la subida por formato
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //el formato es valido
            next(null, true);//true para haceptar el archivo
        }else {
            //el formato no es valido
            next(new Error('Formato no valido'), false); //false para rechazar el archivo
        }
    }
};
//selecionando la imagen del campo
const upload = multer(configuracionMulter).single('imagen');

//sube imagen al servidor
exports.subirImagen = (req,res, next) =>{
    upload(req, res, function(error) {
        //validando el tamaño de la imagen
        if (error){
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande');
                }else {
                    req.flash('error',error.message);
                }
            }else if (error.hasOwnProperty('message')) {
                req.flash('error',error.message);
            }
            res.redirect('back');
            return;
        }else {
            next();
        }
    });
};

exports.formCrearCuenta = (req, res)=>{
    res.render('crear-cuenta',{
        //Agregando algunas variables
        nombrePagina: 'Crea tu cuenta'
    });
};

exports.crearNuevaCuenta = async (req, res)=>{
    const usuario = req.body;

    //Validando que el password de confirmacion no vaya vacio o que no sea diferente
    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const erroresExpress = req.validationErrors();
    console.log(erroresExpress);
    
    try {
         await Usuarios.create(usuario);
        //Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
        //enviar email de confirmacion
          await enviarEmail.enviarEmail({
           usuario,
           url,
           subject: 'Confirmar tu cuenta de Meeti',
           archivo: 'confirmar-cuenta'
        });
        req.flash('exito','Hemos enviado un  E-mail confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    }catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        //Extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(err => err.msg);
        console.log(errExp);
        //unir los errores de sequelize y de express
        const listaErrores = [...erroresSequelize, ...errExp];
        req.flash('error',listaErrores);
        res.redirect('/crear-cuenta');
    }

};
//Confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) =>{
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: { email:req.params.correo}});
    console.log(req.params.correo);
    console.log(usuario);

    //si no existe, redireccionar
    if (!usuario) {
        req.flash('error','No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //si existe, confirmar suscripcion y redireccionar
    //cambiamos el valor de activo de 0 a 1
    usuario.activo = 1;
    //Guardamos en la base de datos
    await usuario.save();
    //mensajes de alertas
    req.flash('exito','La cuenta se ha confirmado ya puedes iniciar sesion');
    res.redirect('/iniciar-sesion');



};

//Formulario para iniciar sesion
exports.formIniciarSesion = (req, res)=>{
    res.render('iniciar-sesion',{
        //Agregando algunas variables
        nombrePagina: 'Iniciar Sesion'
    });
};

//Muestra el formulario para editar el perfil
exports.formEditarPerfil = async (req, res) =>{
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil',{
        nombrePagina: 'Editar Perfil',
        usuario
    })
};
//almacena los cambios del perfil en la bd
exports.editarPerfil = async (req, res, next) =>{
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    //leer datos del formulario
    const {nombre, descripcion, email} = req.body;

    //asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //guardar en la bd
    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

};

//formulario de cambiar password
exports.formCambiarPassword =  (req, res) => {
    res.render('cambiar-password',{
        nombrePagina: 'Cambiar Password'
    })
};

//cambiar el password actual y guardar en bd
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //verificar que el password anterior sea correcto
        if (!usuario.validarPassword(req.body.anterior)) {
            req.flash('error','El password actual es incorrecto');
            res.redirect('/administracion');
            return next();
        }

    //si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    //asignar el password al usuario
    usuario.password = hash;

    //guardar en la bd
     await usuario.save();

    //redireccionar
    req.logout();
    req.flash('exito','Password modificado correctamente, vuelve a iniciar sesion');
    res.redirect('/iniciar-sesion');

};
//formulario subir imagen de perfil
exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //mostrar la vista
    res.render('imagen-perfil',{
        nombrePagina : 'Subir Imagen Perfil',
        usuario
    })
};

//guarda la imagen nueva, elimina la anterior (si aplica) y guarda el registro en la base de datos
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //si hay imagen anterior eliminarla
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        //Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error)=>{
            if (error){
                console.log(error);
            }
            return;
        });
    }

    //almacenar la nueva imagen
    if (req.file){
        //rescribimos la imagen anterior con la imagen nueva
        usuario.imagen = req.file.filename;
    }

    // almacenarla en la base de datos y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
};