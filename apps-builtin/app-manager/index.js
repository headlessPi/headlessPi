var Installer = require('./installer').Installer;
var installer = new Installer();


var subApp = function(){
  this.setup = function(router){
    router.post('/manualInstall', function(req, res) {
      installer.installApp(req.body.repository, (err) => {
        res.sendStatus(err ? 500 : 200);
      });
    });
  }
  this.staticFolder = 'assets';
  return this;
}

module.exports = subApp();
