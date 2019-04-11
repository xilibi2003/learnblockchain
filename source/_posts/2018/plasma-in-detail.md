---
title: 深入理解Plasma（二）Plasma 细节
permalink: plasma-in-detail
date: 2018-10-24 20:54:17
categories:
    - 以太坊
    - Plasma
tags:
    - 以太坊
    - Plasma
    - 扩容

author: 盖盖
---

 这一系列文章将围绕[以太坊的二层扩容框架](https://wiki.learnblockchain.cn/ethereum/layer-2.html)，介绍其基本运行原理，具体操作细节，安全性讨论以及未来研究方向等。本篇文章主要对 Plasma 一些关键操作的细节进行剖析。



<!-- more -->

在[上一篇](https://learnblockchain.cn/2018/10/20/plasma-framework/)文章中我们已经理解了什么是 Plasma 框架以及它是如何运行的，这一篇文章将对其运行过程中的一些关键部分，包括 Plasma 提交区块的过程，当有恶意行为发生时如何构建防伪证明以及如何退出 Plasma 子链等进行剖析。需要注意的是，由于 Plasma 是一套框架，因此本文只剖析 Plasma 项目的共性，每一部分的实现细则还是需要参考实际的项目，例如 Plasma MVP（Minimal-Viable-Plasma）和 Plasma Cash 等。

## 存款（Deposit）
Plasma 的主要思想就是将大部分计算过程都转移到链下进行，用户只有在进入和退出 Plasma Chain 的时候需要跟主链上的智能合约交互，这也是所有 Plasma 应用的标准流程。

用户在将主链的资产（如以太币或者其它 ERC20 合约发布的 token）转移到 Plasma Chain 的过程称为存款（Deposit），具体做法是直接向主链上的 Plasma 合约发送以太币或 token。Plasma 合约收到 Deposit 交易后会在子链上创建跟 Deposit 数额一致的交易，并将其打包进区块中，作为存款确认的证明。这个过程如下图所示（来源自[[1]](https://plasma.io/)）。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/Deposit.png"  width="400" height="360" alt="Blockchains of Blockchain" />

当用户看到子链上自己之前存款的交易被确认后，就可以在子链上使用这笔资产（给子链上的其他用户发送交易或者退出子链等）。

## 状态确认（State Commitment）

当大部分都转移到链下进行时，需要某种机制确保链下状态的更新得到确认，这样才能保证当有恶意行为发生时，主链可以保证用户不会受到损失。这就是为什么需要状态确认（State Commitment），即子链周期性地将状态更新情况提交到主链进行共识。

然而，将子链中的所有交易都同步到主链显然违反了 Plasma 的初衷，在 Plasma 中，实际向主链提交的是 Merkle Tree 的根哈希。因此子链中的实际交易情况被隐藏，在主链上只能看到子链区块的哈希值。

当有恶意行为发生时，子链网络中的所有用户都可以向主链提交防伪证明，证明成立后，含有恶意交易的区块将被回滚。

## 防伪证明（Fraud Proof）

Plasma 的一个关键设计之一就是允许用户构造防伪证明（Fraud Proof）。防伪证明的意义在于只要发布区块的节点构造了含有恶意交易的区块，那么就要承担被惩罚的风险。每当新的区块被提交到主链上时，会留出一段时间给用户提交防伪证明，如果在这段时间内没有证明被提交，则认为新的区块被验证合法。如果有防伪证明检测到区块中存在恶意交易，则该区块将被舍弃，回滚到上一个被验证合法的区块。Plasma 中的防伪证明主要有以下（但不限于）几种：

* 资产可花费证明
* 交易签名有效性证明
* 存取款证明

至于每种防伪证明的具体形式，则依赖于实际 Plasma 应用的实现细则。

如下图所示（来源自[[1]](https://plasma.io/)），子链中每个节点都存有 1-4 个区块的数据。假设区块 1-3 已经被验证合法，而区块 4 中存在恶意交易，那么每个节点都可以使用 1-4 个区块中的数据构造防伪证明提交到主链，主链验证后将子链中的状态回滚到区块 1-3。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/fraud-proofs.png"  width="700" height="200" alt="Blockchains of Blockchain" />

防伪证明还可以使用零知识证明（zk-SNARKs 或者 STARKs）来构造，但由于目前通过零知识证明生成证明的时间和空间还有待优化，目前设计的 Plasma 并不依赖零知识证明。零知识证明在 Plasma 中的应用是一个很有前景的研究方向，感兴趣的读者可以参考以太坊研究团队关于这方面的研究[[2]](https://ethresear.ch/t/plasma-is-plasma/2195))。

## 取款（Withdrawal）

取款（Withdrawal），顾名思义，就是从子链中的资产取回到主链上，因此取款也被称为退出（Exit）。取款操作可以说是 Plasma 框架中最重要的一步，因为它确保用户可以安全地将子链上的资产转移到主链上。之前的存款以及状态确认步骤已经产生了一些交易数据，并在主链上得到同步，用户可以利用这些数据构造资产证明，之后执行简单取款（Simple Withdrawal）操作退出子链。当有扣留（Withholding）攻击发生（即子链上的矿工恶意扣留区块，意图双花攻击等）时，用户可能无法成功获取数据构造资产证明，这时需要执行批量取款（Mass Withdrawal）操作退出子链。

需要注意的是，当子链中有取款操作发生时，跟这个取款操作相关的账号或者交易都将被禁止。

### 简单取款（Simple Withdrawal）

执行简单取款的条件是所要取回的资产已经在主链和子链上确认。

一个简单取款的执行主要有以下几个步骤：

* 向主链上的 Plasma 智能合约发送已签名的取款交易。取款的数额可以包含多个输出（UTXO模型），但所有输出必须在同一个子链当中，而且每个输出的余额必须全部取出，不能只取出一部分。取款数额的一部分还需要被当作押金，作为恶意行为的惩罚。
* 当取款请求发送后，需要等待一段“争议期（Challenge Period）”，这期间其它节点可以构造证据证明该取款中的部分或全部数额已经被花费。如果争议期内有节点提供证明成功，那么取款被取消，而且押金被扣除。
* 接下来可能还要等待一段时间，直到所有区块高度较低的取款操作都完成。这是为了保证所有取款操作按照“先来后到”的顺序执行。
* 当争议期结束后，如果没有争议被提出，则认为取款操作成立，取款者将子链资产成功取回到主链。

### 快速取款（Fast Withdrawal）

快速取款（Fast Withdrawal）跟简单取款相比的差别主要是引入一个中间人，白皮书上称为 Liquidity Provider，这里简称为 LP。如果一个用户不想等待很长的争议期（目前的实现至少要一周），那么它可以选择从 LP 这里直接取款，只需要消耗一个交易确认的时间，代价是需要支付给 LP 一定的费用。由于 Plasma 白皮书上关于快速取款的描述太过晦涩，这里主要参考 kfichter 提出的 Simple Fast Withdrawal[[3]](https://ethresear.ch/t/simple-fast-withdrawals/2128) 来介绍快速取款是如何实现的。

为了实现快速取款，取款方和 LP 可以利用一个流动合约（liquidity contract）。假设取款方是 Alice，她想要执行快速取款将 10 以太币从子链转移到主链。她首先向流动合约发送 10 以太币，注意这里的交易是在子链上进行的。当这个交易被子链打包成区块后，Alice 可以调用合约中的某个退出函数，这时 Alice 将获取一个代表她这笔资产的 token。Bob 作为 LP，他检查了子链上数据之后证明 Alice 的取款没有问题之后愿意以 9 以太币的价格购买这个 token。Alice 将 token 卖给 Bob，获得了 9 以太币，Bob 赚取了 1 以太币。

需要注意的是，实现快速取款的前提条件是没有拜占庭行为发生，即没有扣留区块攻击发生，因为 LP 需要验证取款方的交易历史。

### 批量取款（Mass Withdrawal）

当子链中有拜占庭行为（例如，区块扣留攻击）发生时，将会影响以后生成防伪证明，因此网络中的每个用户都有责任快速退出子链。虽然批量取款（Mass Withdrawal）操作不是必要选择，但当大量用户执行取款时很可能会造成主链拥塞，也会消耗更多的 gas，因此批量取款是当子链受到攻击时更好的选择。

批量取款操作由于所采用的模型（UTXO 模型或者账户模型）不同会有较大的差别，而且目前关于批量取款的操作细节也正在研讨当中，因此这里只对批量取款做简单介绍，想要了解目前研究状态可以参考[[4]](https://ethresear.ch/t/basic-mass-exits-for-plasma-mvp/3316)。

当子链中有拜占庭行为发生时，用户之间可以共同协作执行批量取款。这时会有一个节点扮演取款处理人（Exit Processor）的角色，简称为 EP，负责当前某个批量操作（可以同时有多个批量取款操作发生，但同一个取款申请不能存在于多个批量取款），并且可以收取服务费作为报酬。EP 将构造一个位图（bitmap，即一串0/1）记录哪些资产要执行取款。之后 EP 将利用现有的区块数据检查每个取款是否合法，之后将构造一个批量退出初始化交易（Mass Exit Initiation Transaction，MEIT），并将其发送到主链上。在 MEIT 被主链确认之前，每个用户都可以对这个交易提出异议。当争议期结束，MEIT 被主链确认，批量取款成功。

## 总结

本文主要对 Plasma 框架中一些关键操作进行了比较详细的介绍，但如果不依托于某个实际的 Plasma 项目，对一些细节还是很难理解。因此在后面的文章中将会介绍 Plasma MVP 以及 Plasma Cash。

## 相关资源

1. [https://plasma.io/](https://plasma.io/)
2. [https://ethresear.ch/t/plasma-is-plasma/2195](https://ethresear.ch/t/plasma-is-plasma/2195)
3. [https://ethresear.ch/t/simple-fast-withdrawals/2128](https://ethresear.ch/t/simple-fast-withdrawals/2128)
4. [https://ethresear.ch/t/basic-mass-exits-for-plasma-mvp/3316](https://ethresear.ch/t/basic-mass-exits-for-plasma-mvp/3316)


本文的作者是盖盖，他的微信公众号: chainlab

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

