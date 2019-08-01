const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const router = require('./routes');

//importamos la configuracion de la base de datos y los modelos
const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
require('./models/Comentarios');
//genera las tablas
db.sync().then(()=>{
    console.log('DB conectada')
}).catch((error)=>{
    console.log(error);
});

//variables de desarrollo
require('dotenv').config({path: 'variables.env'});

//Aplicacion principal
const app = express();

//Body parser, leer formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Express validator (validacion con muchas funciones)
app.use(expressValidator());

//habilitar ejs como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
//ubicacion vistas
app.set('views', path.join(__dirname, './views'));

//archivos estaticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//crear la session
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());
//Agrega flash messages
 app.use(flash());

//Creando middleware propio (usuario logueado, flash message, fecha actual)
app.use((req,res, next) =>{
    //para los usuarios autenticado
    res.locals.usuario = {...req.user} || null;
    //next para que se vaya al siguiente middleware
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();//siguiente middleware
});

//Routing: cuando estemos en la pagina principal usaremos todas las rutas
app.use('/', router());

//leer el host y el puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000
//Escuchando el puerto
app.listen(port, host, ()=>{
    console.log('El servidor esta funcionando');
});