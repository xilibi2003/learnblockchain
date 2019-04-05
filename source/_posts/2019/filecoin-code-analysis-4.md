---
title: filecoin技术架构分析四：filecoin源码顶层架构分析
permalink: filecoin-code-analysis-4
date: 2019-02-28 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---


我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第四章filecoin源码顶层架构分析。


<!-- more -->

## 题外话——关于竞争力<a name="题外话关于竞争力"></a>

> 网络技术的高速发展带领我们进入了知识大爆炸、技术快速跃迁的时代，5G已经开始走向商业落地，网络速率的再次跃迁给我们带来了无限的想象空间，全息投影、即时翻译、远程医疗、人工智能等等会更加成熟落地？路由器在个人家庭中的角色可能会发生变化？IOT万物互联的时代将会真正到来？区块链的TPS提升？高速网络下的云应用、大数据会出现什么新的玩法？

>笔者想说的是，整个世界都在急速变化，在波涛汹涌的竞争浪潮之中，如何保持自己的竞争力。我偶尔会问同事、朋友，你与刚毕业的大学生相比，优势在哪里？

笔者认为如下两点才是在这个高速时代的真正竞争力，个人如此，公司团队亦如此。

- 高效的学习能力
- 高维的思维能力


以上为笔者观点，也欢迎大家探讨。在分析具体架构之前，笔者在4.2.1中分享自己的分析思路，我认为这也许也值得分享。



##  filecoin源码顶层架构概览及分析思路<a name="filecoin源码顶层架构概览及分析思路"></a>
### 分析思路<a name="分析思路"></a>

- 终于进入到源码分析环节了，其实回顾一下前面三章，filecoin的概念及通用语言可以总结为filecoin的本质，分析源码的过程归根接底还是理解设计者的意图，第三章filecoin开发网络的实战使用对于笔者来说也是为了更清晰地对filecoin本质及设计意图进行深入理解。

- 分析总思路为：抓住本质分析，理解设计者意图

  - 自上而下逐层分析，从抽象到具体
  - 自下而上反向总结，从具体到抽象

- 分析过程分为三大步骤

  - 第一步，理解filecoin本质及设计目的（前面三章）
  - 第二步，理解filecoin的顶层架构设计（本章），反向加深对filecoin本质的理解
  - 第三步，各层的具体源码分析（后面章节），反向加深对filecoin本质的理解

> 详细参见下图


