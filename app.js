var deviceInterface = require('./lib/device-interface');
var WebSocketServer = require('ws').Server;
var os = require('os');
var ifaces = os.networkInterfaces();
var request = require('request');

// final workflow test

function pollPin(cb) {
    'use strict';
    var lastStatus=0;
    setInterval(function () {
        deviceInterface.status(function(err,reading){
            if(reading!= lastStatus){
                // status has been updated
                cb(err,{reading:reading});
            }
            lastStatus = reading;
        });
    }, 500);
}

function handleRequest(payload, client){
    var request = JSON.parse(payload);
    switch(request.command){
        case 'on':
            deviceInterface.on();
            break;
        case 'off':
            deviceInterface.off();
            break;
        case 'status':
        default :
            deviceInterface.status(function(err, status){
                var payload = JSON.stringify(status);
                client.send(payload);
            });
            break;
    }
}

function listen(cb){
    var wss = new WebSocketServer({ port: 8080 }),
        clients = {};

    wss.on('connection', function connection(ws) {

        var connectionId = uuid.v4();
        clients[connectionId] = ws;

        ws.on('message', function(msg){
            handleRequest(msg, ws);
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
    cb();
}

listen(function(){

    var networkInterfaces = [];
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                networkInterfaces.push(iface.address);
            } else {
                // this interface has only one ipv4 adress
                networkInterfaces.push(iface.address);
            }
        });
    });

    request({url:'http://api.swych.com/device/register',qs:{ips:networkInterfaces.join(',')}});
    setInterval(function () {
        request({url:'http://api.swych.com/device/ping',qs:{ips:networkInterfaces.join(',')}});
    }, 500);
});
