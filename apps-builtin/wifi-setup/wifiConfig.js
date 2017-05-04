var iwlist = require('wireless-tools/iwlist');
var ifconfig = require('wireless-tools/ifconfig');
var iwconfig = require('wireless-tools/iwconfig');
var WPAConf = require('wpa-supplicant-conf').WPAConf;
var child_process = require('child_process');

var wifiConfig = function(){
  this.listAccessPoints = function(cb){
    iwlist.scan('wlan0', function(err, networks) {
      cb(err, networks);
    });
  }

  this.joinAccessPoint = function(ssid, password, cb){
    var wpaconf = new WPAConf('/etc/wpa_supplicant/wpa_supplicant.conf');
    wpaconf.addAndSave(ssid, password).then(() => {
      child_process.exec('wpa_cli reconfigure', (res) => {
        cb();
      });
    })
  }

  this.getStatus = function(cb){
    ifconfig.status('wlan0', function(err, ifstatus) {
      if (err) return cb(err);
      iwconfig.status('wlan0', function(err, iwstatus){
        cb(err, {ifstatus: ifstatus, iwstatus: iwstatus});
      });
    });
  }
}

exports.wifiConfig = wifiConfig;

