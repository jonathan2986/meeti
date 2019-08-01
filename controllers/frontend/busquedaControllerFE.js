const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadoBusqueda = async (req, res) => {


    //leer datos de la url
    const { categoria, titulo, ciudad, provincia } = req.query; //cuando pasamos los parametros por GET

    //si la categoria esta vacia
    let query;
    if (categoria === '') {
        query = '';
    }else {
        query = ` where: {
                    categoriaId: { [Op.eq] : ${categoria}}
                 }`
    }
    //filtrar los meetis por los terminos de busqueda
    const meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike] : '%' + titulo + '%'},
            ciudad: { [Op.iLike] : '%' + ciudad + '%'},
            provincia: { [Op.iLike] : '%' + provincia+ '%'}
        },
        include:[
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });
    //pasar los resultado a la vista
    res.render('busqueda',{
        nombrePagina: 'Resultados Busqueda',
        meetis,
        moment
    })
};