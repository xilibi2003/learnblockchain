---
title: filecoin技术架构分析八：filecoin源码分析之协议层检索协议
permalink: filecoin-code-analysis-8
date: 2019-03-05 17:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第八章filecoin源码分析之协议层检索协议。

<!-- more -->

##  协议概览图
![](https://img.learnblockchain.cn/2019/retrieval_protocol.png!wl)

- 此概览图为当前的实现，整个检索的代码还没有完善
- 目前的逻辑比较简单，需要指定矿工、内容cid即可进行免费检索

## 源码信息

- version
    - master分支 619b0eb1（2019年３月２日）
- package
    - retrieval
- location
    - protocol/retrieval

## 源码分析

###  检索矿工

```
▼ package
    retrieval

▼ imports
    github.com/filecoin-project/go-filecoin/cborutil
    github.com/filecoin-project/go-filecoin/proofs/sectorbuilder
    gx/ipfs/QmTGxDz2CjBucFzPNTiWwzQmTWdrBnzqbqrMucDYMsjuPb/go-libp2p-net
    gx/ipfs/QmZNkThpqfVXs9GNbexPrfBbXSLNYeKrE7jwFM2oqHbyqN/go-libp2p-protocol
    gx/ipfs/QmbkT7eMTyXfpeyB3ZMxxcxg7XH8t6uXp49jqzz4HB7BGF/go-log
    gx/ipfs/Qmd52WKRSwrBK5gUaJKawryZQ5by6UbNB8KVW2Zy6JtbyW/go-libp2p-host
    io/ioutil

▼ constants
    // 定义检索协议: "/fil/retrieval/free/0.0.0"
   -retrievalFreeProtocol

▼ variables
   -log

▼+Miner : struct
    [fields]
    // 矿工节点，参见minerNode 
   -node : minerNode

    [methods]
    // 执行具体的检索服务
    // 通过解析协议流数据，执行检索动作并返回
   -handleRetrievePieceForFree(s inet.Stream)

    [functions]
    // 实例化检索矿工
    // 设置处理免费检索的handle方法：handleRetrievePieceForFree
   +NewMiner(nd minerNode) : *Miner

▼-minerNode : interface
    [methods]
   +Host() : host.Host
   +SectorBuilder() : sectorbuilder.SectorBuilder
```

###  检索客户

```
▼ package
    retrieval

▶ imports

▼ constants
    // 检索内容大小限制
   +RetrievePieceChunkSize

▼+Client : struct
    [fields]
   -node : clientNode

    [methods]
    // 通过cid进行检索
    // 通过协议流，发送检索请求以及接受检索回复和数据
   +RetrievePiece(ctx context.Context, minerPeerID peer.ID, pieceCID cid.Cid) : io.ReadCloser, error

    [functions]
    // 实例化检索客户
   +NewClient(nd clientNode) : *Client

▼-clientNode : interface
    [methods]
   +Host() : host.Host
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
