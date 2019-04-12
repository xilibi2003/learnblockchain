# 深入浅出区块链博客

**警告**：本库将不在更新，已迁移到[深入浅出区块链团队](https://github.com/lbc-team)号

[深入浅出区块链](http://learnblockchain.cn)是由一群区块链技术爱好者共同维护的一个秉承去中心化精神的区块链技术博客。

博客最初由Tiny熊发起，后[HiBlock区块链社区](https://hiblock.one)、[登链学院-区块链技术培训学院](https://upchain.ke.qq.com/?tuin=bd898bbf) 等其他的组织及个人加入贡献内容。
经过一年多的发展已经是国内内容质量最高、访问量最大的区块链技术博客站。

深入浅出区块链建站依赖一直秉承开放、协作、透明、链接、分享的价值观，致力于分享高质量的内容给开发者，帮助开发者成长。

我们也诚邀各位开发者（技术布道者）来贡献内容，做为作者，你将获得：
1. 收获区块链技术博客第一站作者的荣耀，和一群最优秀的人一起交流;
2. 享有[HiBlock区块链社区](https://hiblock.one)数千开发者社区资源;
3. 免费学习[登链学院](https://upchain.ke.qq.com/?tuin=bd898bbf)所有课程。


## 如何贡献

真的很简单，不要有压力。

博客是由Hexo生成，因此写文章的时候，只要编写Markdown文件就好，博客源文件也都托管在Github，因此写好之后提交Pull Request 就好。

步骤如下：
1. 先把博客站git clone 到本地，命令如下：

```
git clone git@github.com:xilibi2003/learnblockchain.git
```

2. 使用npm install 安装一下依赖

3. 我们的默认分支是blog 分支， 因此我们需要在blog分支上切分出自己的分支，命令如下：

```
git checkout blog -b my-blog
```

> 备注： master 分支是Hexo 编译生成的HTML文件, 由而文章源文件Markdown文件在blog 分支

4. 现在就可以开始在 `source/_posts` 下新建一个md文件写文章了，写好之后提交Pull Request。

5. 以下是可选，当然也建议安装下Hexo，上次Hexo 命令行来新建文件及预览文章，安装Hexo命令如下：


> npm install hexo-cli -g


6. 安装完成后，在刚才步骤2 的目录及分支下，使用hexo 命令创建一篇文章， 如创建一个文件名为：abc.md （实际写文章时名字最好是内容主题的英文单词组合）的文章，命令如下：


> hexo new post abc


这个命令会根据模板生成一个文件：`source/_posts/abc.md`，内容像下面：

```
    ---
    title: abc
    permalink: abc
    date: 2019-03-11 18:14:01
    categories:
    tags:
    author:
    ---
```
有几项内容需要根据实际情况修改，title 是文章的标题，categories是文章的分类，tags是关键字标签，author是作者。
另外通常在正文前有一个用`<!-- more -->`分割的简短说明，剩下的事就是编写文章了。

7. 文章编写过程中后完成后，可以启动hexo 服务器来预览文章，命令如下：


> hexo s


启动后，在浏览器访问 http://localhost:4000 即可。


最后，如果你有什么任何问题，欢迎联系微信：xlbxiong 或 hiblocknet
