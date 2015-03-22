var mraa = require("mraa");
var WebSocketServer = require('ws').Server;
var uuid = require('uuid');
var myAnalogPin = new mraa.Aio(0);

// final workflow test

function pollPin(cb) {
    'use strict';
    setInterval(function () {
        var a = myAnalogPin.read();
        cb(null, {reading:a});
    }, 4000);
}

function listen(){
    var wss = new WebSocketServer({ port: 80 }),
        clients = {};

    wss.on('connection', function connection(ws) {

        var connectionId = uuid.v4();
        clients[connectionId] = ws;

        ws.on('message', function incoming(message) {
            console.log('Message from board: %s', message);
        });

        ws.on('close', function close() {
            console.log('disconnected');
            delete clients[connectionId];
        });

    });

    pollPin(function(err, reading){
        var payload = JSON.stringify(reading);
        Object.keys(clients).forEach(function(id){
            var ws = clients[id];
            ws.send(payload);
        });
    })
}

listen();