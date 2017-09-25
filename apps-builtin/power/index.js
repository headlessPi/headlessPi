var child_process = require('child_process');
var fs = require('fs');
var hb = require('handlebars');
const path = require('path');


var subApp = function(){
  this.setup = function(router){
    router.get('/', function(req, res) {
      fs.readFile(path.join(__dirname, './index.html'), 'utf-8', function(error, source){
        var template = hb.compile(source);
        res.send(template())
      });
    });

    router.post('/reboot', function(req, res) {
      res.sendStatus(200);
      // Delay execution because otherwise we kill the request in process
      setTimeout(() => {
        child_process.exec('reboot', (err, stdout, stderr) => {});
      }, 200);
    });

    router.post('/shutdown', function(req, res) {
      res.sendStatus(200);
      // Delay execution because otherwise we kill the request in process
      setTimeout(() => {
        child_process.exec('shutdown -h now', (err, stdout, stderr) => {});
      }, 200);
    });
  }
  this.staticFolder = 'assets';
  return this;
}

module.exports = subApp();
