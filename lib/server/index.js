var express = require('express');
var bodyParser = require("body-parser");
var hb = require('handlebars');
var fs = require('fs');

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
        this.httpd.use("/a/" + this.allApps[app].path , express.static(this.allApps[app].appLoc));
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
           this.httpd.use("/a/" + this.allApps[app].path, express.static(this.allApps[app].appLoc + '/' + subApp.staticFolder));
        }
        this.httpd.use("/a/" + this.allApps[app].path, router);
      }
    }
  }

  this.setupIframes = function(){
    for(app in this.allApps){
      this.httpd.get('/' + this.allApps[app].path, function(){
        var appPath = self.allApps[app].path
        return function(req, res){
          hbTemplate('templates/app.html', function(template){
            res.send(template({appPath: appPath, apps: self.apps}))
          })
        }
      }());
    }
  }

  this.setupRoot = function(){
    this.httpd.get('/', function (req, res) {
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
  this.updateApps = function(apps){
    this.server.close();
    this.start(apps);
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
    this.setupIframes();
    //this.setupWildcard();
    this.server = this.httpd.listen(3000, function () {
      console.log('Listening on port 3000!')
    })
  }

}

exports.server = server;

