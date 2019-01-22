//Definir json como variables y inicializar todas las api
const Discord = require('discord.js');
const Ayuda = require('./commands.json');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const auth = require('./auth.json');
const known = require('./known.json');
const client = new Discord.Client();
const url = 'https://atlas.reznok.com/eu_pvp_players.json';
var xmlhttp = new XMLHttpRequest();

//Objeto json para datos del server eu pvp
var playerData;

//Arrays procesadas del json
var knownPlayers = [];
var players = [];
var duration = [];
var lastPlayers = [];
var left = [];
var joined = [];

var channel;

//Pasar los nombres de jugadores conocidos (La Elite) de json a una array
function fillKnownPlayers() {
    for (i in known.elite) {
        knownPlayers.push(known.elite[i].name);
    }
}

//Funcion por intervalos
function showServerJoinsLefts(){
    refreshJSON();
    cmpPlayers();
    var msg = "";

    if(left.length > 0){
        for(var i = 0; i < left.length; i++){
            msg += "```\n"+left[i]+" ha abandonado el server."+"\n```";        
        }
    }
    left = [];
    if(joined.length > 0){
        for(var i = 0; i < joined.length; i++){
            msg += "```\n"+joined[i]+" ha entrado al server."+"\n```";        
        }
    }
    joned = [];
}

//Compara los jugadores anteriores y los nuevos para sacar un array de joined y otro de left
function cmpPlayers() {
    for (var i = 0; i < lastPlayers.length; i++) {
        if (players.indexOf(lastPlayers[i]) == -1){
            left.push(lastPlayers[i]);
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (lastPlayers.indexOf(players[i]) == -1){
            joined.push(players[i]);
        }
    }
}

//Refresca el json de la url y lo mete en arrays
function refreshJSON() {
    if (typeof players !== 'undefined' && players.length > 0) {
        lastPlayers = players.slice();
    }
    players = [];
    duration = [];
    xmlhttp.open('GET', url, false);
    xmlhttp.send();
    for (i in playerData.grids["41"].players) {
        players.push(playerData.grids["41"].players[i].name);
        duration.push(playerData.grids["41"].players[i].duration);
    }
}

//Parse del json al objeto playerData cuando se descarga
xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        playerData = JSON.parse(this.responseText);
    }
};

//Convierte segundos a hms
function segToHms(segs) {
    var minutes = 0;
    var hours = 0;
    if (segs >= 60) {
        minutes = Math.floor(segs / 60);
        segs %= 60;
    }
    if (minutes >= 60) {
        hours = Math.floor(minutes / 60);
        minutes %= 60;
    }
    return hours + "h " + minutes + "m " + Math.round(segs) + "s";
}

//Codigo ejecuta cuando el bot se logea
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Matando Minis`);
    channel = client.channels.find(ch => ch.name === 'server-list-bot');
    fillKnownPlayers();
    channel.send("Estoy Activo!");
    setInterval(showServerJoinsLefts(),60000);
});

//Codigo ejecuta cuando se escribe un mensaje
client.on('message', msg => {
    var msgS;

    //Se hace caso a comando cuando se detecta '!' en la primera posicion del string
    if (msg.content.substring(0, 1) === '!' && msg.channel.name == 'server-list-bot') {
        msgS = msg.content.substring(1);
        if (msgS === 'list') {
            //Logear listados de jugadores
            console.log("Listando jugadores para: " + msg.member.user.tag);

            //Listar jugadores en discord por reply
            var nomDur = "\n";
            refreshJSON();
            for (i in players) {
                if (nomDur.length >= 1900) {
                    msg.reply(nomDur);
                    nomDur = "\n";
                }
                if (knownPlayers.indexOf(players[i]) > -1) {
                    nomDur += "```css\n" + "Nombre: " + players[i] + "\tDuracion: " + segToHms(duration[i]) + "\n```";
                } else {
                    nomDur += "```\n" + "Nombre: " + players[i] + "\tDuracion: " + segToHms(duration[i]) + "\n```";
                }
            }
            msg.reply(nomDur);
        }
        else if (msgS === "help") {
            console.log("Mostrando ayuda para: " + msg.member.user.tag);
            var msgAyuda = "\nCommandos disponibles\n============================\n";
            for (i in Ayuda) {
                msgAyuda += i + ": " + Ayuda[i] + "\n";
            }
            msg.reply(msgAyuda);
        }
        else if (msgS === "test") {

        }
        else {
            if (msg.member.user.id != client.user.id)
                msg.reply("Comando no reconocido, prueba el comando \'!help\'");
        }
    }
});

client.login(auth.token);