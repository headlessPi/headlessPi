WifiConfig = require('./wifiConfig').wifiConfig;
wifiConfig = new WifiConfig();

var subApp = function(){
  this.staticFolder = "assets";

  this.setup = function(router, express){

    router.get('/accesspoints', function(req, res) {
      wifiConfig.listAccessPoints(function(err, list){
        res.json({accesspoints: list});
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

