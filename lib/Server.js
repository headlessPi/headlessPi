var express = require('express');
var bodyParser = require("body-parser");
var hb = require('handlebars');
var fs = require('fs');
var WifiManager = require('./WifiManager');
var appManager = require('./AppManager.js');
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

  this.setupStaticApps = function(){
    for(app in this.apps.all){
      if(this.apps.all[app].type == 'static'){
        this.httpd.use("/a/" + this.apps.all[app].path , express.static(this.apps.all[app].appLoc));
      }
    }
  }

  this.setupJSApps = function(){
    for(app in this.apps.all){
      if(this.apps.all[app].type == 'js'){
        var router = express.Router();
        var subApp = require('../' + this.apps.all[app].appLoc + '/' + this.apps.all[app].entry);
        subApp.setup(router, express);
        if(subApp.staticFolder){
           this.httpd.use("/a/" + this.apps.all[app].path, express.static(this.apps.all[app].appLoc + '/' + subApp.staticFolder));
        }
        this.httpd.use("/a/" + this.apps.all[app].path, router);
      }
    }
  }

  this.setupIframes = function(){
    for(app in this.apps.all){
      if(this.apps.all[app].type == 'iframe'){
        this.httpd.get('/' + this.apps.all[app].path, function(){
          var a = self.apps.all[app];
          return function(req, res){
            var appSrc = a.urlScheme + '://' + req.hostname + (a.urlPort === 80 ? "" : ":" + a.urlPort) + a.urlPath
            hbTemplate('templates/app.html', function(template){
              res.send(template({appSrc: appSrc, apps: self.apps}));
            })
          }
        }());
      }else{
        this.httpd.get('/' + this.apps.all[app].path, function(){
          var appSrc = '/a/' + self.apps.all[app].path
          return function(req, res){
            hbTemplate('templates/app.html', function(template){
              res.send(template({appSrc: appSrc, apps: self.apps}));
            })
          }
        }());
      }
    }
  }

  this.setupRoot = function(){
    this.httpd.get('/', function (req, res) {
      hbTemplate('templates/home.html', function(template){
        if(WifiManager.supportsWifiConfig()){
          WifiManager.getStatus((err, status) => {
            self.refreshAppList(()=>{
              res.send(template({apps: self.apps, wifiConfig: true, connected:!!status.ifstatus.ipv4_address}));
            });
          });
        }else{
          self.refreshAppList(()=>{
            res.send(template({apps: self.apps, wifiConfig: false}));
          });
        }
      })
    })
  }

  this.setupIcons = function(){
    this.httpd.get('/icons/:app.jpg', (req, res) => {
      for(var i=0; i<self.apps.all.length; i++){
        if(self.apps.all[i].path === req.params.app){
          return res.sendFile(path.join(__dirname, '../' + self.apps.all[i].appLoc + '/icon.jpg'));
        }
      }
      res.sendStatus(404);
    });
  }

  this.updateApps = function(){
    this.Server.close();
    this.start(apps);
  }

  this.printRoutes = function(){
    require('express-print-routes')(this.httpd, 'routes.txt');
  }

  this.refreshAppList = function(cb){
    var self = this;
    appManager.getApps(function(apps){
      self.apps = apps;
      if (cb)cb(apps);
      if(self.apps.all.length !== apps.all.length){
        this.updateApps();
      }
    })
  }

  this.start = function(){
    this.httpd = express();
    this.httpd.use(bodyParser.json());
    this.httpd.use(express.static('assets'))
    this.refreshAppList(()=>{
      this.setupRoot();
      this.setupStaticApps();
      this.setupJSApps();
      this.setupIframes();
      this.setupIcons();
      //this.printRoutes();
      this.Server = this.httpd.listen(80, function () {
        console.log('Listening on port 80!')
      })
    });
  }

}

module.exports = Server;

