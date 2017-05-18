var wifiManager = require('../../lib/WifiManager');
var hb = require('handlebars');
var fs = require('fs');
const path = require('path');

var subApp = function(){
  this.staticFolder = "assets";

  this.setup = function(router, express){

    router.get('/', function(req, res) {
      fs.readFile(path.join(__dirname, './index.html'), 'utf-8', function(error, source){
        var template = hb.compile(source);
        res.send(template())
      });
    });

    router.get('/accesspoints', function(req, res) {
      wifiManager.listAccessPoints(function(err, list){
        res.json({accesspoints: list});
      });
    });

    router.get('/status', function(req, res) {
      wifiManager.getStatus(function(err, status){
        if(!err){
          res.json(status);
        }else{
          res.sendStatus(500);
        }
      });
    });

    router.post('/configure', function(req, res) {
      if(req.body && req.body.ssid && req.body.password){
        wifiManager.joinAccessPoint(req.body.ssid, req.body.password, (err) => {
          if(!err){
            res.json(200);
          }else{
            res.status(500).send(err);
          }
        });
      }else{
        res.sendStatus(500);
      }
    });

  }
  return this;
}

module.exports = subApp();

