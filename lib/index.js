var Server = require('./server/index.js').server;
var AppManager = require('./appManager/index.js').appManager;
var fs = require('fs');

var app = function(conf){
  var self = this;
  var httpd = new Server();
  var appManager = new AppManager();

  this.start = function(){
    appManager.scan(function(apps){
      httpd.start(apps);
    })
    fs.watch('apps', (eventType, filename) => {
      console.log("Updating apps list");
      if(filename[0] === '_') return;
      appManager.scan(function(apps){
        httpd.updateApps(apps);
      });
    })
  }
}

exports.headlessPi = app;

