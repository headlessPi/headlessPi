var fs = require('fs');

var HostapdConf = function(){
  var baseConfig = {
    interface: 'uap0',
    hw_mode: 'g',
    macaddr_acl: 0,
    auth_algs: 1,
    ignore_broadcast_ssid: 0,
    wpa: 2,
    wpa_key_mgmt: 'WPA-PSK',
    wpa_pairwise: 'TKIP',
    rsn_pairwise: 'CCMP'
  };
  var settable = [];

  this.read = function(cb){
    var output = {};
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('/etc/hostapd/hostapd.conf')
    });

    lineReader.on('line', (line) => {
      var l = line.split('=');
      output[l[0]] = l[1];
    });
    lineReader.on('close', () => {
      cb(output);
    });
  }

  this.write = function(conf, cb){
    var commands = [];
    Object.getOwnPropertyNames(conf).forEach((key) => {
      conf[key] = baseConfig[key];
    });
    Object.getOwnPropertyNames(conf).forEach((key) => {
      commands.push(key + '=' + options[key]);
    });
    fs.writeFile('/etc/hostapd/hostapd.conf', commands.join('\n'), (err) => {
      cb(err);
    });
  }

  return this;
}

module.exports = new HostapdConf();
