var Server = require('./Server.js');
var AppManager = require('./AppManager.js');
var wifiManager = require('./WifiManager');
var discovery = require('./Discovery');

var HeadlessPi = function(){
  var self = this;
  var httpd = new Server();
  var appManager = new AppManager();

  this.start = function(){
    appManager.getApps(function(apps){
      httpd.start(apps);
    })
    wifiManager.checkHostapdChannel(30000);
    discovery.start(30000);
  }
}

module.exports = HeadlessPi;

