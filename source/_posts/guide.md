---
title: 区块链技术学习指引
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
* [一步步教你开发、部署第一个Dapp应用](https://learnblockchain.cn/2018/01/12/first-dapp/)
* [一步步教你创建自己的数字货币（代币）进行ICO](https://learnblockchain.cn/2018/01/12/create_token/)
* [实现一个可管理、增发、兑换、冻结等高级功能的代币](https://learnblockchain.cn/2018/01/27/create-token2/)
* [如何通过以太坊智能合约来进行众筹（ICO）](https://learnblockchain.cn/2018/02/28/ico-crowdsale/)
* [剖析非同质化代币ERC721--全面解析ERC721标准](https://learnblockchain.cn/2018/03/23/token-erc721/)
* [Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/)

* [如何编写一个可升级的智能合约](https://learnblockchain.cn/2018/03/15/contract-upgrade/)
* [美链BEC合约漏洞技术分析](https://learnblockchain.cn/2018/04/25/bec-overflow/)

### Solidity语言教程
Solidity语言是开发智能合约最广泛的语言，本专栏应该是国内最深度介绍Solidity的文章了。
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

* [智能合约最佳实践 之 Solidity 编码规范](https://learnblockchain.cn/2018/05/04/solidity-style-guide/)

## 柚子EOS

* [什么是EOS](https://learnblockchain.cn/2018/07/17/whatiseos/)


## 更多实惠付费内容

看文章不过过瘾的同学，还可以学习我们的视频课程，视频课程要比文章内容更丰富，也更容易理解，尤其适合初学者，同时课程的
同时现在我们还在招募课程体验师，点此[查看视频列表和了解招募详情](https://learnblockchain.cn/course/#%E5%8C%BA%E5%9D%97%E9%93%BE%E8%A7%86%E9%A2%91%E8%AF%BE%E7%A8%8B)。

另外我们还建立了一个区块链学习的问答及交流社区：知识星球[《深入浅出区块链》](https://t.xiaomiquan.com/RfAu7uj), 大家在学习过程中问题可以星球里提，提问不限于博客文章内容。同时星友还有一个专属的微信技术交流群方便大家及时沟通，目前微信群已经聚集了300多位区块链技术牛人和爱好者，形成为非常好的积极氛围。目前知识星球问答社区定价149，有需要加入的同学请加微信：xlbxiong

温馨提示：微信不提供免费技术解答服务，感谢理解。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

### 以下为广告
我和朋友一起创建了登链科技，是一家从事区块链技术服务与咨询的公司。旨在帮助企业更好的拥抱区块链。
我们提供的服务包括（不限于）：
0. 代币（Token）开发等完整的数字货币解决方案；
1. 为游戏公司提供基于区块链的道具、角色等；
2. 为公司提供基于区块链的股权激励方案；
3. 为数字产品版权登记、交易平台；
4. 各种公开透明场景下的服务，如：网络彩票发行、投票、众筹等等；
5. 区块链技术培训（企业内训）与技术咨询服务。

所有的服务均可以提供完整的解决方案：如提供面向用户的官方网站、苹果及安卓APP、微信公众号、小程序和企业内部使用的管理后台。
业务咨询，请联系：xlb@upchain.pro

另外，我们正在寻找那些热爱技术、愿意迎接挑战的小伙伴（含实习生和正式员工）。
我们会提供市场化的薪资待遇和远高于普通公司的成长机会（入职员工由我亲自带领，并且经常有技术培训）。

如果你对我们感兴趣，欢迎提交简历（千万别忘改贴上你的github地址哦）至xlb@upchain.pro。目前所有职位均位于百岛之城珠海。


