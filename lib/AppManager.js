var glob = require('glob');
var fs = require('fs');
var GitHubApi = require("github");
var git = require('simple-git')('apps');
var child_process = require('child_process');
var path = require('path');

var github = new GitHubApi({
    debug: false,
    protocol: "https",
    host: "api.github.com",
    headers: { "user-agent": "headlessPi" },
    timeout: 5000
});

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
          var appid = appLoc.replace('apps/', '');
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
        cb(res);
      })
    })
  }

  this.setupNewApp = function(location, cb){
    if(fs.existsSync('apps/' + location + '/headless.json')){
      var manifest = JSON.parse(fs.readFileSync('apps/' + location + '/headless.json'));
      if(typeof manifest.installcmd !== 'undefined'){
        child_process.exec('cd apps/' + location + ' && ' + manifest.installcmd, (res) => {
          cb();
        });
      }else{
      cb();
      }
    }
  }

  this.installApp = function(url, cb){
    const regex = /^https?\:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

    var m = regex.exec(url);
    if(m && m.length == 3){
      var appid = m[1] + '__' + m[2];
      github.repos.get({owner: m[1], repo: m[2]}, function(err, repoRes){
        if(err) return cb(err);
        github.repos.getLatestRelease({owner: m[1], repo: m[2]}, function(err, releaseRes){
          if(err) return cb(err);
          if(fs.existsSync('apps/' + appid)) return cb("Already Installed")
          console.log("Download from " + repoRes.data.clone_url + " and checkout tag " + releaseRes.data.tag_name);
          git.clone(repoRes.data.clone_url, '_' + appid)
             .cwd('apps/_' + appid)
             .checkout(releaseRes.data.tag_name, () => {
                self.setupNewApp('_' + appid, (err) => {
                  fs.renameSync('apps/_' + appid, 'apps/' + appid);
                  cb();
                })
          });
        })
      })
    }
  }

  this.updateApp = function(app, cb){
    const regex = /^https?\:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/;

    git.cwd(path.join(__dirname, '../apps', app))
      .fetch()
      .getRemotes(true, (err, remotes) => {
        for(var i=0; i<remotes.length; i++){
          if(remotes[i].name === 'origin'){
            var m = regex.exec(remotes[i].refs.fetch);
            if(m && m.length == 3){
              github.repos.getLatestRelease({owner: m[1], repo: m[2]}, function(err, releaseRes){
                if(err) return cb(err);
                console.log("Latest release tag: " + releaseRes.data.tag_name);
                git.branch((err, res) => {
                  if(res.current === releaseRes.data.tag_name){
                    return cb("App is already up to date");
                  }else{
                    console.log("Updating app to " + releaseRes.data.tag_name);
                    git.fetch()
                      .checkout(releaseRes.data.tag_name, (err) => {
                        return cb();
                      });
                  }
                })
              });
            }else{
              return cb("Error fetching app information");
            }
          }
        }
      });
  }

  this.removeApp = function(app, cb){
    var appPath = path.join(__dirname, '../apps/', app);
    console.log("Removing: " + appPath);
    if(fs.existsSync(appPath)){
      child_process.exec('rm -r ' + appPath, function (err, stdout, stderr) {
        cb(err);
      });
    }
  }

}


module.exports = AppManager;

