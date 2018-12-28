/* global hexo */

'use strict';

var assign = require('object-assign');

function init_index2_generator(generator, index) {
  return assign({
      path: typeof generator.path === 'undefined' ? '' : generator.path,
      per_page: typeof generator.per_page === 'undefined' ? 10 : hexo.config.per_page,
      order_by: '-date',
      layout: typeof generator.layout === 'undefined' ? 'index' : generator.layout,
      index: typeof index === 'undefined' ? false : Boolean(index),
  }, generator);
}

var include_index = typeof hexo.config.index2_include_index === 'undefined' ? true : Boolean(hexo.config.index2_include_index);
var index2_generators = [];
if (include_index) {
  index2_generators.push(init_index2_generator(hexo.config.index_generator || {}, true));
}
if(hexo.config.index2_generator) {
  if (Array.isArray(hexo.config.index2_generator)) {
    for (var i = 0; i < hexo.config.index2_generator.length; i++){
        index2_generators.push(init_index2_generator(hexo.config.index2_generator[i]));
    }
  } else {
    index2_generators.push(init_index2_generator(hexo.config.index2_generator));
  }
}

hexo.log.info("index2 generators:");
hexo.log.info(index2_generators);
hexo.config.index2_generators = index2_generators;

hexo.extend.generator.register('index2', require('./lib/generator2'));
hexo.extend.helper.register('is_home2', function() {
  return Boolean(this.page.__index2);
});
