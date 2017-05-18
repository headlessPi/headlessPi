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

  this.joinAccessPoint = function(ssid, password){
    var wait_for_network = function(iterations){
      wpa_cli.status('wlan0', function(err, status) {
        if(!err && status.wpa_state === 'COMPLETED'){
          console.log("Joined Network");
          self.rewriteHostapd((err) => {
            self.restartUap0();
          });
        }else{
          console.log("Waiting for network join");
          if(iterations){
            setTimeout(function(){ wait_for_network(iterations-1); }, 1000);
          }
        }
      });
    }


    var wpaconf = new WPAConf('/etc/wpa_supplicant/wpa_supplicant.conf');
    wpaconf.addAndSave(ssid, password).then(() => {
      ifconfig.down('uap0', (err) => {
        child_process.exec('ifup wlan0', (res) => {
          wait_for_network(30);
        });
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

  this.rewriteHostapd = function(cb){
    // Check the network state
    wpa_cli.status('wlan0', function(err, status) {
      if(!err && status.wpa_state === 'COMPLETED'){
        // Get the current config
        HostapdConf.read((conf) => {
          // Make sure the channel matches
          var channel = (status.frequency - 2407)/5;
          if(channel !== Number(conf.channel)){
            // Change the channel
            console.log("Changing channel");
            conf.channel = channel;
            HostapdConf.write(conf, (err) => {
              cb(err);
            });
          }else{
            cb("No Change");
          }
        });
      }
    });
  }

  this.restartUap0 = function(cb){
    // Restart the network on the new channel
    ifconfig.down('uap0', (err) => {
      if(err) console.log(err);
      ifconfig.up({interface: 'uap0', ipv4_address: '10.10.10.10', ipv4_subnet_mask: '255.255.255.0', ipv4_broadcast: '10.10.10.255'}, (err) => {
        if(err) console.log(err);
        if(!err){
          console.log("AP Network Restarted");
        }
        if(cb) cb(err);
      });
    });
  }

  this.checkHostapdChannel = function(interval){
    this.rewriteHostapd((err) => {
      if(!err) restartUap0();
    });
    if(interval){
      setInterval(function(){ self.checkHostapdChannel() }, interval);
    }
  }
}

module.exports = new WifiManager();

