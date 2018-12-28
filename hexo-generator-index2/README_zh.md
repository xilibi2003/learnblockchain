[![Build Status](https://travis-ci.org/Jamling/hexo-generator-index2.svg?branch=master)](https://travis-ci.org/Jamling/hexo-generator-index2)
[![node](https://img.shields.io/node/v/hexo-generator-index2.svg)](https://www.npmjs.com/package/hexo-generator-index2)
[![npm downloads](https://img.shields.io/npm/dt/hexo-generator-index2.svg)](https://www.npmjs.com/package/hexo-generator-index2)
[![npm version](https://img.shields.io/npm/v/hexo-generator-index2.svg)](https://www.npmjs.com/package/hexo-generator-index2)
[![GitHub release](https://img.shields.io/github/release/jamling/hexo-generator-index2.svg)](https://github.com/Jamling/hexo-generator-index2/releases/latest)

## 简介

带过滤功能的[Hexo]首页生成器插件。在官方的首页生成器基础上添加了过滤指定分类/标签的功能。比如，在首页只显示指定分类下面的文章列表。
除此之外，它还在指定的目录下生成指定类型的文章，比如在web目录下生成Web相关的文章。

[English](https://github.com/Jamling/hexo-generator-index2/blob/master/README.md)

## 安装

``` bash
$ npm install hexo-generator-index2 --save
$ npm uninstall hexo-generator-index --save
```

[hexo-generator-index2]可以完全替代官方的[hexo-generator-index]，所以安装之后，先卸载官方的插件，不然会引起一些冲突。

## 选项

``` yaml
# index2 generator是否包含官方的hexo-generator-index，默认true（包含）
index2_include_index: true # defult is true

# 配置index2 generator，可以是数组或对象
index2_generator:
  per_page: 10
  order_by: -date
  include:
    - category Web # 只包含Web分类下的文章
  exclude:
    - tag Hexo # 不包含标签为Hexo的文章

```

- **per_page**: Posts displayed per page. (0 = disable pagination)
- **order_by**: Posts order. (Order by date descending by default)
- **layout**: Set the layout, default is `index`
- **path**: Output path, if path is `''`, means output to the root directory (http://127.0.0.1:4000/ )
- **index**: Home index or not, if `true` and the `path` is `''`, same to offical [hexo-generator-index]
- **include**: Posts filter include option
- **exclude**: Posts filter exclude option

除了include和exclude，其它如<var>per_page</var>和<var>order_by</var>都是原有的官方首页生成器选项，不必更改。

Include/exclude 选项格式为`属性 值`（注意，属性与值中间有个英文的空格），可选的属性有：

- category: 文章分类
- tag: 文章标签
- path: 文章源路径


## License

MIT

[hexo-generator-index]: https://github.com/hexojs/hexo-generator-index
[hexo-generator-index2]: https://github.com/Jamling/hexo-generator-index2
[Hexo]: http://hexo.io/
