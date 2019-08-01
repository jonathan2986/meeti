const Sequelize = require('sequelize');
const db = require('../config/db');
const Meeti = require('./Meeti');
const Usuarios = require('./Usuarios');
//cada comentario va a tener un usuario asociado y un meeti

const Comentarios = db.define('comentario',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensaje: Sequelize.TEXT
}, {
    timestamp: false
});
//relacion de uno a uno osea un comentario pertenece a
Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meeti);

module.exports = Comentarios;