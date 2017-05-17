var child_process = require('child_process');

var SystemUpdate = function(){
  this.update = function(full, cb){
    child_process.exec('update-headless' + (full ? ' full' : ''), (err, stdout, stderr) => {
      cb(err);
    });
  }
}

module.exports = new SystemUpdate()
