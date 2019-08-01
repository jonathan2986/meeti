const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

//subir imagen al servidor
const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        //donde se va a guardar
        destination: (req, file, next) =>{
            next(null, __dirname+'/../public/uploads/grupos');
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
exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();
    res.render('nuevo-grupo',{
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
};

//Almacena los grupos
exports.crearGrupo = async (req, res)=>{
    //Sanitizar los campos
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    const grupo = req.body;
    //Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = await req.user.id;

    //Leer imagen
    if (req.file){
        grupo.imagen = req.file.filename;
    }
    try {
        //Almacenar en la base de datos
        await Grupos.create(grupo);
        req.flash('exito','Se ha creado el Grupo Exitosamente');
        res.redirect('/administracion');
    }catch (error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error',erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
};

//form editar grupo
exports.formEditarGrupo = async (req, res) => {

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    //destrotoring
    const [grupo, categorias] = await Promise.all(consultas);
    res.render('editar-grupo',{
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
};

//guardar los cambios
exports.editarGrupo = async (req, res, next) => {
    //verificamos los grupos por el id y el usuario creador
    //verificamos que la persona que esta aqui fue la misma que creo el grupo
    const grupo = await Grupos.findOne({ where: { id : req.params.grupoId, usuarioId : req.user.id}});

    //si no existe el grupo o no es el dueño
    if (!grupo){
        req.flash('error','Operacion no valida');
        req.redirect('/administracion');
        return next();
    }

    //bien leer los valores
    // console.log(req.body);
    const {nombre, descripcion, categoriaId, url}  = req.body;
    //asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //guardamos en la base de datos
    await grupo.save();
    req.flash('exito','cambios almacenados');
    res.redirect('/administracion');

};

//Muestra formulario para editar una imagen
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id : req.params.grupoId, usuarioId : req.user.id}});

    //redirigimos a una vista
    res.render('imagen-grupo',{
        nombrePagina : `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    });
};

//Modificar la imagen y eliminar la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id : req.params.grupoId, usuarioId : req.user.id}});

    //Si el grupo no es valido
    if (!grupo){
        req.flash('error','Operacion no valida');
        req.redirect('/iniciar-sesion');
        return next();
    }
    //verificar que el archivo sea nuevo
    // if (req.file){
    //     console.log(req.file.filename);
    // }
    // //revisar que exista un archivo anterior
    // if (grupo.imagen){
    //     console.log(grupo.imagen)
    // }
//si hay imagen anterior y nueva, signifia que vamos a borrar la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error)=>{
           if (error){
               console.log(error);
           }
           return;
        });
    }
    //Si hay una imagen nueva, la guardamos
    if (req.file){
        //rescribimos la imagen anterior con la imagen nueva
        grupo.imagen = req.file.filename;
    }
    //guardar en la base de datos
    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
};

//muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id : req.params.grupoId, usuarioId : req.user.id}});

    if (!grupo){
        req.flash('error','Operacion no valida');
        req.redirect('/administracion');
        return next();
    }

    //exito, bien ejecutar la vista
    res.render('eliminar-grupo',{
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    });

};

//elimina el grupo y la imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id : req.params.grupoId, usuarioId : req.user.id}});

    //si hay una imagen eliminarla
    if (grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error)=>{
            if (error){
                console.log(error);
            }
            return;
        });
    }
    //eliminar el grupo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });
    //redireccionar al usuario
    req.flash('exito','Grupo eliminado');
    res.redirect('/administracion');
};