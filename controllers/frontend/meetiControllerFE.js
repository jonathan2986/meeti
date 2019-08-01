const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: {
            slug: req.params.slug
        },
        include:[
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });
    
    //si no existe 
    if (!meeti){
        res.redirect('/')
    }
    //consultar por meetis cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]}) ')`);

    //ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_Distance_Sphere',Sequelize.col('ubicacion'), ubicacion);

    //encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, //los ordenas del mas cercano al lejano
        where: Sequelize.where(distancia, {[Op.lte] : 2000}),// muestra lo que estan a menos de 2kml
        limit: 3, //maximo tres
        offset: 1,//ignora el primero

        include:[
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]

    });

    //Consultar despues de verificar que existe el meeti

    const comentarios = await Comentarios.findAll({
        where:{ meetiId : meeti.id},
        include: [
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });

    //pasar resultado a la vista
    res.render('mostrar-meeti',{
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    });
    
};
//confirma o cancela si el usuario asistira
exports.confirmarAsistencia = async (req, res) => {
    console.log(req.body);

    const { accion } = req.body;
    
    if (accion === 'confirmar') {
        //agregar el usuario
        Meeti.update(
            {'interesados' : Sequelize.fn('array_append', Sequelize.col('interesados'),
                    req.user.id)},
            {'where' : {'slug' : req.params.slug}}
        );
        //mensaje
        res.send('Has confirmado tu asistencia');
    }else {
        //cancelar la asistencia del usuario
        Meeti.update(
            {'interesados' : Sequelize.fn('array_remove', Sequelize.col('interesados'),
                    req.user.id)},
            {'where' : {'slug' : req.params.slug}}
        );
        //mensaje
        res.send('Has cancelado tu asistencia');
    }

};

//muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {slug: req.params.slug},
        attributes: ['interesados']
    });
    //extraer interesados
    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre','imagen'],
        where: {id: interesados}
    });
    //crear la vista
    res.render('asistentes-meeti',{
        nombrePagina: 'Lista de Asistentes Meeti',
        asistentes
    })
};

//mostrar meeti por categoria
exports.mostrarCategoria = async (req, res, next) => {
  const categoria = await Categorias.findOne({
      attributes: ['id','nombre'],
      where: {
          slug: req.params.categoria
      }
  });
  const meetis = await Meeti.findAll({
      order: [
          ['fecha','ASC'],
          ['hora','ASC']
      ],
      include: [
          {
              model: Grupos,
              where: {categoriaId: categoria.id}
          },
          {
              model: Usuarios
          }
      ]
  });
    res.render('categoria',{
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment

    })
};