var GitHubApi = require("github");
var git = require('simple-git')('apps');
var fs = require('fs');
var child_process = require('child_process');

var github = new GitHubApi({
    debug: false,
    protocol: "https",
    host: "api.github.com",
    headers: { "user-agent": "headlessPi" },
    //Promise: require('bluebird'),
    //followRedirects: false,
    timeout: 5000
});

var AppInstaller = function(){
  var self = this;

  this.setupNewApp = function(location, cb){
    if(fs.existsSync('apps/' + location + '/manifest.json')){
      var manifest = JSON.parse(fs.readFileSync('apps/' + location + '/manifest.json'));
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
      github.repos.get({owner: m[1], repo: m[2]}, function(err, repoRes){
        if(err) return cb(err);
        github.repos.getLatestRelease({owner: m[1], repo: m[2]}, function(err, releaseRes){
          if(err) return cb(err);
          console.log(err);
          if(fs.existsSync('apps/' + m[2])) return cb(true)
          console.log("Download from " + repoRes.data.clone_url + " and checkout tag " + releaseRes.data.tag_name);
          git.clone(repoRes.data.clone_url, '_' + m[2])
             .cwd('apps/_' + m[2])
             .checkout(releaseRes.data.tag_name, () => {
                self.setupNewApp('_' + m[2], (err) => {
                  fs.renameSync('apps/_' + m[2], 'apps/' + m[2]);
                  cb();
                })
          });
        })
      })
    }
  }
}

module.exports = AppInstaller


