var Server = require('./server/index.js').server;
var AppManager = require('./appManager/index.js').appManager;

var app = function(conf){
  var self = this;
  var httpd = new Server();
  var appManager = new AppManager();
  
  this.start = function(){
    appManager.scan(function(apps){
      httpd.start(apps);
    })
  }
}

exports.headlessPi = app;