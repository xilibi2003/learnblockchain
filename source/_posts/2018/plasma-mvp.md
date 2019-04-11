---
title: 深入理解Plasma（三）Plasma MVP
permalink: plasma-mvp
date: 2018-11-03 16:54:17
categories:
    - 以太坊
    - Plasma
tags:
    - 以太坊
    - Plasma
    - 扩容

author: 盖盖
---

这一系列文章将围绕[以太坊的二层扩容](https://wiki.learnblockchain.cn/ethereum/layer-2.html)框架 Plasma，介绍其基本运行原理，具体操作细节，安全性讨论以及未来研究方向等。本篇文章主要介绍 Plasma 的一个最小实现 Plasma MVP（Minima Viable Plasma）。

<!-- more -->

在[上一篇](https://github.com/gitferry/mastering-ethereum/blob/master/Plasma-in-depth/plasma-in-detail.md)文章中我们已经理解了 Plasma 中的一些关键操作，但是 Plasma 是一套框架，如果脱离了实际的应用，仍然很难彻底理解它。因此本篇将详细介绍 Plama 的第一个项目 Plasma MVP（Minimal Viable Plasma），即在 Plasma 框架下的最基础的实现。Plasma MVP 是 Vitalic 和他的团队在 2018 年初提出的基于 UTXO 模型实现的 Plasma 设计标准[[1]](https://ethresear.ch/t/minimal-viable-plasma/426)，它以最简单的方式实现了链下交易，但无法支持复杂的计算，例如脚本（Script）和智能合约。在阅读下面的内容之前，请确保已经理解了这个系列之前的文章。

整个 Plasma MVP 的生命周期可以通过下面这幅图表现出来：

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/plasma-mvp.jpg"  width="360" height="400" alt="Blockchains of Blockchain" />

## Plasma 合约
首先需要将 Plasma 合约部署到主链（以太坊）上作为主链和子链沟通的媒介。Plasma 合约会处理由子链提交的区块，并且将区块的哈希值存在主链上。除此之外，还会处理用户的存款（deposit）、取款（withdrawal/exit）以及争议（challenge）操作。

Plasma 合约中主要包括的数据结构有：

* Owner：合约的拥有者（即部署合约交易的发送者）的地址，即部署合约交易的发送者；
* Plasma 区块列表：每个 Plasma 区块中存储了（1）区块的 Merkle root（2）区块提交的时间；
* 退出列表：即提交了退出申请的列表，每个退出申请存储了（1）申请者的地址（2）申请退出的 UTXO 的位置。

Plasma 合约中主要包括的函数有：

* submitBlock(bytes32 root)：向主链提交一个区块，仅仅提交区块中所有交易的 Merkle root；
* deposit()：生成一个只包含一个交易的区块，这个交易中包含与 msg.value 值相等的 UTXO；
* startExit()：执行给定 UTXO 的退出操作；
* challengeExit()：向某个正在执行的退出提出争议。

## Operator
在前面的文章中我们已经知道 Plasma 子链是一个独立的区块链，那么也就有独立的共识机制。在 Plasma MVP 中采用的共识机制就是 PoA（Proof of Authority），即参与共识的只有唯一一个矿工，称为 Operator。Operator 负责处理所有子链上发生的交易，将其打包成区块存储在子链上，并且周期性地向 Plasma 合约提交区块，将子链上的状态（区块的哈希值）提交到主链共识。那么，既然 Operator 是唯一的矿工，这不就意味着 Plasma 违背了去中心化的初衷了吗？其实，这是去中心化向执行效率的妥协。在之前的文章中也提到过，Plasma 的安全基础依赖于底层的区块链，只要底层的区块链能够保证安全，那么在 Plasma 子链上发生的最差结果也只是迫使用户退出子链，而不会造成资产损失。

Operator 可以采用最简单的 REST API 方式实现，子链中的用户可以通过调用简单的 API 获取到子链中区块的数据。

## 存款（deposit）
用户 Alice 通过存款（deposit）操作向 Plasma 合约发送带有一定数额的以太币或 ERC20 token 加入 Plasma Chain，这时 Plasma 合约会执行 deposit() 函数，生成一个只包含一个交易的区块，这个交易的 UTXO 记录了 Alice 从主链转移到子链的数额。当这个区块被主链确认后，Alice 就可以使用新生成的 UTXO 向其它用户发送交易了。

## 交易（transaction）
在 Plasma MVP 中，所有用户发送的交易都是直接发送给 Operator，当积累了一定数量的交易后，由 Operator 将交易打包成区块。这里需要注意的是，由于 Plasma MVP 采用的是 UTXO 模型，所以即使交易的收款方不存在，交易也是成立的。

在子链上 Alice 向 Bob 发送一个交易的流程如下：

1. Alice 首先需要得到 Bob 在子链上的地址；
2. Alice 将一个或多个 UTXO 作为输入构造交易发送到 Bob 的地址，并对交易签名；
3. 等待该交易被打包到区块中；
4. Alice 向 Bob 发送确认消息，并且使用相同的私钥签名。

## 生成区块

在 Plasma MVP 中，一个 Plasma 区块产生的情况只有两种：一种是 Operator 打包生成区块，另外一种是当用户执行 deposit 操作时，由 Plasma 合约直接生成一个只包含一个交易的区块。

## 监视子链
为了保证子链上资产的安全，用户需要周期性地检查子链上的数据，保证没有恶意交易产生。用户需要运行一种自动化的软件（例如钱包），每隔一段时间下载子链中的区块数据，检查每个区块中的交易，如果有恶意交易产生，立即退出子链。

## 取款/退出（withdrawal/exit）
当 Alice 想要退出子链时，需要向 Plasma 合约发送一个 exit 交易，申请中需要包含（1）所要退出的 UTXO 的位置，包括区块号（blknum）、区块内交易号（txindex）以及交易内输出号（outindex）（2）包含该 UTXO 的交易（3）该交易的 Merkle proof（4）用于生成该 UTXO 所涉及的之前一系列交易的确认签名。除此之外，exit 交易中还要包含“退出押金（exit bond）”。如果这个 exit 被 challenge 成功，那么取款的操作将被取消，而且退出押金将被发送给提出 challenge 的用户。

之后这个申请会被放入一个优先队列中，通过这个公式计算优先级：

>Priority = blknum * 1000000000 + txindex * 10000 + oindex

之所以采用这种优先队列的方式处理取款顺序的原因是保证旧的 UTXO 总能优先于新的 UTXO 被取出。也就是说，当有恶意交易（例如双花等）产生时，所有在恶意交易发生之前的交易都可以被优先取出。那么如何解决在恶意交易之后被确认的交易的取款问题呢？Plasma MVP 采用了“确认签名（Confirmation Signatures）”的机制，在下一小节我们将介绍这一机制是如何工作的。

## 确认签名（Confirmation Signatures）

在 Plasma MVP 中，用户的退出顺序以所要退出的 UTXO 所在的交易的位置为准。假如 operator 作恶，在一个合法的交易之前插入一个非法的交易，那么当用户执行取款时，由于非法交易可以先被取出，因此当执行到该用户的交易时，可能 Plasma 合约中的资产已经被取空。为了解决这个问题，Plasma MVP 采用了“确认签名”机制，例如当 Alice 产生一个交易时，她首先会对交易签名。当该交易被打包入区块后，Alice 还需要对该交易进行一次签名，即“确认签名”。

引入确认签名机制后，当 Alice 发现在一个区块中自己的合法交易之前存在非法交易时，可以拒绝对自己的交易进行“确认签名”，同时申请取款。这样可以使得当前的交易失效，保证自己之前“确认签名”后的交易可以优先于非法交易之前取出。

这种确认签名机制极大地破坏了用户体验，用户每产生一个交易都要经历签名->等待确认->确认签名。而且由于确认签名也需要占据 Plasma 区块的空间，因此也降低了子链的可扩展性。为了解决这个问题，Plasma 的研究人员提出了扩展版本 More Viable Plasma 移除了确认签名的要求[[2]](https://ethresear.ch/t/more-viable-plasma/2160)。

## 争议（Challenge）
每个取款操作都会经历一个争议期。例如在 Alice 的某个 UTXO 退出子链的过程中，如果 Bob 在争议期内发现有恶意行为发生，他可以提出一个争议（challenge）。一个争议需要给出针对的 UTXO 的位置，以及该 UTXO 被花费的证明，即该 UTXO 已经存在于某个交易中，且这个交易已经被打包到区块。

合约通过调用 challengeExit() 函数执行一个争议，争议成功后会取消正在执行的取款操作，并将提交取款申请所冻结的押金发送给 Bob。

## 攻击场景

在 Plasma 子链中主要存在两种攻击场景：

1. Alice 试图忽视在子链中转移给 Bob 的资产，使用最初加入 Plasma 子链时的交易证明向主链提出取款申请。
2. Operator 生成一个恶意交易，占有其他用户的资产，并且尝试退出子链。

下面对这两个攻击场景进行分析，观察 Plasma MVP 如何保证资产的安全性：

场景1

1. Alice 使用最初加入子链时生成的交易作为证据向主链提出取款申请；
2. Bob（或者其他任意用户）拥有 Alice 申请退出的 UTXO 被花费的交易证明，并将此作为证据向主链提出一个争议；
3. 争议生效，Alice 的退出申请被驳回，同时将 Alice 申请退出的押金发送给 Bob；
4. Alice 的攻击失效。

场景2

1. Operator 创建了一个非法交易，并且将其打包生成区块之后在主链得到确认；
2. Operator 提交取款申请，打算将 Alice 的资产取走；
3. 在争议期内，Alice 发现了 Operator 的恶意行为，立即提出取款申请，退出子链；
4. 由于 Alice 的申请优先级较高，因此会在 Operator 之前退出；
5. Operator 的攻击失效。

## 相关项目

> Talk is cheap, show me your code.

目前已经有许多机构和公司已经实现了 Plasma MVP，但实现的语言和细节有所不同：

* FourthState Lab[[3]](https://github.com/fourthstate)
* Omisego[[4]](https://github.com/omisego/plasma-mvp)
* Kyokan[[5]](https://github.com/kyokan/plasma)

## 总结

本文介绍了 Plasma 的最小实现版本 Plasma MVP，虽然采用最简单的 UTXO 模型，但已经足够体现出 Plasma 的核心思想。在 Plasma MVP 中，用户资产的安全主要依赖于用户及时发现恶意行为，并退出子链。接下来的文章将会介绍另外一个稍微复杂一点的项目，Plasma Cash。

## 相关资源

1. [https://ethresear.ch/t/minimal-viable-plasma/426](https://ethresear.ch/t/minimal-viable-plasma/426)
2. [https://ethresear.ch/t/more-viable-plasma/2160](https://ethresear.ch/t/more-viable-plasma/2160)
2. [https://github.com/fourthstate](https://github.com/fourthstate)
3. [https://github.com/omisego/plasma-mvp](https://github.com/omisego/plasma-mvp)
4. [https://github.com/kyokan/plasma](https://github.com/kyokan/plasma)

本文的作者是盖盖，他的微信公众号: chainlab

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


