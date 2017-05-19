var ifconfig = require('wireless-tools/ifconfig');
var os = require('os');
var http = require('http');

var Discovery = function(){
  var self = this;

  var discovery_host = 'discovery.headlesspi.org';

  self.getIPs= function(cb){
    ifconfig.status((err, res) => {
      var addr = {'eth0':{}, 'wlan0': {}};
      for(var i=0; i< res.length; i++){
        if(res[i].interface === 'eth0' || res[i].interface === 'wlan0'){
          addr[res[i].interface] = {ip: res[i].ipv4_address, mac: res[i].address}
        }
      }
      cb(addr);
    });
  }

  self.sendDiscovery = function(){
    self.getIPs((ips) => {
      var id = (ips['eth0'].mac || ips['wlan0'].mac).replace(/:/g, '-');
      var ip = ips['eth0'].ip || ips['wlan0'].ip
      var name = os.hostname();

      var post_options = {
        host: discovery_host,
        port: '80',
        path: '/?address=' + ip + '&id=' + id + '&name=' + name,
        method: 'POST'
      };

      var post_req = http.request(post_options, function(res) {
        res.on('data', function () {});
      });
      post_req.on('error', (err) => {
        console.log(err);
      });

      post_req.end();
    });
  }

  self.start = function(interval){
    self.sendDiscovery();
    setInterval(function(){ self.sendDiscovery() }, interval);
  }

}

module.exports = new Discovery();

