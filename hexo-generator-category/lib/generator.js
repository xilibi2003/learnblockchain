'use strict';

var pagination = require('hexo-pagination');

module.exports = function(locals){
  var config = this.config;
  var perPage = config.category_generator.per_page;
  var paginationDir = config.pagination_dir || 'page';

  return locals.categories.reduce(function(result, category){
    if (!category.length) return result;

    var posts = category.posts.sort('-date');

    posts.data = posts.data.sort(function (a, b) {
      if (a.top && b.top) { // 两篇文章t都有top定义
        if (a.top == b.top) return b.date - a.date; // 若top值一样则按照文章日期降序排
        else return a.top - b.top; // 否则按照top值降序排
      }
      else if (a.top && !b.top) { // 只有一篇文章有top定义
        return -1;
      }
      else if (!a.top && b.top) {
        return 1;
      }
      else return b.date - a.date; // 都没定义按照文章日期降序排
    });

    var data = pagination(category.path, posts, {
      perPage: perPage,
      layout: ['category', 'archive', 'index'],
      format: paginationDir + '/%d/',
      data: {
        category: category.name
      }
    });

    return result.concat(data);
  }, []);
};