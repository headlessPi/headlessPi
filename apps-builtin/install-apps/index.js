var AppManager = require('../../lib/AppManager');
var manager = new AppManager();
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
      manager.installApp(req.body.repository, (err) => {
        res.sendStatus(err ? 500 : 200);
      });
    });
  }
  this.staticFolder = 'assets';
  return this;
}

module.exports = subApp();
