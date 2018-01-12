var child_process = require('child_process');
var appManager = require('./AppManager.js');

var SystemUpdate = function(){
  this.update = function(full, cb){
    if(full){
      child_process.exec('apt-get update && apt-get -y upgrade', (err, stdout, stderr) => {
        cb(err);
      });
    }else{
      appManager.installApp('headlesspi', (err) => {
        cb(err);
      });
    }
  }
}

module.exports = new SystemUpdate()
