var WifiConfig = require('./wifiConfig').wifiConfig;
var wifiConfig = new WifiConfig();
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
      wifiConfig.listAccessPoints(function(err, list){
        res.json({accesspoints: list});
      });
    });

    router.get('/status', function(req, res) {
      wifiConfig.getStatus(function(err, status){
        if(!err){
          res.json(status);
        }else{
          res.sendStatus(500);
        }
      });
    });

    router.post('/configure', function(req, res) {
      wifiConfig.joinAccessPoint(req.body.ssid, req.body.password, (err) => {
        console.log(err);
        if(!err){
          res.sendStatus(200);
        }else{
          res.sendStatus(500);
        }
      });
    });

  }
  return this;
}

module.exports = subApp();

