var glob = require('glob');
var fs = require('fs');
var child_process = require('child_process');
var path = require('path');
var apt = require('apt');

var AppManager = function(conf){
  var self = this;
  var appPaths = ['apps', 'apps-builtin'];

  var scanFolder = function(name, cb){
    var res = [];
    glob(name + '/*/headless.json',(err, items) => {
      var len = items.length;
      if(len === 0) return cb(res);
      for (var i=0; i<items.length; i++) {
        fs.readFile(items[i], function(err, data){
          var appLoc = items[i].replace('/headless.json', '');
          var appid = appLoc.replace('../apps/', '');
          return function(err, data) {
            var manifest = JSON.parse(data);
            manifest.appLoc = appLoc;
            manifest.appid = appid;
            res.push(manifest);
            if (res.length == len) cb(res);
          }
        }());
      }
    });
  }

  this.getApps = function(cb){
    scanFolder('apps-builtin', (builtinApps) => {
      scanFolder('../apps', (apps) => {
        var allApps = builtinApps.concat(apps);
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
        res.all = res.adminApps.concat(res.apps);
        cb(res);
      })
    })
  }

  this.installApp = function(app, cb){
    console.log(app);
    apt.update((err) => {
      if(err) return cb(false);
      apt.install(app, (err, package) => {
        return cb(err);
      });
    });
  }

  this.updateApp = this.installApp;

  this.removeApp = function(app, cb){
    apt.uninstall(app, (err, package) => {
      return cb(err);
    });
  }

}


module.exports = new AppManager();

