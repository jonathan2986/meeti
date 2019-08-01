const passport = require('passport');
exports.autenticarUsuario = passport.authenticate('local',{
   //si autentica bien o si pone una contrasena mal
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorio'
});

//Revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }
    //si no esta autenticado
    return res.redirect('/iniciar-sesion');
};

//cerrar sesion
exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('correcto','Cerraste Sesion correctamente');
    res.redirect('/iniciar-sesion');
    next();
};