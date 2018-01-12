var express = require('express');
var bodyParser = require("body-parser");
var hb = require('handlebars');
var fs = require('fs');
var forever = require('forever-monitor');
var WifiManager = require('./WifiManager');
const path = require('path');

var hbCache = {};

hb.registerHelper('toJSON', function(object){
	return new hb.SafeString(JSON.stringify(object));
});

hb.registerPartial('master', fs.readFileSync('templates/master.html', 'utf8'));
hb.registerPartial('admin', fs.readFileSync('templates/admin.html', 'utf8'));

var hbTemplate = function(path, cb){
  //if(typeof hbCache[path] !== 'undefined'){
  //  cb(hbCache[path]);
  //}else{
    fs.readFile(path, 'utf-8', function(error, source){
      var template = hb.compile(source);
      //hbCache[path] = template;
      cb(template)
    });
  //}
}

var Server = function(conf){
  var self = this;
  this.children = [];

  this.setupStaticApps = function(){
    for(app in this.allApps){
      if(this.allApps[app].type == 'static'){
        this.httpd.use("/a/" + this.allApps[app].path , express.static(this.allApps[app].appLoc));
      }
    }
  }

  this.setupJSApps = function(){
    for(app in this.allApps){
      if(this.allApps[app].type == 'js'){
        var router = express.Router();
        var subApp = require('../' + this.allApps[app].appLoc + '/' + this.allApps[app].entry);
        subApp.setup(router, express);
        if(subApp.staticFolder){
           this.httpd.use("/a/" + this.allApps[app].path, express.static(this.allApps[app].appLoc + '/' + subApp.staticFolder));
        }
        this.httpd.use("/a/" + this.allApps[app].path, router);
      }
    }
  }

  this.setupStandaloneApps = function(){
    for(app in this.allApps){
      if(this.allApps[app].type == 'standalone'){
        var appCwd = path.join(__dirname, '..', this.allApps[app].appLoc);
        var child = new (forever.Monitor)(this.allApps[app].runcmd.split(' '), {cwd: appCwd, silent: false});
        this.children.push(child);
        child.on('error', function(err){
          console.log(err);
        });
        child.start();
      }
    }
  }

  this.setupIframes = function(){
    for(app in this.allApps){
      this.httpd.get('/' + this.allApps[app].path, function(){
        var appPath = self.allApps[app].path
        return function(req, res){
          hbTemplate('templates/app.html', function(template){
            res.send(template({appPath: appPath, apps: self.apps}));
          })
        }
      }());
    }
  }

  this.setupRoot = function(){
    this.httpd.get('/', function (req, res) {
      hbTemplate('templates/home.html', function(template){
        if(WifiManager.supportsWifiConfig()){
          WifiManager.getStatus((err, status) => {
            res.send(template({apps: self.apps, wifiConfig: true, connected:!!status.ifstatus.ipv4_address}));
          });
        }else{
          res.send(template({apps: self.apps, wifiConfig: false}));
        }
      })
    })
  }

  this.setupIcons = function(){
    this.httpd.get('/icons/:app.jpg', (req, res) => {
      for(var i=0; i<self.allApps.length; i++){
        if(self.allApps[i].path === req.params.app){
          return res.sendFile(path.join(__dirname, '../' + self.allApps[i].appLoc + '/icon.jpg'));
        }
      }
      res.sendStatus(404);
    });
  }

  this.updateApps = function(apps){
    this.Server.close();
    this.children.forEach((c) => {
      c.stop();
    });
    this.children = [];
    this.start(apps);
  }

  this.printRoutes = function(){
    require('express-print-routes')(this.httpd, 'routes.txt');
  }

  this.start = function(apps){
    this.httpd = express();
    this.httpd.use(bodyParser.json());
    this.httpd.use(express.static('assets'))
    this.apps = apps;
    this.allApps = this.apps.adminApps.concat(this.apps.apps);
    this.setupRoot();
    this.setupStaticApps();
    this.setupJSApps();
    this.setupStandaloneApps();
    this.setupIframes();
    this.setupIcons();
    //this.printRoutes();
    this.Server = this.httpd.listen(80, function () {
      console.log('Listening on port 80!')
    })
  }

}

module.exports = Server;

