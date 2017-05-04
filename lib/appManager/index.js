var glob = require('glob');
var fs = require('fs');

var appManager = function(conf){
  var self = this;
  var appPaths = ['apps', 'apps-builtin'];
  
  var scanFolder = function(name, cb){
    var res = [];
    glob(name + '/*/manifest.json',(err, items) => {
      var len = items.length;
      for (var i=0; i<items.length; i++) {
        fs.readFile(items[i], function(err, data){          
          var appLoc = items[i].replace('/manifest.json', '');
          return function(err, data) {
            var manifest = JSON.parse(data);
            manifest.appLoc = appLoc;
            res.push(manifest);
            if (res.length == len) cb(res);
          }
        }());
      }
    });
  }
  
  this.scan = function(cb){
    scanFolder('apps-builtin', (builtinApps) => {
      scanFolder('apps', (apps) => {
        var allApps = builtinApps.concat(apps)
        var res = {
          apps: allApps.filter((app) => {
            return app.category == 'app';
          }).sort((app1, app2) => {
            return app1.name > app2.name;
          }).map((app) => {
            app.location = 'apps';
            return app;
          }),
          adminApps: allApps.filter((app) => {
            return app.category == 'admin';
          }).sort((app1, app2) => {
            return app1.name > app2.name;
          }).map((app) => {
            app.location = 'adminApps';
            return app;
          })
        }
        cb(res);
      })
    })
  }
}

exports.appManager = appManager;