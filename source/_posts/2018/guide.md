---
title: 区块链技术学习指引
permalink: guide
date: 2018-01-11 15:03:36
categories: 目录
top: true
tags:
    - 如何学习
    - 目录
author: Tiny熊
---

本文为博客文章索引，小白必看。有新文章时会更新本文，建议大家加入收藏夹中，如果你觉得本站不错，欢迎你转发给朋友。

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
一个技术要落地还得靠应用， 以太坊就这样一个建立在区块链技术之上，去中心化的应用平台。可以阅读几下几篇，这部分以开发为主，需要大家多发时间实践。

* [以太坊开发入门](https://learnblockchain.cn/2017/11/20/whatiseth/)
* [智能合约开发环境搭建及Hello World合约](https://learnblockchain.cn/2017/11/24/init-env/)
* [搭建智能合约开发环境Remix IDE及使用](https://learnblockchain.cn/2018/06/07/remix-ide/)
* [以太坊客户端Geth命令用法-参数详解](https://learnblockchain.cn/2017/11/29/geth_cmd_options)
* [Geth控制台使用实战及Web3.js使用](https://learnblockchain.cn/2017/12/01/geth_cmd_short/)
* [如何搭建以太坊私有链](https://learnblockchain.cn/2018/03/18/create_private_blockchain/)

### 智能合约及应用开发
* [程序员如何切入区块链去中心化应用开发](https://learnblockchain.cn/2018/08/31/devDapp/#more)
* [一步步教你开发、部署第一个Dapp应用](https://learnblockchain.cn/2018/01/12/first-dapp/)
* [一步步教你创建自己的数字货币（代币）进行ICO](https://learnblockchain.cn/2018/01/12/create_token/)
* [实现一个可管理、增发、兑换、冻结等高级功能的代币](https://learnblockchain.cn/2018/01/27/create-token2/)
* [如何通过以太坊智能合约来进行众筹（ICO）](https://learnblockchain.cn/2018/02/28/ico-crowdsale/)
* [剖析非同质化代币ERC721--全面解析ERC721标准](https://learnblockchain.cn/2018/03/23/token-erc721/)
* [Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/)
* [Web3监听合约事件](https://learnblockchain.cn/2018/05/09/solidity-event/)

* [如何编写一个可升级的智能合约](https://learnblockchain.cn/2018/03/15/contract-upgrade/)
* [美链BEC合约漏洞技术分析](https://learnblockchain.cn/2018/04/25/bec-overflow/)

### 钱包开发系列
* [理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)
* [以太坊钱包开发系列1 - 创建钱包账号](https://learnblockchain.cn/2018/10/25/eth-web-wallet_1/)
* [以太坊钱包开发系列1 - 账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)
* [以太坊钱包开发系列2 - 展示钱包信息及发起签名交易](https://learnblockchain.cn/2018/10/26/eth-web-wallet_3/)
* [以太坊钱包开发系列3 - 发送Token(代币）](https://learnblockchain.cn/2018/10/26/eth-web-wallet_4/)


### 以太扩容

* [深入理解Plasma（一）Plasma 框架](https://learnblockchain.cn/2018/10/20/plasma-framework/)
* [深入理解Plasma（二）Plasma 细节](https://learnblockchain.cn/2018/10/24/plasma-in-detail/)
* [深入理解Plasma（三）Plasma MVP](https://learnblockchain.cn/2018/11/03/plasma-mvp/)
* [深入理解Plasma（四）Plasma Cash](https://learnblockchain.cn/2018/11/16/plasma-cash/)

### Solidity语言教程
Solidity语言是开发智能合约最广泛的语言，本专栏应该是国内最深度介绍Solidity的文章了。
当然还有一个选择是购买我的新书：[精通以太坊智能合约](http://www.upchain.pro/book.html)


* [Solidity 教程系列1 - 类型介绍](https://learnblockchain.cn/2017/12/05/solidity1/)
* [Solidity 教程系列2 - 地址类型介绍](https://learnblockchain.cn/2017/12/12/solidity2/)
* [Solidity 教程系列3 - 函数类型介绍](https://learnblockchain.cn/2017/12/12/solidity_func/)
* [Solidity 教程系列4 - 数据存储位置分析](https://learnblockchain.cn/2017/12/21/solidity_reftype_datalocation/)
* [Solidity 教程系列5 - 数组介绍](https://learnblockchain.cn/2017/12/21/solidity-arrays/)
* [Solidity 教程系列6 - 结构体与映射](https://learnblockchain.cn/2017/12/27/solidity-structs/)
* [Solidity 教程系列7 - 以太单位及时间单位](https://learnblockchain.cn/2018/02/02/solidity-unit/)
* [Solidity 教程系列8 - Solidity API](https://learnblockchain.cn/2018/03/14/solidity-api/)
* [Solidity 教程系列9 - 错误处理](https://learnblockchain.cn/2018/04/07/solidity-errorhandler/)
* [Solidity 教程系列10 - 完全理解函数修改器](https://learnblockchain.cn/2018/04/09/solidity-modify/)
* [Solidity 教程系列11 - 视图函数、虚函数讲解](https://learnblockchain.cn/2018/05/17/solidity-functions/)
* [Solidity 教程系列12 - 库的使用](https://learnblockchain.cn/2018/08/09/solidity-library/)
* [Solidity 教程系列13 - 函数调用](https://learnblockchain.cn/2018/08/09/solidity-callfun/)
* [智能合约最佳实践 之 Solidity 编码规范](https://learnblockchain.cn/2018/05/04/solidity-style-guide/)
* [如何理解以太坊ABI - 应用程序二进制接口](https://learnblockchain.cn/2018/08/09/understand-abi/)

## 柚子EOS

* [什么是EOS](https://learnblockchain.cn/2018/07/17/whatiseos/)


## 更多精彩内容

想要系统学习以太坊智能合约，可以购买的新书：[精通以太坊智能合约](http://www.upchain.pro/book.html)

首先强烈建议大家订阅[深入浅出区块链技术小专栏](https://xiaozhuanlan.com/blockchaincore)，目前仅需69元（时不时会进行涨价哦）， 部分源码和进阶内容仅在小专栏开放，订阅小专栏还有其他惊喜哦~。

我们推出了高质量的视频课程，视频课程要比文章内容更丰富，也更容易理解。欢迎关注登链学院公众号: edupchain，同时招募课程体验师还有少量名额，[了解课程及体验师详情](https://learnblockchain.cn/course)

如果在学习过程中遇到问题，欢迎来国内最专业的区块链问答及交流社区：知识星球[《深入浅出区块链》](https://t.xiaomiquan.com/RfAu7uj)，提问不限于博客文章内容。同时星友还有一个专属的微信技术交流群，目前微信群已经聚集了300多位区块链技术牛人和爱好者，形成为非常好的积极氛围。

想围观我朋友圈的，可以加我微信：xlbxiong （温馨提示：微信不提供技术问答服务，提问请到知识星球社区感谢理解）。

one more thing ：我们还承接智能合约、DAPP、公链开发等业余。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
