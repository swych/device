var request = require('request');
var uuid = require('uuid');
setInterval(function(){
    request('http://api.swych.io/?device&uuid='+uuid.v1());
},2000);