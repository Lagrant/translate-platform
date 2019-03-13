function URLparser(){
  this.queryString = location.search.substring(1), re = /([^&=]+)=([^&]*)/g;
  this.queryParameters = [];
  this.currentState = [];
}

//解码
URLparser.prototype.decode_url = function() {
  this.queryParameters = [];
      // Creates a map with the query string parameters
  while (m = re.exec(this.queryString)) {//exec检索是否正则匹配
      this.queryParameters.push([decodeURIComponent(m[1]), decodeURIComponent(m[2])]);
  }
  console.log(this.queryParameters);
  return this.queryParameters;
};

URLparser.prototype.update_url = function(mode,type) {

  this.queryParameters = "mode="+mode+"&id="+type;
  
  var new_url = window.location.origin+window.location.pathname+"?"+this.queryParameters;
    history.replaceState({}, "Title", new_url);

  return this.queryParameters;
};