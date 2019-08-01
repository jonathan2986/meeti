const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
//bcrypt node genera el hash de 60 caracteres

const Usuarios = db.define('usuarios',{
   id: {
       type: Sequelize.INTEGER,
       primaryKey: true,
       autoIncrement: true
   },
    nombre: {
        type: Sequelize.STRING(60)
    },
    imagen: {
        type: Sequelize.STRING(60)
    },
    descripcion: {
      type: Sequelize.TEXT

    },
    email: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: {msg: 'Agrega un correo valido'}
        },
        unique:{
            args: true,
            msg: 'Usuario ya registrado'
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacio'
            }
        }
    },
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: Sequelize.STRING,
    expiraToken: Sequelize.DATE

}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hashPassword(usuario.password)
        }
    }
});

//Metodo para comparar los password
Usuarios.prototype.validarPassword = function(password){
    return bcrypt.compareSync(password, this.password)
};


Usuarios.prototype.hashPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
};

module.exports = Usuarios;

// const Usuarios = db.define('usuarios',{
//     id:{
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     nombre: Sequelize.STRING(60),
//     imagen: Sequelize.STRING(60),
//     email:{
//         type: Sequelize.STRING(30),
//         allowNull: false,
//         validate:{
//             isEmail: {msg: 'Agrega un correo valido'}//validando el correo
//         },
//         unique: {
//             args: true,
//             msg: 'Usuario ya registrado'  //en caso de que quieran registrarse con el mismo email
//         }
//     },
//     password: {
//         type: Sequelize.STRING(60),
//         allowNull: false,
//         validate: {
//             notEmpty:{
//                 msg: 'El password no puede ir vacio'
//             }
//         }
//     },
//     activo: {
//         type: Sequelize.INTEGER,//para activar la cuenta o verificar que el correo este activo
//         defaultValue: 0     //cada usuario que se genera va a tener el cero que es inactivo
//     },
//     tokenPassword: Sequelize.STRING,
//     expiraToken: Sequelize.DATE
// }, {
//     hooks: {
//         beforeCreate(usuario){
//             //antes de que se genere el registro el password va hacer modificado y se va ha hashear con bcrypt
//             usuario = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10), null)
//         }
//     }
// });
//
// //METODO PARA COMPARAR LOS PASSWORD
// Usuarios.prototype.validarPassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };

// module.exports = Usuarios;