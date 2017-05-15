var iwlist = require('wireless-tools/iwlist');
var ifconfig = require('wireless-tools/ifconfig');
var iwconfig = require('wireless-tools/iwconfig');
var wpa_cli = require('wireless-tools/wpa_cli');
var WPAConf = require('wpa-supplicant-conf').WPAConf;
var child_process = require('child_process');
var HostapdConf = require('./HostapdConf');

var WifiManager = function(){
  var self = this;

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

  this.checkHostapdChannel = function(frequency){
    // Check the network state
    wpa_cli.status('wlan0', function(err, status) {
      if(status.wpa_state === 'COMPLETED'){
        // Get the current config
        HostapdConf.read((conf) => {
          // Make sure the channel matches
          var channel = (status.frequency - 2407)/5;
          if(channel !== Number(conf.channel)){
            // Change the channel
            console.log("Changing channel");
            conf.channel = channel;
            HostapdConf.write(conf, (err) => {
              if(!err){
                // Restart the network on the new channel
                ifconfig.down(conf.interface, (err) => {
                  ifconfig.up(conf.interface, (err) => {
                    if(!err){
                      console.log("AP Network Restarted");
                    }
                  });
                });
              }
            });
          }
        });
      }
    });
    if(frequency){
      setInterval(function(){ self.checkHostapdChannel() }, frequency);
    }
  }
}

module.exports = new WifiManager();
