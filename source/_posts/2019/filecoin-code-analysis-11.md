---
title: filecoin技术架构分析十一：filecoin源码分析之内部接口层api包分析
permalink: filecoin-code-analysis-11
date: 2019-03-07 17:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十一章源码分析之内部接口层api包分析。


<!-- more -->

> api包提供内部接口,供协议层、command/REST使用

> 较大程度依赖node包

##  api


###  api的接口定义

> 如下所示，包含了一系列子接口

```
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

###  api的接口实现

```
▼ package
    impl

▶ imports

// nodeAPI来实现其接口定义
▼-nodeAPI : struct
    [fields]
    // 合约
   -actor : *nodeActor
    // 地址
   -address : *nodeAddress
    // 客户端
   -client : *nodeClient
    // daemon
   -daemon : *nodeDaemon
    // dag
   -dag : *nodeDag
    // 节点ID
   -id : *nodeID
    // 日志
   -log : *nodeLog
    // 日志
   -logger : logging.EventLogger
    // 矿工
   -miner : *nodeMiner
    // 挖矿
   -mining : *nodeMining
    // 节点
   -node : *node.Node
    // 支付通道
   -paych : *nodePaych
    // ping
   -ping : *nodePing
    // 检索客户端
   -retrievalClient : *nodeRetrievalClient
    // swarm
   -swarm : *nodeSwarm
    // 版本
   -version : *nodeVersion

    [methods]
    // 如下为实现API接口
   +Actor() : api.Actor
   +Address() : api.Address
   +Client() : api.Client
   +Daemon() : api.Daemon
   +Dag() : api.Dag
   +ID() : api.ID
   +Log() : api.Log
   +Miner() : api.Miner
   +Mining() : api.Mining
   +Paych() : api.Paych
   +Ping() : api.Ping
   +RetrievalClient() : api.RetrievalClient
   +Swarm() : api.Swarm
   +Version() : api.Version

▼ functions
    // 实例化API
    // 1 获取高层API porcelainAPI 指针,miner与paych有用到
    // 2 调用各子系统的实例化函数逐一实例化
   +New(node *node.Node) : api.API
```

## actor
### actor的接口定义

```
▼ package
    api

▶ imports

▼+ActorView : struct
    [fields]
    // actor类型
   +ActorType : string
    // actor地址
   +Address : string
    // actor余额
   +Balance : *types.AttoFIL
    // actor代码-CID
   +Code : cid.Cid
    // 导出符号集合
   +Exports : ReadableExports
    // 表征actor实例的状态
   +Head : cid.Cid
    // 消息计数器，仅为account actors与外部发生交互的时候计算
   +Nonce : uint64

    // 导出符号集合
 +ReadableExports : map[string]*ReadableFunctionSignature

▼+ReadableFunctionSignature : struct
    [fields]
    // 参数
   +Params : []string
    // 返回
   +Return : []string

▼+Actor : interface
    // 目前接口只有查看功能,返回合约的具体信息
    [methods]
   +Ls(ctx context.Context) : []*ActorView, error
```
### actor的接口实现

```
▼ package
    impl

▶ imports

// 使用nodeActor来实现Actor接口
▼-nodeActor : struct
    [fields]
   -api : *nodeAPI
    [methods]
    // 调用ls方法实现查询功能
   +Ls(ctx context.Context) : []*api.ActorView, error
    [functions]
    // 实例化nodeActor，由api实现代码中调用
   -newNodeActor(api *nodeAPI) : *nodeActor

▼ functions
    // 获取合约类型
    // 1 account actor
    // 2 存储市场actor
    // 3 支付通道actor
    // 4 矿工actor
    // 4 BootstrapMiner actor
   -getActorType(actType exec.ExecutableActor) : string
    // 查询合约状态
   -ls(ctx context.Context, fcn *node.Node, actorGetter state.GetAllActorsFunc) : []*api.ActorView, error
   -makeActorView(act *actor.Actor, addr string, actType exec.ExecutableActor) : *api.ActorView
   -makeReadable(f *exec.FunctionSignature) : *api.ReadableFunctionSignature
   -presentExports(e exec.Exports) : api.ReadableExports
```

##  address
- 提供功能
    - 地址显示方法
    - 地址查找方法
    - 创建地址方法
    - 导出地址方法
    - 导入地址方法

```
▼ package
    api

▶ imports

▼+Address : interface
    [methods]
   +Addrs() : Addrs
   +Export(ctx context.Context, addrs []address.Address) : []*types.KeyInfo, error
   +Import(ctx context.Context, f files.File) : []address.Address, error

▼+Addrs : interface
    [methods]
   +Lookup(ctx context.Context, addr address.Address) : peer.ID, error
   +Ls(ctx context.Context) : []address.Address, error
   +New(ctx context.Context) : address.Address, error
