var ui = function(){

  var setupManualInstall = function(){
    var install = document.getElementById('install');
    install.addEventListener('click', function(e){
      e.preventDefault();
      var repo = document.getElementById('manual');

      var xhr = new XMLHttpRequest();   // new HttpRequest instance
      xhr.open("POST", "manualInstall");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({repository: repo.value}));

      return false;
    })
  }

  setupManualInstall();
}

document.addEventListener("DOMContentLoaded", ui);

