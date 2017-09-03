export function ValidateUserEmail(email) {
  if (!email) {
    return false;
  }

  var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailRegex.test(email)) {
      return true;
  }
  return false;
}

export function ValidateUserPassword(password){  
  if (!password) {
    return false;
  }

  var passwordRegex = /(?=.{8,})(?=.*?[^\w\s])(?=.*?[0-9])(?=.*?[A-Z]).*?[a-z].*/;
  if (passwordRegex.test(password)) {
      return true;
  }
  return false;

}

export function ValidateRegEx(regex, text){
  if(regex.test(text)){
    return true;
  }
  return false;
}

export function getUrlParameter(name) {
    name = name.toLowerCase().replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};