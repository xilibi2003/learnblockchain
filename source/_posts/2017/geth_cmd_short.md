---
title: Geth 控制台使用及 Web3.js 使用实战
permalink: geth_cmd_short
date: 2017-12-01 19:41:53
categories: 
    - 以太坊
    - geth
tags:
    - Geth使用
    - Web3.js
author: Tiny熊
---

在开发以太坊去中心化应用，免不了和以太坊进行交互，那就离不开Web3。
Geth 控制台（REPL）实现了所有的[web3 API](http://web3js.readthedocs.io/en/1.0/index.html)及[Admin API](https://github.com/ethereum/go-ethereum/wiki/Management-APIs#admin)，
使用好 Geth 就是必修课。结合[Geth命令用法](https://learnblockchain.cn/2017/11/29/geth_cmd_options/)阅读效果更佳。

<!-- more -->

## 写在前面
阅读本文之前，你需要对以太坊（区块链）有初步的了解，如果你不知道以太坊是什么，请先阅读[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)。
如果你在我的小专栏之外的地方阅读到本文，你可能只能阅读本文的节选，阅读完整全文请订阅小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)


## geth控制台初探 - 启动、退出
安装参考[智能合约开发环境搭建](https://learnblockchain.cn/2017/11/24/init-env/)
最简单启动方式如下：
```
$ geth console
```
geth控制台启动成功之后，可以看到**>**提示符。
退出输入exit

## geth 日志控制

### 重定向日志到文件
使用**geth console**启动是，会在当前的交互界面下时不时出现日志。
可以使用以下方式把日志输出到文件。
```
$ geth console 2>>geth.log
```

可以新开一个命令行终端输入以下命令查看日志：
```
$ tail -f geth.log
```

### 重定向另一个终端
也可以把日志重定向到另一个终端，先在想要看日志的终端输入：
```
$ tty
```
就可以获取到终端编号，如：/dev/ttys003
然后另一个终端使用：
```
$ geth console 2>> /dev/ttys003
```
启动geth, 这是日志就输出到另一个终端。
如果不想看到日志还可以重定向到空终端：
```
$ geth console 2>> /dev/null
```

### 日志级别控制
使用**--verbosity**可以控制日志级别，如不想看到日志还可以使用：
```
$ geth --verbosity 0 console
```

## 启动一个开发模式测试节点

```
geth --datadir /home/xxx/testNet --dev console
```
> 技巧：如果我们经常使用一个方式来启动，可以把命令存为一个bash脚本。
> ~/bin你可以放一些常用的脚本，并把~/bin加入到环境变量PATH里。


## 连接geth节点
另外一个启动geth的方法是连接到一个geth节点：
```
$ geth attach ipc:/some/custom/path
$ geth attach http://191.168.1.1:8545
$ geth attach ws://191.168.1.1:8546
```
如连接刚刚打开的开发模式节点使用：
```
geth attach ipc:testNet/geth.ipc
```

更多内容请前往区块链技术小专栏查看[全文链接](https://xiaozhuanlan.com/topic/5617843029)。

我们特意为区块链技术学习者，提供了几门课程:
* [入门视频教程](https://ke.qq.com/course/318230) - 入门的最佳选择
* [精讲以太坊智能合约开发](https://ke.qq.com/course/326528) - Solidity 语言面面俱到
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。


