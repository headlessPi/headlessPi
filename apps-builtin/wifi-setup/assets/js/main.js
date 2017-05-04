var ui = function(){
  var getJSON = function(url, successHandler, errorHandler) {
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {
      var status;
      var data;
      // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
      if (xhr.readyState == 4) { // DONE
        status = xhr.status;
        if (status == 200) {
          data = JSON.parse(xhr.responseText);
          successHandler && successHandler(data);
        } else {
          errorHandler && errorHandler(status);
        }
      }
    };
    xhr.send();
  };

  var loadAccessPoints = function(){
    console.log("Loading Access Points");
    getJSON('accesspoints', function(res){
      var menu = '';
      for(var i=0; i<res.accesspoints.length; i++){
        menu += '<option value="' + res.accesspoints[i].name + '">' + res.accesspoints[i].name + (res.accesspoints[i].encryption ? ' &#x1f512;' : '') + '</option>';
      }
      var list = document.getElementById('apList');
      list.disabled = false;
      list.innerHTML = menu;
      console.log(res);
    });
  }

  var setupRefresh = function(){
    var refresh = document.getElementById('refresh');
    refresh.addEventListener('click', function(e){
      e.preventDefault();
      var list = document.getElementById('apList');
      list.disabled = true;
      list.innerHTML = '<option>Loading Access Points...</option>';
      loadAccessPoints();
      return false;
    })
  }
  
  var submitForm = function()
  {
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.onload = function(){ alert (xhr.responseText); }
    xhr.open (oFormElement.method, oFormElement.action, true);
    xhr.send (new FormData (oFormElement));
    return false;
  }
  
  var setupJoin = function(){
    var join = document.getElementById('join');
    join.addEventListener('click', function(e){
      e.preventDefault();
      var list = document.getElementById('apList');
      
      var xhr = new XMLHttpRequest();   // new HttpRequest instance 
      xhr.open("POST", "configure");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({ssid:list.value, password: ''}));
      
      console.log(list.value);
      return false;
    })
  }
  
  setupRefresh();
  setupJoin();
  loadAccessPoints();
}

document.addEventListener("DOMContentLoaded", ui);