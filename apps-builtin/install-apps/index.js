var appManager = require('../../lib/AppManager');
var hb = require('handlebars');
var fs = require('fs');
const path = require('path');


var subApp = function(){
  this.setup = function(router){
   router.get('/', function(req, res) {
      fs.readFile(path.join(__dirname, './index.html'), 'utf-8', function(error, source){
        var template = hb.compile(source);
        res.send(template())
      });
    });

   router.post('/install', function(req, res) {
      appManager.installApp(req.body.pkg, (err) => {
        if(err){
          res.status(500).send(err);
        }else{
          res.sendStatus(200);
        }
      });
    });
  }
  this.staticFolder = 'assets';
  return this;
}

module.exports = subApp();
