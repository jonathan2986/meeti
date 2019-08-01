const Categorias = require('../models/Categorias');
const Meeti = require('../models/Meeti');
const Grupos = require('../models/Grupos');
const Usuario = require('../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
exports.home = async (req, res)=>{
    //promiste para consultas en el home
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meeti.findAll({//trae 3 meeti
        attributes: ['slug','titulo','fecha','hora'],
        where: {
            fecha: {[Op.gte] : moment(new Date()).format("YYYY-MM-DD")}
        },
        limit: 3,
        order: [
            ['fecha','ASC']
        ],
        include: [
            {
                model: Grupos,
                attributes: ['imagen']
            },
            {
                model: Usuario,
                attributes: ['nombre','imagen']
            }
        ]
    }));
    //extraer y pasar a la vista
    const [categorias, meetis] = await Promise.all(consultas);

    res.render('home',{
        //Agregando algunas variables
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
};