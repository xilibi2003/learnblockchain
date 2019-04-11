---
title: Hyperledger Fabric 2.0 Alpha发布了！
permalink: Hyperledger Fabric 2.0 Alpha发布了！
un_reward: true
date: 2019-04-11 18:55:09
categories:
- Fabric
tags:
- Fabric
author: TopJohn
---

# Hyperledger Fabric 2.0 Alpha发布了！

随着近期Fabric v1.4.1 LTS的发布，Fabric项目目前工作的重点正在向1.4.1和2.0的正式版推进。v2.0.0是2019年的主要目标，重点集中在更多的新特性上，包括增强的链码生命周期管理，raft共识机制，以此来循序渐进地迁移至拜占庭容错算法，以及更强大的token支持。近期发布的2.0版本建议大家仅作为尝鲜之用，生产环境暂时不要考虑。
<!-- more -->
## Fabric chaincode lifecycle

Fabric 2.0 Alpha介绍了分布式治理链码的特性，包括在你的节点上安装链码以及在一个通道中启动链码的新流程。新的Fabric生命周期允许多组织对链码的参数达成共识，例如链码在开始和账本进行交互前的背书策略。新的模型在之前的生命周期上进行了改进：

- 多个组织必须同意链码的参数：在Fabric 1.x版本中，一个组织能够为所有其他通道成员设置链码参数（例如背书策略）。新的Fabric链码生命周期将变得更灵活，提供了中心化的信任模型（例如之前版本的生命周期模型）以及去中心化的要求足够多的组织同意才能生效的模型。

- 更安全的链码升级过程：在之前的链码生命周期中，升级链码可以由单个组织进行发布，从而尚未安装新链码的通道成员将可能产生风险。新的模型要求只有足够数量的组织批准后才能允许升级链码。

- 更轻松的背书策略升级：Fabric生命周期允许你在没有重新打包或者安装链码的情况下，变更背书策略。用户可以体验到默认的要求通道内大多数成员同意的策略的好处。这个策略会在通道添加或者移除组织的时候自动更新。
  
- 可检查的链码包：Fabric生命周期将链码以易于阅读的tar文件的形式打包。这样可以更加轻松地检查链码代码包并协调跨多个组织安装。
  
- 使用同一个安装包启动多个链码：在之前的生命周期管理中一个通道上的链码可以使用名字和版本来指定一个安装的链码。在现在的版本中你可以使用一个链码安装包在同一个通道或者不同的通道使用不同的名字进行多次部署。

### 使用新的链码生命周期

可以使用下列教程来开始使用新的链码生命周期：

- [Chaindoce for Operators](https://hyperledger-fabric.readthedocs.io/en/latest/chaincode4noah.html)：提供了安装和定义链码所需步骤的详细概述，以及新模型可用的功能。

- [Building Your First Network](https://hyperledger-fabric.readthedocs.io/en/latest/build_network.html)：如果你想立即开始使用新的生命周期，BYFN教程已经更新为使用新的链码生命周期来安装和定义链码了。

- [Using Private Data in Fabric](https://hyperledger-fabric.readthedocs.io/en/latest/private_data_tutorial.html)：已经更新演示如何通过新的链码生命周期来使用隐私数据集合。

- [Endorsement policies](https://hyperledger-fabric.readthedocs.io/en/latest/endorsement-policies.html)：了解使用新的链码生命周期如何使用通道配置中的策略作为背书策略。

### 限制

Fabric v2.0 Alpha版本中链码生命周期尚未完成。具体来说，请注意Alpha版本中的以下限制：

- 尚不支持CouchDB索引
- 使用新生命周期定义的链码还不能通过服务发现来发现

这些限制在后期将被解决。

## FabToken

Fabric 2.0 Alpha还为用户提供了在Fabric通道上轻松将资产转化为token的功能。FabToken是一种token管理系统，它使用Unspent Transaction Output（UTXO）模型，利用Hyperledger Fabric提供的身份和成员服务基础设施来发布传输和兑换token。

- [使用FabToken](https://hyperledger-fabric.readthedocs.io/en/latest/token/FabToken.html)：这个操作指南提供了有关如何在Fabric网络上使用token的详细概述。该指南还包含有如何使用[token](https://hyperledger-fabric.readthedocs.io/en/latest/commands/token.html)CLI创建和传输token的示例。

## Alpine images

从v2.0开始，Hyperledger Fabric Docker镜像将会使用Alpine Linux操作系统，一种面向安全的轻量级的Linux发行版。这意味着Docker镜像现在将会小很多，提供更快的下载和启动时间，以及在主机系统上占用更少的磁盘空间。Alpine Linux的设计初衷是考虑到安全性，而Alpine的发行版的极简主义特性大大降低了安全漏洞的风险。

## Raft 排序服务

[Raft](https://raft.github.io/raft.pdf)是v1.4.1中引入的，它是一种基于[etcd](https://coreos.com/etcd/)的崩溃容错（CFT）排序服务。Raft遵循“领导者和追随者”模型，其中每个通道都会选举一个leader，而且它的决策会复制给追随者。和基于Kafka的排序服务相比，基于Raft的排序服务将变得更容易设置和管理，并且它的设计允许遍布全球的组织成为分散的排序服务贡献节点。

- [The Ordering Service](https://hyperledger-fabric.readthedocs.io/en/latest/orderer/ordering_service.html)：描述Fabric中排序服务的作用以及三种排序服务实现的概述：Solo、Kafka和Raft。
- [Configuring and operating a Raft ordering service](https://hyperledger-fabric.readthedocs.io/en/latest/raft_configuration.html)：展示部署基于Raft的排序服务时所需注意的配置参数和注意事项。
- [Setting up an ordering node](https://hyperledger-fabric.readthedocs.io/en/latest/orderer_deploy.html)：描述部署排序服务节点的过程，与排序服务的实现无关。
- [Building Your First Network](https://hyperledger-fabric.readthedocs.io/en/latest/build_network.html)：已经更新，允许使用基于Raft的排序服务来构建样本网络。

本文经TopJohn授权转自[TopJohn’s Blog](https://www.xuanzhangjiong.top/2019/04/11/Hyperledger-Fabric-2-0-Alpha%E5%8F%91%E5%B8%83%E4%BA%86%EF%BC%81/)

![AwesomeBlockchain](http://img.mochain.info/topjohn/blog/awesome_blockchain.jpg)