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

var channel;

//Pasar los nombres de jugadores conocidos (La Elite) de json a una array
function fillKnownPlayers() {
    for (i in known.elite) {
        knownPlayers.push(known.elite[i].name);
    }
}

//Refresca el json de la url y lo mete en arrays
function refreshJSON() {
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

//Codigo ejecuta cuando el bot se logea
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Matando Minis`);
    channel = client.channels.find(ch => ch.name === 'bot');
    fillKnownPlayers();
    //channel.send("Estoy Activo!");
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
                if(knownPlayers.indexOf(players[i]) > -1){
                    nomDur += "```css\n"+"Nombre: " + players[i] + "\tDuracion: " + duration[i] + "\n```";
                }else{
                nomDur += "```\n"+"Nombre: " + players[i] + "\tDuracion: " + duration[i] + "\n```";
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