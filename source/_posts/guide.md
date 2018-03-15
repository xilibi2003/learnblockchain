---
title: 区块链技术学习指引
date: 2018-01-11 15:03:36
categories: 目录
tags:
    - 如何学习
    - 目录
author: Tiny熊
---

原本这篇文章是在我的[wiki](https://wiki.learnblockchain.cn/)里，发现好多同学还是找不到，那就重新发一下。本文会一直更新，建议感兴趣的同学加入收藏夹。

<!-- more -->
## 引言
给迷失在如何学习区块链技术的同学一个指引，区块链技术是随比特币诞生，因此要搞明白区块链技术，应该先了解下比特币。
但区块链技术不单应用于比特币，还有非常多的现实应用场景，想做区块链应用开发，可进一步阅读以太坊系列。


## 比特币
如果你是还不知比特币是什么，那就看看[比特币是什么](https://learnblockchain.cn/2017/10/23/whatisbitcoin/)
### 基础入门
接下来可以通过下面这几篇文章了解比特币大概的运行原理：
* [区块链记账原理](https://learnblockchain.cn/2017/10/25/whatbc/) 
   通过这篇可以了解到区块链是一个怎样的结构
* [比特币所有权及隐私问题](https://learnblockchain.cn/2017/11/02/bitcoin-own/)
   通过这篇可以了解到地址私钥 非对称加密应用 等概念
* [比特币如何挖矿](https://learnblockchain.cn/2017/11/04/bitcoin-pow/)
   通过这篇了解工作量证明
* [比特币如何达成共识 - 最长链的选择](https://learnblockchain.cn/2017/12/07/bitcoin-sonsensus/)
   通过这篇可以了解共识机制。
### 补充阅读
* [什么是拜占庭将军问题](https://learnblockchain.cn/2018/02/05/bitcoin-byzantine/)

### 进阶
在基础入门之后，可以进一步阅读以下几篇，理解分布式网络，交易验证。
* [分析比特币网络：一种去中心化、点对点的网络架构](https://learnblockchain.cn/2017/11/07/bitcoin-p2p/)
* [比特币区块结构 Merkle 树及简单支付验证分析](https://learnblockchain.cn/2017/11/10/bitcoin-script/)
* [比特币脚本及交易分析 - 智能合约雏形](https://xiaozhuanlan.com/topic/1402935768)

看完上面这些，区块链应该理解差不多了，就可以尝试实现一个简单的区块链了。参考这篇[用Python从零开始创建区块链](https://learnblockchain.cn/2017/10/27/build_blockchain_by_python/)。

## 以太坊
一个技术要落地还得靠应用， 以太坊就这样一个建立在区块链技术之上， 去中心化的应用平台。可以阅读几下几篇，这部分以开发为主，需要大家多发时间实践。

* [以太坊开发入门](https://learnblockchain.cn/2017/11/20/whatiseth/)
* [智能合约开发环境搭建及Hello World合约](https://learnblockchain.cn/2017/11/24/init-env/)
* [以太坊客户端Geth命令用法-参数详解](https://learnblockchain.cn/2017/11/29/geth_cmd_options)
* [Geth控制台使用实战及Web3.js使用](https://learnblockchain.cn/2017/12/01/geth_cmd_short/)

### 智能合约及应用开发
* [一步步教你开发、部署第一个Dapp应用](https://learnblockchain.cn/2018/01/12/first-dapp/)
* [一步步教你创建自己的数字货币（代币）进行ICO](https://learnblockchain.cn/2018/01/12/create_token/)
* [实现一个可管理、增发、兑换、冻结等高级功能的代币](https://learnblockchain.cn/2018/01/27/create_token2/)
* [如何通过以太坊智能合约来进行众筹（ICO）](https://learnblockchain.cn/2018/02/28/ico-crowdsale/)

### Solidity语言教程
Solidity语言是开发智能合约最广泛的语言，本专栏应该是国内最深度介绍Solidity的文章了。
* [Solidity 教程系列1 - 类型介绍](https://learnblockchain.cn/2017/12/05/solidity1/)
* [Solidity 教程系列2 - 地址类型介绍](https://learnblockchain.cn/2017/12/12/solidity2/)
* [Solidity 教程系列3 - 函数类型介绍](https://learnblockchain.cn/2017/12/12/solidity_func/)
* [Solidity 教程系列4 - 数据存储位置分析](https://learnblockchain.cn/2017/12/21/solidity_reftype_datalocation/)
* [Solidity 教程系列5 - 数组介绍](https://learnblockchain.cn/2017/12/21/solidity-arrays/)
* [Solidity 教程系列6 - 结构体与映射](https://learnblockchain.cn/2017/12/27/solidity-structs/)
* [Solidity 教程系列7 - 以太单位及时间单位](https://learnblockchain.cn/2018/02/02/solidity-unit/)

## 说明

知识星球[《深入浅出区块链》](https://t.xiaomiquan.com/RfAu7uj)及微信技术交流群, 主要用来提供一个学习的问答及交流平台，问答交流内容不限于博客文章。
目前定价149，有需要加入的同学请加微信：xlbxiong

微信不提供免费解答服务（实在没有那么多的精力），不愿付费的请勿加微信，感谢理解。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。