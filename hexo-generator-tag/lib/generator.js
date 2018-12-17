'use strict';

var pagination = require('hexo-pagination');

module.exports = function(locals) {
  var config = this.config;
  var perPage = config.tag_generator.per_page;
  var paginationDir = config.pagination_dir || 'page';
  var tags = locals.tags;
  var tagDir;

  var pages = tags.reduce(function(result, tag) {
    if (!tag.length) return result;

    var posts = tag.posts.sort('-date');

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

    var data = pagination(tag.path, posts, {
      perPage: perPage,
      layout: ['tag', 'archive', 'index'],
      format: paginationDir + '/%d/',
      data: {
        tag: tag.name
      }
    });

    return result.concat(data);
  }, []);

  // generate tag index page, usually /tags/index.html
  if (config.tag_generator.enable_index_page) {
    tagDir = config.tag_dir;
    if (tagDir[tagDir.length - 1] !== '/') {
      tagDir += '/';
    }

    pages.push({
      path: tagDir,
      layout: ['tag-index', 'tag', 'archive', 'index'],
      posts: locals.posts,
      data: {
        base: tagDir,
        total: 1,
        current: 1,
        current_url: tagDir,
        posts: locals.posts,
        prev: 0,
        prev_link: '',
        next: 0,
        next_link: '',
        tags: tags
      }
    });
  }

  return pages;
};
