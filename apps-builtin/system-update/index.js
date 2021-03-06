var manager = require('../../lib/AppManager');
var SystemUpdate = require('../../lib/SystemUpdate');
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

    router.post('/update', function(req, res) {
      var fullUpdate = !!req.query.full;
      SystemUpdate.update(fullUpdate, (err) => {
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
