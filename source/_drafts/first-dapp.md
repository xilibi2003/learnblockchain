---
title:  Truffle 教程 - 手把手教你开发、部署第一个Dapp 
date: 2018-01-06 22:36:39
tags:
---


[智能合约开发环境搭建及Hello World合约](https://learnblockchain.cn/2017/11/24/init-env/) 中，我们学习了写一个第一个智能合约，今天我们第一个去中心化应用（Dapps）


## 环境搭建

### 安装Node


### 安装 truffle
```
 npm install -g truffle
```

### ganache-cli
```
npm install -g ganache-cli
```

https://github.com/trufflesuite/ganache-cli

## 创建项目

http://truffleframework.com/boxes/pet-shop

```
 > truffle unbox pet-shop
 Downloading...
 Unpacking...
 Setting up...
 Unbox successful. Sweet!

Commands:

  Compile:        truffle compile
  Migrate:        truffle migrate
  Test contracts: truffle test
  Run dev server: npm run dev
```

等待一会


目录结构

/contracts 智能合约 写智能合约的文件夹，所有的智能合约文件都放置在这里
/migrations 部署（迁移）智能合约 
/test 智能合约测试用例文件夹
truffle.js 配置文件

其他部分是nodejs的配置文件以及文件夹


### 开发控制台
truffle develop



## 编写智能合约

 ```



## 参考文档

http://liyuechun.org/2017/10/13/smart-contract-voting-dapp/
http://blog.csdn.net/diandianxiyu_geek/article/details/78361621
http://truffleframework.com/boxes/pet-shop
http://truffleframework.com/tutorials/pet-shop