![](https://img.learnblockchain.cn/2019/filecoin_arch.png!wl)

- 在顶层源码中分为go-filecon和rust-fil-proofs。分别为主框架和存储证明部分，本文主要分析go-filecoin源码的顶层框架。





### filecoin顶层架构概览<a name="filecoin顶层架构概览"></a>
#### 架构图

```
           ┌─────────────────────────────────────┐
           │                                     │
  Network  │  network (gossipsub, bitswap, etc.) │                 | | \/
           │                                     │                 |_| /\
           └─────▲────────────▲────────────▲─────┘
                 │            │            │           ┌────────────────────────────┐
           ┌─────▼────┐ ┌─────▼─────┐ ┌────▼─────┐     │                            │
           │          │ │           │ │          │     │    Commands / REST API     │
Protocols  │ Storage  │ │  Mining   │ │Retrieval │     │                            │
           │ Protocol │ │ Protocol  │ │ Protocol │     └────────────────────────────┘
           │          │ │           │ │          │                    │
           └──────────┘ └───────────┘ └──────────┘                    │
                 │            │             │                         │
                 └──────────┬─┴─────────────┴───────────┐             │
                            ▼                           ▼             ▼
           ┌────────────────────────────────┐ ┌───────────────────┬─────────────────┐
 Internal  │            Core API            │ │     Porcelain     │     Plumbing    │
      API  │                                │ ├───────────────────┘                 │
           └────────────────────────────────┘ └─────────────────────────────────────┘
                            │                                    │
                  ┌─────────┴────┬──────────────┬──────────────┬─┴────────────┐
                  ▼              ▼              ▼              ▼              ▼
           ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
           │            │ │            │ │            │ │            │ │            │
     Core  │  Message   │ │   Chain    │ │ Processor  │ │   Block    │ │   Wallet   │
           │    Pool    │ │   Store    │ │            │ │  Service   │ │            │
           │            │ │            │ │            │ │            │ │            │
           └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```



- 官方给出的如上架构概览图是小于实际源码的，但是不影响理解。
- 官方的spec项目中，有较多文档说明已经滞后于源码，其引用的源码有些已经从go-filecoin源码中消失了，想深入分析的朋友建议可以结合源码和文档同步进行看。
- 本文后面的章节中，只会简述各个层的设计目的，每一层的具体源码分析，将放到后面章节分享给大家。





#### IPFS与filecoin在技术架构层面的关系

![](https://img.learnblockchain.cn/2019/ipfsandfilecoin.png!wl)

- IPFS与filecoin同样采用IPLD结构，数据结构是互通的，简而言之，在IPFS之上存储的数据，filecoin可以读取。filecoin存储的未密封数据，IPFS也是可以读取的。
- IPFS与filecoin网络部分均复用libp2p部分。
- filecoin复用了大量IPFS组件，比如CID、IPLD、bitswap等等。





##  网络层<a name="网络层"></a>

- 网络层的实现依赖协议实验室的libp2p项目，如果不熟悉的可以先简单记住如下要点，后面笔者考虑视情况补充IPFS/libp2p的相关分享。
  - libp2p的网络层实现了节点之间的联通性问题，包括节点发现、NAT穿透、pubsub、relay等。

  - libp2p的路由层的主要目的，包括节点路由、内容路由、DHT键值存储。

  - multistream需要理解，filecoin的协议层之协议定义就是基于mulitistream的。

- filecoin网络层的目的

  - 处理请求信息、回复响应信息，包括存储订单处理、检索请求处理、区块同步等等。





## 协议层<a name="协议层"></a>

协议层主要处理应用级的逻辑，状态切换等，具体会通过api层调用具体的core服务进行处理。


### hello握手协议
- 协议名称： /fil/hello/1.0.0
- 目的：
	- 本节点上线，向其他节点发起hello握手请求，进而进行区块同步。
	- 响应其他新上线的节点hello握手请求，触发其进行区块同步。



### 存储协议
#### 存储矿工

- 协议名称：/fil/storage/mk/1.0.0、 /fil/storage/qry/1.0.0
- 目的：
	- 接受客户发起的订单交易请求、查询订单请求，会提交对应处理状态到区块链上（包括清单处理成功或失败；密封成功或者失败等等）。
	- 更新本地的密封或者订单状态。



#### 存储客户

- 采用上述的/fil/storage/mk/1.0.0、 /fil/storage/qry/1.0.0协议，建立multistream，向矿工发起交易或者查询交易状态。



### 检索协议

#### 检索矿工
- 协议名称：/fil/retrieval/free/0.0.0
- 目的：

  - 接受客户的检索请求，并响应处理

  - 注意：目前仅仅支持free检索，白皮书所描述的完整检索功能尚未实现。


#### 检索客户

- 采用上述的/fil/retrieval/free/0.0.0协议，建立multistream，向矿工发起检索请求。


### 心跳协议

- 协议名称：fil/heartbeat/1.0.0
- 目的：
  - 启动之后向指定节点发起心跳。
  - 如前面3.2.1章节中的设置Nick Name，以及激活极点，都属于心跳协议实现的。



## REST/CMD<a name="restcmd"></a>

- 这个应该不用多解释，提供ｃｍｄ或者ＲＥＳＴ接口供用户操作具体节点。第三章中的开发网络使用基本都是使用的CMD方式。



##  内部api层<a name="内部api层"></a>
###  node对象
- filecoin的node节点是一个上帝对象，从下面Node的结构可以看出，基本贯穿了filecoin的整个业务。

- 为了解决耦合性问题，尤其是后续轻节点的实现，官方已经开始将原有的api包，往plumbing包以及porcelain包迁移，这样做的目的是让系统具备更好的解耦性，以满足更灵活的需求。

-  plumbing和 porcelain模式也是借鉴git的思维。


```
▼+Node : struct
    [fields]
   +AddNewlyMinedBlock : newBlockFunc
   +BlockSub : ps.Subscription
   +Blockstore : bstore.Blockstore
   +Bootstrapper : *filnet.Bootstrapper
   +ChainReader : chain.ReadStore
   +Consensus : consensus.Protocol
   +Exchange : exchange.Interface
   +HeaviestTipSetCh : chan interface{}
   +HeaviestTipSetHandled : func()
   +HelloSvc : *hello.Handler
   +MessageSub : ps.Subscription
   +MiningScheduler : mining.Scheduler
   +MsgPool : *core.MessagePool
   +OfflineMode : bool
   +OnlineStore : *hamt.CborIpldStore
   +PeerHost : host.Host
   +Ping : *ping.PingService
   +PorcelainAPI : *porcelain.API
   +PowerTable : consensus.PowerTableView
   +Repo : repo.Repo
   +RetrievalClient : *retrieval.Client
   +RetrievalMiner : *retrieval.Miner
   +Router : routing.IpfsRouting
   +StorageMiner : *storage.Miner
   +StorageMinerClient : *storage.Client
   +Syncer : chain.Syncer
   +Wallet : *wallet.Wallet
   -blockTime : time.Duration
   -blockservice : bserv.BlockService
   -cancelMining : context.CancelFunc
   -cancelSubscriptionsCtx : context.CancelFunc
   -cborStore : *hamt.CborIpldStore
   -host : host.Host
   -lookup : lookup.PeerLookupService
   -mining
   -miningCtx : context.Context
   -miningDoneWg : *sync.WaitGroup
   -sectorBuilder : sectorbuilder.SectorBuilder
    [methods]
   +BlockHeight() : *types.BlockHeight, error
   +BlockService() : bserv.BlockService
   +CborStore() : *hamt.CborIpldStore
   +ChainReadStore() : chain.ReadStore
   +CreateMiner(ctx context.Context, accountAddr address.Address, gasPrice types.AttoFIL, gasLimit types.GasUnits, pledge uint64, pid libp2ppeer.ID, collateral *types.AttoFIL) : *address.Address, error
   +GetBlockTime() : time.Duration
   +Host() : host.Host
   +Lookup() : lookup.PeerLookupService
   +MiningSignerAddress() : address.Address
   +MiningTimes() : time.Duration, time.Duration
   +NewAddress() : address.Address, error
   +SectorBuilder() : sectorbuilder.SectorBuilder
   +SetBlockTime(blockTime time.Duration)
   +Start(ctx context.Context) : error
   +StartMining(ctx context.Context) : error
   +Stop(ctx context.Context)
   +StopMining(ctx context.Context)
   -addNewlyMinedBlock(ctx context.Context, b *types.Block)
   -cancelSubscriptions()
   -getLastUsedSectorID(ctx context.Context, minerAddr address.Address) : uint64, error
   -getMinerActorPubKey() : []byte, error
   -handleNewHeaviestTipSet(ctx context.Context, head types.TipSet)
   -handleNewMiningOutput(miningOutCh chan mining.Output)
   -handleSubscription(ctx context.Context, f pubSubProcessorFunc, fname string, s ps.Subscription, sname string)
   -isMining() : bool
   -miningAddress() : address.Address, error
   -miningOwnerAddress(ctx context.Context, miningAddr address.Address) : address.Address, error
   -saveMinerConfig(minerAddr address.Address, signerAddr address.Address) : error
   -setIsMining(isMining bool)
   -setupMining(ctx context.Context) : error
    [functions]
   +New(ctx context.Context, opts ...ConfigOpt) : *Node, error
```



###  api包
- 这基本上是早期实现的api接口，对应4.2.2.1中的Core API，严重依赖于Node，耦合性大。现在在逐步迁移。感兴趣可以参照如下源码逐层深入去看。

```
package: api
location: api/api.go

type API interface {
    Actor() Actor
    Address() Address
    Client() Client
    Daemon() Daemon
    Dag() Dag
    ID() ID
    Log() Log
    Miner() Miner
    Mining() Mining
    Paych() Paych
    Ping() Ping
    RetrievalClient() RetrievalClient
    Swarm() Swarm
    Version() Version
}
```



### plumbing和porcelain包

- plumbing api简而言之，是实现底层的公共api，其不依赖于Node的实现。
- 而porcelain api则是在plumbing api之上，更偏应用级的调用，同样不依赖于Node实现。

```
源码分别参见go-filecoin目录下，./plumbing和./porcelain。
```


## core服务层<a name="core服务层"></a>

> 关于核心业务调度以及业务持久化的底层处理基本都在这一层，包含但不限于如下服务。

### Message pool

> 消息池主要保存还未上链的消息。

### Chain store

> 链存储主要持久化链信息，注意同步区块的逻辑是在协议层的hello协议所出发的。

### Processor

> 处理事务消息如何驱动状态转换。

###  Block service

> 负责IPLD数据的内容寻址，包括区块链等。

### Wallet

> 钱包管理。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