```

## client
- 提供如下功能
    - 查询piece数据（DAG格式）
    - 导入数据（相当于ipfs add）
    - 列出所有订单
    - 支付
    - 发起存储交易
    - 查询存储交易

```
▼+Ask : struct
    [fields]
   +Error : error
   +Expiry : *types.BlockHeight
   +ID : uint64
   +Miner : address.Address
   +Price : *types.AttoFIL

▼+Client : interface
    [methods]
   +Cat(ctx context.Context, c cid.Cid) : uio.DagReader, error
   +ImportData(ctx context.Context, data io.Reader) : ipld.Node, error
   +ListAsks(ctx context.Context) : chan Ask, error
   +Payments(ctx context.Context, dealCid cid.Cid) : []*paymentbroker.PaymentVoucher, error
   +ProposeStorageDeal(ctx context.Context, data cid.Cid, miner address.Address, ask uint64, duration uint64, allowDuplicates bool) : *storage.DealResponse, error
   +QueryStorageDeal(ctx context.Context, prop cid.Cid) : *storage.DealResponse, error
```

##  config
- 提供功能
    - Get配置
    - Set配置

##  daemon
- 提供功能
    - 启动进程相关
    - 具体的业务启动逻辑会调用到node包


```
▼ package
    api

▶ imports

▼+DaemonInitConfig : struct
    [fields]
    // 如果配置，定期检查并密封staged扇区
   +AutoSealIntervalSeconds : uint
   +DefaultAddress : address.Address
    // 指定网络
   +DevnetNightly : bool
   +DevnetTest : bool
   +DevnetUser : bool
    // 创世文件
   +GenesisFile : string
   +PeerKeyFile : string
    // repo目录
   +RepoDir : string
    // 指定矿工
   +WithMiner : address.Address

 +DaemonInitOpt : func(*DaemonInitConfig)

▼+Daemon : interface
    [methods]
   +Init(ctx context.Context, opts ...DaemonInitOpt) : error
   +Start(ctx context.Context) : error
   +Stop(ctx context.Context) : error
```

##  dag
- 提供功能
    - dag查询功能
    - 类似ipfs block get

##  id
- 提供功能
    - ID详细信息
    - 如多地址、协议版本、导出公钥等

```
▼+IDDetails : struct
    [fields]
   +Addresses : []ma.Multiaddr
   +AgentVersion : string
   +ID : peer.ID
   +ProtocolVersion : string
   +PublicKey : []byte
    [methods]
   +MarshalJSON() : []byte, error
   +UnmarshalJSON(data []byte) : error

▼+ID : interface
    [methods]
   +Details() : *IDDetails, error

▼ functions
   -decode(idd map[string]*json.RawMessage, key string, dest interface{}) : error
```

##  log
- 提供日志功能

```
▼+Log : interface
    [methods]
   +Tail(ctx context.Context) : io.Reader
```

##  miner
- 创建矿工

```
▼+Miner : interface
    [methods]
   +Create(ctx context.Context, fromAddr address.Address, gasPrice types.AttoFIL, gasLimit types.GasUnits, pledge uint64, pid peer.ID, collateral *types.AttoFIL) : address.Address, error
```

##  mining
- 挖矿控制
    - 启动
    - 停止

```
▼+Mining : interface
    [methods]
   +Once(ctx context.Context) : *types.Block, error
   +Start(ctx context.Context) : error
   +Stop(ctx context.Context) : error
```

##  ping
- 提供ping接口

```
▼+PingResult : struct
    [fields]
   +Success : bool
   +Text : string
   +Time : time.Duration

▼+Ping : interface
    [methods]
   +Ping(ctx context.Context, pid peer.ID, count uint, delay time.Duration) : chan *PingResult, error
```

##  retrieval_client
- 提供检索接口

```
▼+RetrievalClient : interface
    [methods]
   +RetrievePiece(ctx context.Context, pieceCID cid.Cid, minerAddr address.Address) : io.ReadCloser, error
```

##  swarm 
- 提供节点连接功能
    - 显示连接节点
    - 连接节点
    - 查找节点

```
▼+SwarmConnInfo : struct
    [fields]
   +Addr : string
   +Latency : string
   +Muxer : string
   +Peer : string
   +Streams : []SwarmStreamInfo
    [methods]
   +Len() : int
   +Less(i, j int) : bool
   +Swap(i, j int)

▼+SwarmConnInfos : struct
    [fields]
   +Peers : []SwarmConnInfo
    [methods]
   +Len() : int
   +Less(i, j int) : bool
   +Swap(i, j int)

▼+SwarmConnectResult : struct
    [fields]
   +Peer : string
   +Success : bool

▼+SwarmStreamInfo : struct
    [fields]
   +Protocol : string

▼+Swarm : interface
    [methods]
   +Connect(ctx context.Context, addrs []string) : []SwarmConnectResult, error
   +FindPeer(ctx context.Context, peerID peer.ID) : peerstore.PeerInfo, error
   +Peers(ctx context.Context, verbose, latency, streams bool) : *SwarmConnInfos, error
```


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
