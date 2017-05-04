var express = require('express');
var bodyParser = require("body-parser");
var httpd = express();
var hb = require('handlebars');
var fs = require('fs');

httpd.use(bodyParser.json());
httpd.use(express.static('assets'))
var hbCache = {};

hb.registerHelper('toJSON', function(object){
	return new hb.SafeString(JSON.stringify(object));
});

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

var server = function(conf){
  var self = this;
  
  this.setupStaticApps = function(){
    for(app in this.allApps){
      if(this.allApps[app].type == 'static'){
        httpd.use("/a/" + this.allApps[app].path , express.static(this.allApps[app].appLoc));
      }
    }
  }
  
  this.setupJSApps = function(){
    for(app in this.allApps){
      if(this.allApps[app].type == 'js'){
        var router = express.Router();
        var subApp = require('../../' + this.allApps[app].appLoc + '/' + this.allApps[app].entry);
        subApp.setup(router, express);
        if(subApp.staticFolder){
           httpd.use("/a/" + this.allApps[app].path, express.static(this.allApps[app].appLoc + '/' + subApp.staticFolder));
        }
        httpd.use("/a/" + this.allApps[app].path, router);
      }
    }
  }
  
  this.setupIframes = function(){
    for(app in this.allApps){
      httpd.get('/' + this.allApps[app].path, function(){
        var appPath = self.allApps[app].path
        return function(req, res){
          hbTemplate('templates/app.html', function(template){
            res.send(template({appPath: appPath, apps: self.apps}))
          })
        }
      }());
    }
  }
  
  this.setup = function(){
    httpd.get('/', function (req, res) {
      hbTemplate('templates/index.html', function(template){
        res.send(template({apps: self.apps}))
      })
    })
  }
  /*
  this.setupWildcard = function(){
    httpd.get('/*', function (req, res) {
      for(app in this.allApps){
        if(this.allApps[app].path == req.originalUrl.split('/')[1]){
          // It's a match for an app
        }
      }
      res.send("Wildcard")
    })
  }
  */
  
  this.start = function(apps){
    this.apps = apps;
    //console.log(apps);
    this.allApps = this.apps.apps.concat(this.apps.adminApps);
    this.setupStaticApps();
    this.setupJSApps();
    this.setupIframes();
    //this.setupWildcard();
    httpd.listen(3000, function () {
      console.log('Listening on port 3000!')
    })  
  }

  this.setup();
}

exports.server = server;