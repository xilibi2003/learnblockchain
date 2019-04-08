---
title:  程序员如何切入区块链去中心化应用开发
permalink: devDapp
date: 2018-08-31 11:30:55
categories: 
    - 以太坊
    - Dapp
tags:
    - Dapp入门
    - 以太坊概念
author: Tiny熊
---

前段时间一个以太坊游戏应用：[Fomo3D](http://exitscam.me/play)异常火爆，在短短的几天内就吸引了几万的以太币投入游戏，第一轮游戏一个“黑客”用了一个非常巧妙的利用以太坊规则成为了最终赢家，拿走了1万多以太币奖金。

区块链应用的价值由这个游戏反映的淋漓尽致，Fomo3D游戏能够成功核心所依赖的是以太坊提供的一个可信、不可篡改平台。当游戏的规则确定之后，一切都按规则运行，无人可干预。今天这篇就来介绍一下程序员如何切入去中心化应用开发。

<!-- more -->

## 中心化应用

作为对比，先来看看中心化应用，其实就是现有的互联网应用，为什么它是中心化应用，看看它的架构图：
![](https://img.learnblockchain.cn/2018/capp.jpg!wl)

平时我们接触的是应用的前端（或称客户端），前端可以是HTML5的web页面、 小程序、APP， 在前端展现的内容通常发送一个请求到服务器，服务器返回相应的内容给前端。在前端的动作同样也会转化请求发送到服务器，服务器处理之后返回数据到前端。也就是说我们所有看到的内容或者操作都是中心化的服务器控制，因此说是中心化应用。


## 去中心化应用DAPP

而去中心化应用有什么不同呢？ 看看它的架构图：
![](https://img.learnblockchain.cn/2018/dapp.jpg!wl)
前端的表现上是一样的， 还是H5页面、 小程序、APP，DAPP和传统App关键是后端部分不同，是后端不再是一个中心化的服务器，而是分布式网络上任意节点，注意可以是 **任意一个节点**，在应用中给节点发送的请求通常称为 **交易**，交易和中心化下的请求有几个很大的不同是：交易的数据经过用户个人签名之后发送到节点，节点收到交易请求之后，会把 **请求广播到整个网络**，交易在网络达成共识之后，才算是真正的执行（真正其作用的执行不一是连接的后端节点，尽管后端也会执行）。以及中心化下的请求大多数都是同步的（及时拿到结果）， 而交易大多数是异步的，这也是在开发去中心应用时需要注意的地方，

从节点上获得数据状态（比如交易的结果），一般是通过事件回调来获得。

## 如何开发

在开发中心化应用最重要两部分是 **客户端UI表现**和 **后端服务程序**， UI表现通过HTTP请求连接到后端服务程序，后端服务程序运行在服务器上，比如Nginx Apached等等。

开发一个去中心化应用最重要也是两部分： **客户端UI表现**及 **智能合约**，智能合约的作用就像后端服务程序，智能合约是运行在节点的EVM上， 客户端调用智能合约，是通过向节点发起RPC请求完成。

下面是一个对比：

         客户端UI <=> 客户端UI 
            HTTP <=> RPC
      后端服务程序 <=> 智能合约
    Nginx/Apache <=> 节点

因此对于去中心化应用来说，程序员可以从两个方面切入:

一个是 **去中心化应用的客户端开发**， 熟悉已经熟悉客户端软件（如Web\APP等）开发的同学，只需要了解一下客户端跟区块链节点通信的API接口，如果是在当前应用最广泛的区块链平台以太坊上开发去中心化应用，那么需要了解Web3
这个库，Web3对节点暴露出来的JSON-RPC接口进行了封装，比如Web3提供的功能有：获取节点状态，获取账号信息，调用合约、监听合约事件等等。

目前的主流语言都有Web3的实现，列举一些实现给大家参考：
* [JavaScript Web3.js](https://github.com/ethereum/web3.js)
* [Python Web3.py](https://github.com/ethereum/web3.py)
* [Haskell hs-web3](https://github.com/airalab/hs-web3)
* [Java web3j](https://github.com/web3j/web3j)
* [Scala web3j-scala](https://github.com/mslinn/web3j-scala)
* [Purescript purescript-web3](https://github.com/f-o-a-m/purescript-web3)
* [PHP web3.php](https://github.com/sc0Vu/web3.php)
* [PHP ethereum-php](https://github.com/digitaldonkey/ethereum-php)
 
另一个切入点是 **智能合约的开发**，在以太坊现在推荐的语言是Solidity，有一些同学对新学一门语言有一些畏惧，Solidity的语法其实很简洁，有过一两门其他语言基础（开发经验）的同学三五天就可以学会。


下面用一个Hello合约，体会下Solidity的语法：

```js
contract Hello {
      function hello() public returns(string) {
           return "Hello World"; 
      }
}
```

如果把上面的contract关键字更改为class，就和其他语言定义一个类一样。

有兴趣的同学可以进一步学习一下这个DApp开发案例[Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/)，

在DAPP的开发过程中，一些开发工具可以帮助我们事半功倍，如：Truffle开发框架以及Ganache工具来模拟节点等，这篇文章[一步步教你开发、部署第一个去中心化应用](https://learnblockchain.cn/2018/01/12/first-dapp/)


另外强烈安利两门课程给大家：
1. [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。
2. [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


## 补充

对于想切入到去中心化应用开发的同学，对区块链运行的原理了解肯定会是加分项，尤其是各类共识机制（[POW](https://learnblockchain.cn/2017/11/04/bitcoin-pow/)，POS，DPOS等）的理解，P2P网络的理解，以及各类加密和Hash算法的运用。有一些同学想做区块链底层开发，对区块链运行的原理则是必须项。


欢迎来[知识星球](https://learnblockchain.cn/images/zsxq.png)提问，星球内已经聚集了300多位区块链技术爱好者。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


