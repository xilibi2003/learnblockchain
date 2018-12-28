'use strict';

var pagination = require('hexo-pagination');
var funcs = [];
funcs['category'] = function(post, value){
    var ret = false;
    
    post.categories.forEach(function(item, i){
      if (item.name == value){
        ret = true;return;
      }
    });
    return ret;
};

funcs['tag'] = function(post, value){
    var ret = false;
    post.tags.forEach(function(item, i){
      if (item.name == value){
        ret = true;return;
      }
    });
    return ret;
};

funcs['path'] = function(post, value){
    var ret = false;
    ret = post.source.indexOf(value) > -1;
    return ret;
};


module.exports = function(locals) {
  var config = this.config;
  var posts = locals.posts.sort(config.index_generator.order_by);
  var paginationDir = config.pagination_dir || 'page';
  var path = config.index_generator.path || '';
  
  if (config.index_generator.include || config.index_generator.exclude) {
    var util = require('util');
    var include = config.index_generator.include || [];
    var exclude = config.index_generator.exclude || [];
    if (!util.isArray(include)){
      include = [include];
    }
    if (!util.isArray(exclude)){
      exclude = [exclude];
    }
    
    posts = posts.filter(function(post){
      var ret = false;
      if (include.length > 0){
        for(var i = 0;i<include.length;i++){
          var str = include[i].split(' ');
          ret = funcs[str[0]].call(this, post, str[1]);
          if (ret){
            break;
          }
        }
      }
      if (exclude.length > 0){
        var ex = false;
        for(var i = 0;i<exclude.length;i++){
          var str = exclude[i].split(' ');
          ex = funcs[str[0]].call(this, post, str[1]);
          if (ex){
            break;
          }
        }
        ret = ret && !ex;
      }
      return ret;
    });
  }
  /*
  posts = posts.filter(function(post){
    var ret = false;
    post.categories.forEach(function(item, i){
      if (item.name == '软件技术'){
        ret = true;return;
      }
    });
    
    return ret;
  });*/
  return pagination(path, posts, {
    perPage: config.index_generator.per_page,
    layout: ['index', 'archive'],
    format: paginationDir + '/%d/',
    data: {
      __index: true
    }
  });
};