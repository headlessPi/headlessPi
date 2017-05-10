var Server = require('./Server.js');
var AppManager = require('./AppManager.js');

var HeadlessPi = function(){
  var self = this;
  var httpd = new Server();
  var appManager = new AppManager();

  this.start = function(){
    appManager.getApps(function(apps){
      httpd.start(apps);
    })
  }
}

module.exports = HeadlessPi;

