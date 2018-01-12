var hb = require('handlebars');
var fs = require('fs');
var appManager = require('../../lib/AppManager');
const path = require('path');

var subApp = function(){
  this.setup = function(router){
    router.get('/', function(req, res) {
      fs.readFile(path.join(__dirname, './index.html'), 'utf-8', function(error, source){
        var template = hb.compile(source);
        appManager.getApps((apps) => {
          res.send(template({apps: apps}))
        })
      });
    });

    router.post('/update/:app', (req, res) => {
      appManager.updateApp(req.params.app, (err) => {
        if(err){
          res.status(500).send(err);
        }else{
          res.sendStatus(200);
        }
      });
    })

    router.delete('/remove/:app', (req, res) => {
      appManager.removeApp(req.params.app, (err) => {
        if(err){
          res.status(500).send(err);
        }else{
          res.sendStatus(200);
        }
      });
    })
  }
  return this;
}

module.exports = subApp();
