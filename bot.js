const Discord = require('discord.js');
const Ayuda = require('./commands.json');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const auth = require('./auth.json');
const client = new Discord.Client();
const url = 'https://atlas.reznok.com/eu_pvp_players.json';
var xmlhttp = new XMLHttpRequest();
var playerData;
var players;
var channel;
var duration;

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

xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        playerData = JSON.parse(this.responseText);
    }
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Matando Minis`);
    channel = client.channels.find(ch => ch.name === 'bot');
    //channel.send("Estoy Activo!");
});

client.on('message', msg => {
    var msgS;
    if (msg.content.substring(0, 1) === '!' && msg.channel.name == 'server-list-bot') {
        msgS = msg.content.substring(1);
        if (msgS === 'list') {
            //Logear listados de jugadores
            console.log("Listando jugadores para: "+msg.member.user.tag);

            //Listar jugadores en discord
            var nomDur = "\n";
            refreshJSON();
            for (i in players) {
                if (nomDur.length >= 1900) {
                    msg.reply(nomDur);
                    nomDur = "\n";
                }
                nomDur += "Nombre: " + players[i] + "\tDuration: " + duration[i] + "\n";
            }
            msg.reply(nomDur);
        }
        else if (msgS === "help") {
            console.log("Mostrando ayuda para: "+msg.member.user.tag);
            var msgAyuda = "\nCommandos disponibles\n============================\n";
            for(i in Ayuda){
                msgAyuda += i+": "+Ayuda[i]+"\n";
            }
            msg.reply(msgAyuda);
        }
        else {
            if (msg.member.user.id != client.user.id)
                msg.reply("Comando no reconocido, prueba el comando \'!help\'");
        }
    }
});

client.login(auth.token);