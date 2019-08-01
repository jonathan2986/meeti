const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    //Campos que el usuario va usar para iniciar sesion
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email,password, next) => {//porque vamos hacer una consulta a la base de datos
        //este codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne( {where: { email, activo: 1}} );

        //revisamos si existe o no el usuario
        //null para que no nos devuelva ningun error, false es por si el usuario no existe
        if (!usuario) return next(null, false,{
            message: 'Ese usuario no existe'
        });

        //El usuario existe, comparar su password
        const verificarPass = usuario.validarPassword(password);
        //si el password es incorrecto
        if (!verificarPass) return next(null, false,{
            message: 'Password incorrecto'
        });

        //Salio bien
        return next(null, usuario);//null para que no de mensaje de error y retornamos el usuario
    }
));

passport.serializeUser(function (usuario, cb) {
    cb(null, usuario);
});
passport.deserializeUser(function (usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;