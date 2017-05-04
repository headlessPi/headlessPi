var iwlist = require('wireless-tools/iwlist');
var wpa_supplicant = require('wireless-tools/wpa_supplicant');
var ifconfig = require('wireless-tools/ifconfig');

var wifiConfig = function(){
  this.listAccessPoints = function(cb){
    iwlist.scan('wlan0', function(err, networks) {
      cb(err, networks);
    });
  }
  this.joinAccessPoint = function(ssid, password, cb){
    var options = {
      interface: 'wlan0',
      ssid: ssid,
      passphrase: password,
      driver: 'nl80211,wext'
    };
    wpa_supplicant.disable('wlan0', (err) => {
      if(err) console.log(err);
      wpa_supplicant.enable(options, function(err) {
        if(err) console.log(err);
        cb(err);   // connected to the wireless network
      });
    });
  }
  this.getStatus = function(cb){
    ifconfig.status('eth0', function(err, status) {
      console.log(status);
      cb(status);
    });
  }
}

exports.wifiConfig = wifiConfig;

