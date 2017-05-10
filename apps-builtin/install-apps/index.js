var AppManager = require('../../lib/AppManager');
var manager = new AppManager();


var subApp = function(){
  this.setup = function(router){
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
