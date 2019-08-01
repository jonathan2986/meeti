const nodemailer = require("nodemailer");
const emailConfig = require('../config/emails');
const fs = require('fs');//nos permite acceder a los archivos y a sus contenido
const util = require('util');
const ejs = require('ejs');


let transport =  nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

//metodos que nos permiten enviar email de diferentes controladores
exports.enviarEmail = async (opciones) =>{
        console.log(opciones);

    //leer el archivo para el email
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    //compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));


    //crear el html
    const html = compilado({url: opciones.url});

    let info = await transport.sendMail({
        from: 'Meeti <noreply@meeti.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        html: html

    }).catch(err => console(err));
    console.log(info)

};

