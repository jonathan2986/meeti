const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

exports.formNuevoMeeti = async (req, res) =>{
    //traemos los grupo que pertenecen a este usuario
    const grupos = await Grupos.findAll({where: {usuarioId: req.user.id}});
    res.render('nuevo-meeti',{
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
};

//inserta nuevos meeti en la bd
exports.crearMeeti = async (req, res) => {
    const meeti = req.body;
    //asignar el usuario
    meeti.usuarioId = req.user.id;

    //almacena la ubicacion con un point

    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;
    
    //cupo opciona;
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    //almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito','Se ha creado el meeti correctamente');
        res.redirect('/administracion');
    }catch (error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error',erroresSequelize);
        res.redirect('/nuevo-meeti');
    }

};

//sanatiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('provincia');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
};

//Formulario Editar meeti
exports.formEditarMeeti = async (req, res) =>{
    const consultas = [];
    consultas.push(Grupos.findAll({where: {usuarioId : req.user.id}}))
    consultas.push(Meeti.findByPk(req.params.id) );

    //retornar una promesa
    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti){
        req.flash('error','Operacion invalida');
        res.redirect('/administracion');

        return next();
    }

    //mostramos la vista
    res.render('editar-meeti',{
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
};

//almacena los cambios en la base de datos
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if (!meeti){
        req.flash('error','Operacion invalida');
        res.redirect('/administracion');

        return next();
    }

    //asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo,
           descripcion, direccion, ciudad, provincia, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.provincia = provincia;
    meeti.pais = pais;

    //Asignar point (ubicacion)
    const point = { type: 'Point',coordinates: [parseFloat(lat),parseFloat(lng)]};
    meeti.ubicacion = point;

    //almacenarlo en la bd
    await meeti.save();
    req.flash('exito','Cambios Guardados Correctamente');
    res.redirect('/administracion');
};

//muestra un formulario para eliminar meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if (!meeti){
        req.flash('error','Operacion no valida');
        req.redirect('/administracion');
        return next();
    }

    //mostrarmos la vista
    res.render('eliminar-meeti',{
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
};

//eliminando meeti de la base de datos
exports.eliminarMeeti = async (req, res) => {
     await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });
    req.flash('exito','Meeti eliminado');
    res.redirect('/administracion')
};
