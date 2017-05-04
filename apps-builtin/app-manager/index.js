var subApp = function(){
  this.setup = function(router){
    router.get('/', function(req, res) {
      res.send("root of sub App");
    });
    router.get('/foo', function(req, res) {
      res.send("foo of sub App");
    });
  }
  this.staticFolder = function(){
  
  }
  return this;
}

module.exports = subApp();