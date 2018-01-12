var Server = require('./Server.js');
var wifiManager = require('./WifiManager');
var discovery = require('./Discovery');

var HeadlessPi = function(){
  var self = this;
  var httpd = new Server();

  this.start = function(){
    httpd.start();
    wifiManager.checkHostapdChannel(30000);
    discovery.start(30000);
  }
}

module.exports = HeadlessPi;

