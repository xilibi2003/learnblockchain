---
title: 深入理解Plasma（一）Plasma 框架
permalink: plasma-framework
date: 2018-10-20 15:54:17
categories:
    - 以太坊
    - Plasma
tags:
    - 以太坊
    - Plasma
    - 扩容

author: 盖盖
---

这一系列文章将围绕[以太坊的二层扩容框架](https://wiki.learnblockchain.cn/ethereum/layer-2.html)，介绍其基本运行原理，具体操作细节，安全性讨论以及未来研究方向等。本篇文章作为开篇，主要目的是理解 Plasma 框架。


<!-- more -->


Plasma 作为以太坊的二层扩容框架，自从 2017 年被 Joseph Poon（Lightning Network 创始人）和 Vitalik Buterin （Ethereum 创始人）提出以来[[1]](http://plasma.io/plasma.pdf)，一直是区块链从业人员关注的焦点[[2]](https://ethresear.ch/c/plasma)。首先需要明确的是，Plasma 实质上是一套框架，而不是一个单独的项目，它为各种不同的项目实际项目提供链下（off-chain）解决方案。这也是为什么很多人对 Plasma 感到疑惑的一个重要原因，因为在缺乏实际应用场景的情况下很难将 Plasma 解释清楚。
因此，理解 Plasma 是一套框架是理解 Plasma 的关键。

## 从区块链扩容谈起

在介绍 Plasma 之前，不得不先介绍区块链扩容。我们都知道，比特币（Bitcoin）和以太坊（Ethereum）作为目前最广泛使用的区块链平台，面临的最大问题就是可扩展性（Scalability）。这里需要注意的是，区块链中的可扩展性问题并不是单独特指某个问题，而是区块链想要实现 Web3.0[[3]](https://medium.com/l4-media/making-sense-of-web-3-c1a9e74dcae) 的愿景，为亿万用户提供去中心化服务所要克服的一系列挑战。虽然以太坊号称是“世界计算机”，但这台“计算机”却是单线程的，每秒钟只能处理大约 15 条交易，与目前主流的 Visa 和 MasterCard 动辄每秒上万的吞吐量相比实在相形见绌。因此如何在保证区块链安全性的情况下，提高可扩展性是目前区块链发展亟待解决的问题之一。

目前关于区块链扩容的解决方案无外乎两个方向：一层（Layer 1）扩容和二层（Layer 2）扩容[[4]](https://blog.ethereum.org/2018/01/02/ethereum-scalability-research-development-subsidy-programs/)。一层扩容也被称为链上（on-chain）扩容，顾名思义，这类扩容方案需要更改区块链底层协议。但同时也意味着需要将区块链硬分叉。这类扩容方案就像将原来的单核 CPU 改装成多核 CPU，从而可以多线程处理计算任务，提高整个网络的吞吐量。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/layer1.jpg"  width="320" height="150" alt="Layer 1 扩容" />

目前最典型的一层扩容方案是 Vitalik 和他的研究团队提出的“Sharding（分片）”，也就是说将区块链划分成不同的部分（shards），每个部分独立处理交易。想要了解更多关于 Sharding 的信息，可以参考以太坊官方的 Wiki[[5]](https://github.com/ethereum/wiki/wiki/Sharding-FAQs)。

二层扩容也称链下（off-chain）扩容，同样非常好理解，这种扩容方案不需要修改区块链底层协议，而是通过将大量、频繁的计算工作转移到“链下”完成，并定期或在需要时将链下的计算结果提交到“链上”保证其最终性（finality）。二层扩容的核心思想是将底层区块链作为共识基础，使用智能合约或者其它手段作为链下和链上沟通的桥梁，当有欺诈行为发生时链下的用户仍然可以回到链上的某一状态。虽然将计算转移到链下会在一段时间内损失最终性，但这个代价是值得的，因为这样做不止可以极大提高区块链的灵活性和可扩展性，也极大降低了用户进行交易所需要的代价。将计算转移到链下也并不意味着完全放弃安全性，因为最终的安全性还是由底层所依赖的区块链来保证，因此二层扩容主要关注的问题就在于如何保证链上链下切换过程的安全性。这种思想最早被用在闪电网络（Lightning Network）当中作为比特币的其中一个扩容方案，并取得了很好的效果。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/layer2.jpg"  width="320" height="150" alt="Layer 2 扩容"/>

本文所要介绍的 Plasma 就属于基于以太坊二层扩容方案，类似的解决方案还有 [State Channels](https://medium.com/l4-media/generalized-state-channels-on-ethereum-de0357f5fb44) 和 [Trubit](https://truebit.io/)。这些方案虽然面向的问题有所区别，但基本思想都是将复杂的计算转移到链下进行。那么，接下来我们将进入 Plasma 的世界，一窥究竟！

## 理解 Plasma

在前文中我们已经明白 Plasma 是一种二层扩容框架，那么该如何进一步理解 Plasma 是什么？它区别于其它二层扩容方案的地方在哪呢？

Plasma 也被称为“链中链（blockchains in blockchains）”。任何人都可以在底层区块链之上创建不同的 Plasma 支持不同的业务需求，例如分布式交易所、社交网络、游戏等。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/Blockchains-of-blockchain.png"  width="600" height="230" alt="Blockchains of Blockchain" />

这里可以举一个例子来理解 Plasma。假如企鹅公司创建了一个 Plasma Chain 叫作 Game Chain。用户通过向 Game Chain 发送一些以太币换取 Token，用于购买皮肤等游戏内的增值商品。加入 Game Chain 的操作是在链上进行的，以太坊区块链将这部分资产锁定，转移到 Game Chain 上。之后每次我们购买虚拟商品的交易就会转移到链下进行，由企鹅公司记账。这种方式几乎跟我们现实生活中游戏内购的体验一样，不仅结算迅速，而且手续费低廉（相比于以太坊之上需要给矿工支付的手续费）。那么问题来了，如果企鹅公司从中作祟，修改账本，恶意占有我们的资产怎么办？这时我们就可以提交之前每次交易的凭证到以太坊区块链上，如果确实是企鹅恶意篡改了账本，那么我们不但能够成功取回自己的资产，还能获得之前企鹅公司创建 Game Chain 存入的部分或全部押金。

通过上面这个例子是不是已经明白 Plasma 大致是如何工作的了？但上面这个例子还是过于简单，只涉及用户自己和企鹅公司。下面我们使用区块链的语言对上面的例子进行解析。

首先，企鹅公司在以太坊主链之上创建了一系列智能合约作为主链和子链 Game Chain 通信的媒介。这些智能合约中不仅规定了子链中的一些基本的状态转换规则（例如如何惩罚作恶的节点），也记录了子链中的状态（子链中区块的哈希值）。之后企鹅公司可以搭建自己的子链（可以用以太坊搭建一套私链）。子链实际上是一个完全独立的区块链，可以拥有专门的矿工，使用不同于主链的共识算法，例如 PoS（Proof of Stake）等。

当子链创建完毕后，企鹅公司可以使用 ERC721 合约创建 token 作为游戏内的商品（就像 Cryptokitty）。但这里需要注意的是，所有数字资产必须在以太坊主链上创建，并通过 Plasma 子链的智能合约转移到子链中。用户也需要在主链上购买数字资产后转移到子链上。在上面这个例子中，Game Chain 的智能合约将主链上的资产锁定，之后在子链上生成等值的资产。之后用户就可以完全脱离主链，在子链上进行交易。企鹅公司在子链上扮演 operator 的角色，如果一切运行正常，子链中的矿工会正常打包区块，并在需要时由 operator 将区块的哈希值提交到主链作为子链的状态更新证明。在这个过程中，用户完全不需要和主链交互。

我们可以看到，将复杂的计算操作转移到链下确实使得整个交易过程变得简单。但没有强大的共识算法和庞大的参与者，资产在子链上是很不安全的。Plasma 给了我们一种避险机制，即使 operator 作恶，我们也能取回属于自己的资产。下图（来源自[[1]](https://plasma.io/)）简单说明了这个过程。图中，在第 4 个区块中的交易被篡改。由于 Alice 本地保存有 Plasma Chain 中所有的区块数据，因此她可以向主链提交一个含有“防伪证明（Fraud Proof）”的交易。如果证明生效，那么主链将状态从 4 号区块回滚到 3 号区块，一切恢复正常。Plasmas Chain 中的参与者也可以随时提交资产证明，返回到主链。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/Fraud-proof.png"  width="700" height="350" alt="Blockchains of Blockchain" />

到这里我们应该已经理解了，**Plasma 所要做的工作并不是保护子链的安全，而是当有安全事故发生时，保证用户可以安全地取回自己的资产，并返回到主链上。并且采用一系列经济激励的方式减少作恶情况的发生**。

下一篇文章将对 Plasma 运行过程的细节进行剖析。

## 相关资源

1. [https://plasma.io/](https://plasma.io/)
2. [https://ethresear.ch/c/plasma](https://ethresear.ch/c/plasma)
3. [https://medium.com/l4-media/making-sense-of-web-3-c1a9e74dcae](https://medium.com/l4-media/making-sense-of-web-3-c1a9e74dcae)
4. [https://blog.ethereum.org/2018/01/02/ethereum-scalability-research-development-subsidy-programs/](https://blog.ethereum.org/2018/01/02/ethereum-scalability-research-development-subsidy-programs/)
5. [https://github.com/ethereum/wiki/wiki/Sharding-FAQs](https://github.com/ethereum/wiki/wiki/Sharding-FAQs)
6. [https://medium.com/l4-media/making-sense-of-ethereums-layer-2-scaling-solutions-state-channels-plasma-and-truebit-22cb40dcc2f4](https://medium.com/l4-media/making-sense-of-ethereums-layer-2-scaling-solutions-state-channels-plasma-and-truebit-22cb40dcc2f4)
6. [https://medium.com/@argongroup/ethereum-plasma-explained-608720d3c60e](https://medium.com/@argongroup/ethereum-plasma-explained-608720d3c60e)


本文的作者是盖盖，他的微信公众号: chainlab

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


