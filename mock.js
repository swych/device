/**
 * Created by tingyanglin on 3/22/15.
 */
var deviceInterface = require('./lib/device-interface');

deviceInterface.on();

setTimeout(function(){
    deviceInterface.off();
    setTimeout(function(){
        deviceInterface.on();
    }, 2000);
}, 2000);