const Sequelize = require('sequelize');
const db = require('../config/db');
// const uuid = require('uuid');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Grupos = db.define('grupos',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // allowNull: false,
        // defaultValue: uuid()
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El grupo debe tener un nombre'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Coloca una descripcion'
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
});
//Relacion entre grupo y categoria, un grupo va a tener una categoria
Grupos.belongsTo(Categorias);//relacion de uno a uno

//Relacion entre grupo y usuarios, cada grupo debe tener un usuario que lo a creado
Grupos.belongsTo(Usuarios);//relacion de uno a uno

module.exports = Grupos;

