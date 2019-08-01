import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';
//obtener valores de la base de datos


const lat = document.querySelector('#lat').value || 18.5107;
const lng = document.querySelector('#lng').value || -69.8210;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('mapa').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;
//utilizar provider y geocoder
const geocodeService = L.esri.Geocoding.geocodeService();

//Colocar el pin en edicion
if (lat && lng) {
    //agregar el pin
    marker =  new L.marker([lat,lng],{
        //mover el pin
        draggable: true,
        //mover el pin junto con el mapa
        autoPan: true
    }).addTo(map)
        .bindPopup(direccion)
        .openPopup();

    //asignar al contenedor
    markers.addLayer(marker);

    //detectar movimiento del marker
    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng))

        //reverse geocoding, cuando el usuario reubica el pin

        geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
            //asigna los valore al popup del marker
            console.log(result);
            llenarInputs(result);
            marker.bindPopup(result.address.LongLabel);
        })
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //buscar direccion
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input',buscarDireccion);

    //menu fijo
    // Detectamos cuando el usuario desplace la pantalla
    window.onscroll = function (){
        // Obtenemos la posicion del scroll en pantall
        var scroll = document.documentElement.scrollTop || document.body.scrollTop;

        // Realizamos alguna accion cuando el scroll este entre la posicion 300 y 400
        if(scroll > 300 && scroll < 400){
            console.log("Pasaste la posicion 300 del scroll");
        }
    }

});

function buscarDireccion(e) {
    //el buscador verifica que la direccion sea de mas de 8 caracteres para ser mas exacto
    if (e.target.value.length > 8){
        //Si existe un pin anterior limpiarlo
        markers.clearLayers();


        const provider = new OpenStreetMapProvider();
        provider.search({query: e.target.value}).then((resultado) => {
            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function (error, result) {
                console.log(result);
                llenarInputs(result);

                // console.log(resultado);
                //mostrar el mapa donde lo allamos buscado
                map.setView(resultado[0].bounds[0], 15);

                //agregar el pin
                marker =  new L.marker(resultado[0].bounds[0],{
                    //mover el pin
                    draggable: true,
                    //mover el pin junto con el mapa
                    autoPan: true
                }).addTo(map)
                    .bindPopup(resultado[0].label)
                    .openPopup();

                //asignar al contenedor
                markers.addLayer(marker);

                //detectar movimiento del marker
                marker.on('moveend', function (e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng))

                    //reverse geocoding, cuando el usuario reubica el pin

                    geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
                        //asigna los valore al popup del marker
                        console.log(result);
                        llenarInputs(result);
                        marker.bindPopup(result.address.LongLabel);
                    })
                });
            })
        })
    }
}

function llenarInputs(resultado){
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#provincia').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}