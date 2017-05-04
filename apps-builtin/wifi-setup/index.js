var subApp = function(){
  this.setup = function(router, express){
    router.get('/accesspoints', function(req, res) {
      setTimeout(function(){
        res.json({accesspoints: [
          {
            name: 'ap-one',
            encryption: false,
          },
          {
            name: 'ap-two',
            encryption: 'WPA2',
          }
        ]});
      }, 500)
    });
    router.post('/configure', function(req, res) {
      console.log(req.body);
      res.sendStatus(200);
    });
    this.staticFolder = "assets";
  }
  return this;
}

module.exports = subApp();
