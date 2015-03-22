/**
 * Created by tingyanglin on 3/22/15.
 */


//dependencies
var mraa = require('mraa');

//setup
var led = new mraa.Gpio(2);
led.dir(mraa.DIR_OUT);

//loop
//var state = 0; //create a variable for saving the state of the LED
//var blink = function() { state = (state==1?0:1); led.write(state); setTimeout(
//blink() //start blinking

function turnOn (){
    led.write(1);
    console.log('relate turned on');
}

function turnOff (){
    led.write(0);
    console.log('relate turned')
}

function relateStatus (cb){
    var data = led.read();
    cb(null, data);
}

module.exports = {
    on: turnOn,
    off: turnOff,
    status: relateStatus
}