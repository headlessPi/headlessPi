var Server = require('./Server.js');
var AppManager = require('./AppManager.js');
var fs = require('fs');

var HeadlessPi = function(){
  var self = this;
  var httpd = new Server();
  var appManager = new AppManager();

  this.start = function(){
    appManager.findApps(function(apps){
      httpd.start(apps);
    })
    fs.watch('apps', (eventType, filename) => {
      console.log("Updating apps list");
      if(filename[0] === '_') return;
      appManager.findApps(function(apps){
        httpd.updateApps(apps);
      });
    })
  }
}

module.exports = HeadlessPi;

