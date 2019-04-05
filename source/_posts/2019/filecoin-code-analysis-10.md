---
title: filecoin技术架构分析十：filecoin源码分析之支撑包分析(2)
permalink: filecoin-code-analysis-10
date: 2019-03-07 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十章源码分析之支撑包分析(2)。

<!-- more -->


> 本章续上一章的支撑包介绍，主要为便于后面章节的源码理解

## repo

- 提供功能
    - 实例化fs资源或者mem资源
    - 提供读取、设置API地址方法
    - 提供存储已被校验区块的方法
    - 提供阶段密封数据存储方法 
    - 提供密封完成数据存储方法 
    - 提供读取配置方法
    - 提供通用数据存储方法 
    - 提供交易数据存储方法
    - 提供钱包信息存储方法
    - 提供存储密钥方法
    - 提供快照配置存储方法
    - 提供版本号读取方法

```
▼ package
    repo

▶ imports

▼ constants
    // 当前为１，可以cat ~/.filecoin/version确认
   +Version : uint

▼+Datastore : interface
    [embedded]
    // 包含datastore的read、write、batch
   +datastore.Batching

    // Repo接口分别由fsrepo及memrepo实现
▼+Repo : interface
    [methods]
    // 读取API地址
   +APIAddr() : string, error
    // 存储已被校验过的区块数据
   +ChainDatastore() : Datastore
    // 关闭
   +Close() : error
    // 读取配置，对应上一章中的config
   +Config() : *config.Config
    // 存储通用数据
   +Datastore() : Datastore
    // 交易数据存储
   +DealsDatastore() : Datastore
    // 存储密钥相关
   +Keystore() : keystore.Keystore
    // 存储倒数第二个配置
   +ReplaceConfig(cfg *config.Config) : error
    // 存储密封扇区
   +SealedDir() : string
    // 设置API地址
   +SetAPIAddr(string) : error
    // 存储分段密封扇区
   +StagingDir() : string
    // 读取版本号
   +Version() : uint
    // 存储钱包信息
   +WalletDatastore() : Datastore
```

```
location: repo/fsrepo.go

▼ package
    repo

▼ constants
    // api文件
   +APIFile
    // chain目录:chain
   -chainDatastorePrefix
    // 配置文件名称，对应上一章中的config
   -configFilename
    // 交易目录：deals
   -dealsDatastorePrefix
    // 资源目录锁文件：repo.lock
   -lockFile
    // 快照文件前缀名　snapshot
   -snapshotFilenamePrefix
    // 快照目录;配置快照
   -snapshotStorePrefix
    // 临时配置文件名称
   -tempConfigFilename
    // version文件名称
   -versionFilename
    // 钱包目录名称wallet
   -walletDatastorePrefix

▼ variables
   -log

▼+FSRepo : struct
    [fields]
   -cfg : *config.Config
   -chainDs : Datastore
   -dealsDs : Datastore
   -ds : Datastore
   -keystore : keystore.Keystore
   -lk : sync.RWMutex
   -lockfile : io.Closer
    // 资源目录路径
   -path : string
    // 资源目录版本
   -version : uint
   -walletDs : Datastore
    [methods]
   +APIAddr() : string, error
   +ChainDatastore() : Datastore
   +Close() : error
   +Config() : *config.Config
   +Datastore() : Datastore
   +DealsDatastore() : Datastore
   +Keystore() : keystore.Keystore
   +ReplaceConfig(cfg *config.Config) : error
   +SealedDir() : string
   +SetAPIAddr(maddr string) : error
    // 快照存储
   +SnapshotConfig(cfg *config.Config) : error
   +StagingDir() : string
   +Version() : uint
   +WalletDatastore() : Datastore
   -loadConfig() : error
   -loadFromDisk() : error
   -loadVersion() : uint, error
   -openChainDatastore() : error
   -openDatastore() : error
   -openDealsDatastore() : error
   -openKeystore() : error
   -openWalletDatastore() : error
   -removeAPIFile() : error
   -removeFile(path string) : error
    [functions]
    // 打开已被初始化过的资源目录
   +OpenFSRepo(p string) : *FSRepo, error

▼+NoRepoError : struct
    [fields]
   +Path : string
    [methods]
   +Error() : string

▼ functions
    // 从文件中读取api file
   +APIAddrFromFile(apiFilePath string) : string, error
    // 初始化资源目录
   +InitFSRepo(p string, cfg *config.Config) : error
   -checkWritable(dir string) : error
   -fileExists(file string) : bool
   -genSnapshotFileName() : string
   -initConfig(p string, cfg *config.Config) : error
   -initVersion(p string, version uint) : error
   -isInitialized(p string) : bool, error
```

```
▼ package
    repo

▼ imports

▼+MemRepo : struct
    [fields]
   +C : *config.Config
   +Chain : Datastore
   +D : Datastore
   +DealsDs : Datastore
   +Ks : keystore.Keystore
   +W : Datastore
   -apiAddress : string
   -lk : sync.RWMutex
   -sealedDir : string
   -stagingDir : string
   -version : uint
    [methods]
   +APIAddr() : string, error
   +ChainDatastore() : Datastore
   +CleanupSectorDirs()
   +Close() : error
   +Config() : *config.Config
   +Datastore() : Datastore
   +DealsDatastore() : Datastore
   +Keystore() : keystore.Keystore
   +ReplaceConfig(cfg *config.Config) : error
   +SealedDir() : string
   +SetAPIAddr(addr string) : error
   +StagingDir() : string
   +Version() : uint
   +WalletDatastore() : Datastore
    [functions]
    // 实例化内存资源接口,会调用NewInMemoryRepoWithSectorDirectories
   +NewInMemoryRepo() : *MemRepo
    // 实例化内存资源接口，指定阶段密封和最终密封目录
   +NewInMemoryRepoWithSectorDirectories(staging, sealedDir string) : *MemRepo
```

## proofs和sectorbuilder

- proofs提供功能
    - 校验时空证明的方法
    - 校验密封证明的方法
    - 更细节的注释见如下代码笔者增加的注释
    - rustverifier实现具体的方法

```
location: proofs/types.go

▼ package
    proofs

▼ constants
    // merkle根长度
   +CommitmentBytesLen : uint
    // 时空证明挑战参数长度:32bytes
   +PoStChallengeSeedBytesLen : uint
    // 密封复制证明长度：384bytes
   +SealBytesLen : uint
    // 时空证明长度：192bytes
   +SnarkBytesLen : uint

    // 原始数据的merkle根，由PoRep输出
 +CommD : []byte

    // 副本数据的merkle根，由PoRep输出
 +CommR : []byte

    // 中间层的merkle根，由PoRep输出
 +CommRStar : []byte

    // 挑战随机参数,32bytes,256bits,PoSt的输入
 +PoStChallengeSeed : []byte

    // 时空证明输出，192bytes
 +PoStProof : []byte

    // 密封复制证明,384bytes
 +SealProof : []byte
```

```
location: proofs/interface.go

▼ package
    proofs

▼ constants
   +Live
   +Test

 +SectorStoreType : int

    // 校验时空证明校验请求
▼+VerifyPoSTRequest : struct
    [fields]
    // 挑战参数
   +ChallengeSeed : PoStChallengeSeed
   +CommRs : []CommR
   +Faults : []uint64
   +Proof : PoStProof
   +StoreType : SectorStoreType

▼+VerifyPoSTResponse : struct
    [fields]
   +IsValid : bool

    // 向特定矿工&特定扇区发起密封校验请求
▼+VerifySealRequest : struct
    [fields]
    // 来自于密封的返回参数
   +CommD : CommD
   +CommR : CommR
   +CommRStar : CommRStar
   +Proof : SealProof
    // 矿工标识
   +ProverID : [31]byte
    // 扇区ID
   +SectorID : [31]byte
    // 用于控制密封校验效率
   +StoreType : SectorStoreType

▼+VerifySealResponse : struct
    [fields]
   +IsValid : bool

▼+Verifier : interface
    [methods]
    // 校验时空证明
   +VerifyPoST(VerifyPoSTRequest) : VerifyPoSTResponse, error
    // 校验密封证明
   +VerifySeal(VerifySealRequest) : VerifySealResponse, error
```

```
location: proofs/rustverifier.go

▼ package
    proofs

▶ imports

▼ variables
   -log

    // RustVerifier 实现VerifyPoST与VerifySeal接口
▼+RustVerifier : struct
    [methods]
   +VerifyPoST(req VerifyPoSTRequest) : VerifyPoSTResponse, error
   +VerifySeal(req VerifySealRequest) : VerifySealResponse, error

▼ functions
   +CSectorStoreType(cfg SectorStoreType) : *C.ConfiguredStore, error
   -cUint64s(src []uint64) : *C.uint64_t, C.size_t
   -elapsed(what string) : func()
```

- sectorbuilder 
    - 提供向unsealed扇区写入pieces的方法
    - 提供生成时空证明的方法
    - 提供从特定扇区读取特定pieces的方法
    - 提供密封完成通知的方法
    - 提供批量密封所有未完成的分段扇区
    - 与rust-fil-proof交互，更深入的逻辑需要参见rust

```
location: proofs/sectorbuilder/interface.go

package sectorbuilder

▶ imports

    // 生成生成时空证明请求
▼+GeneratePoSTRequest : struct
    [fields]
   +ChallengeSeed : proofs.PoStChallengeSeed
   +CommRs : []proofs.CommR

    // 生成生成时空证明响应
▼+GeneratePoSTResponse : struct
    [fields]
   +Faults : []uint64
   +Proof : proofs.PoStProof

▼+PieceInfo : struct
    [fields]
   +Ref : cid.Cid
   +Size : uint64

    // 密封元数据
▼+SealedSectorMetadata : struct
    [fields]
   +CommD : proofs.CommD
    // 副本哈希后续将被删除
   +CommR : proofs.CommR
   +CommRStar : proofs.CommRStar
    // Pieces后续将被删除
   +Pieces : []*PieceInfo
   +Proof : proofs.SealProof
   +SectorID : uint64

    // 密封结果
▼+SectorSealResult : struct
    [fields]
   +SealingErr : error
   +SealingResult : *SealedSectorMetadata
   +SectorID : uint64

    // SectorBuilder提供相关功能
    // 1 写入、密封pieces至扇区
    // 2 unseal、读取pieces
▼+SectorBuilder : interface
    [methods]
    // 向unsealed扇区写入pieces
   +AddPiece(ctx context.Context, pi *PieceInfo) : uint64, error
   +Close() : error
    // 生成时空证明
   +GeneratePoST(GeneratePoSTRequest) : GeneratePoSTResponse, error
   +GetMaxUserBytesPerStagedSector() : uint64, error
    // 从扇区中读取特定pieces
   +ReadPieceFromSealedSector(pieceCid cid.Cid) : io.Reader, error
    // 密封所有未完成的分段扇区
   +SealAllStagedSectors(ctx context.Context) : error
    // 密封完成的通知
   +SectorSealResults() : chan SectorSealResult

▼ functions
   -init()
```

```
location: proofs/sectorbuilder/poller.go

// 当pieces加入后，会进行FFI调用，定时执行密封
const SealedSectorPollingInterval = 1 * time.Second
```


## type

如下对一些主要结构进行简析

- AttoFIL(10*-18 FIL)
    - 提供AttoFIL的算数运算方法
    - 提供AttoFIL的逻辑运算方法

- Block 
    - 区块结构

```
▼+Block : struct
    [fields]
   +Height : Uint64
   +MessageReceipts : []*MessageReceipt
   +Messages : []*SignedMessage
   +Miner : address.Address
   +Nonce : Uint64
   +ParentWeight : Uint64
   +Parents : SortedCidSet
   +Proof : proofs.PoStProof
   +StateRoot : cid.Cid
   +Ticket : Signature
   -cachedBytes : []byte
   -cachedCid : cid.Cid
    [methods]
   +Cid() : cid.Cid
   +Equals(other *Block) : bool
   +IsParentOf(c Block) : bool
   +Score() : uint64
   +String() : string
   +ToNode() : node.Node
    [functions]
   +DecodeBlock(b []byte) : *Block, error
```

- BlockHeight 
    - 区块高度相关操作方法

```
▼+BlockHeight : struct
    [fields]
   -val : *big.Int
    [methods]
   +Add(y *BlockHeight) : *BlockHeight
   +AsBigInt() : *big.Int
   +Bytes() : []byte
   +Equal(y *BlockHeight) : bool
   +GreaterEqual(y *BlockHeight) : bool
   +GreaterThan(y *BlockHeight) : bool
   +LessEqual(y *BlockHeight) : bool
   +LessThan(y *BlockHeight) : bool
   +String() : string
   +Sub(y *BlockHeight) : *BlockHeight
    [functions]
   +NewBlockHeight(x uint64) : *BlockHeight
   +NewBlockHeightFromBytes(buf []byte) : *BlockHeight
   +NewBlockHeightFromString(s string, base int) : *BlockHeight, bool
```

- BytesAmount (*big.Int)
    - 提供相关的算数逻辑运算

- ChannelID(支付通道结构体)

```
▼+ChannelID : struct
    [fields]
   -val : *big.Int
    [methods]
   +Bytes() : []byte
   +Equal(y *ChannelID) : bool
   +Inc() : *ChannelID
   +KeyString() : string
   +String() : string
    [functions]
   +NewChannelID(x uint64) : *ChannelID
   +NewChannelIDFromBytes(buf []byte) : *ChannelID
   +NewChannelIDFromString(s string, base int) : *ChannelID, bool
```

- 一些变量定义
    - 创建各类actor对象

```
func init() {
	AccountActorCodeObj = dag.NewRawNode([]byte("accountactor"))
	AccountActorCodeCid = AccountActorCodeObj.Cid()
	StorageMarketActorCodeObj = dag.NewRawNode([]byte("storagemarket"))
	StorageMarketActorCodeCid = StorageMarketActorCodeObj.Cid()
	PaymentBrokerActorCodeObj = dag.NewRawNode([]byte("paymentbroker"))
	PaymentBrokerActorCodeCid = PaymentBrokerActorCodeObj.Cid()
	MinerActorCodeObj = dag.NewRawNode([]byte("mineractor"))
	MinerActorCodeCid = MinerActorCodeObj.Cid()
	BootstrapMinerActorCodeObj = dag.NewRawNode([]byte("bootstrapmineractor"))
	BootstrapMinerActorCodeCid = BootstrapMinerActorCodeObj.Cid()
}
```

- Message相关
    - 消息结构及方法
    - filecoin网络的交易由一些列的Message组成

```
▼+Message : struct
    [fields]
   +From : address.Address
   +Method : string
   +Nonce : Uint64
   +Params : []byte
   +To : address.Address
   +Value : *AttoFIL
    [methods]
   +Cid() : cid.Cid, error
   +Marshal() : []byte, error
   +String() : string
   +Unmarshal(b []byte) : error
    [functions]
   +NewMessage(from, to address.Address, nonce uint64, value *AttoFIL, method string, params []byte) : *Message
```

```
▼+MessageReceipt : struct
    [fields]
   +ExitCode : uint8
   +GasAttoFIL : *AttoFIL
   +Return : [][]byte
```

```
▼+MeteredMessage : struct
    [fields]
   +GasLimit : GasUnits
   +GasPrice : AttoFIL
    [embedded]
   +Message : Message
    [methods]
   +Marshal() : []byte, error
   +Unmarshal(b []byte) : error
    [functions]
   +NewMeteredMessage(msg Message, gasPrice AttoFIL, gasLimit GasUnits) : *MeteredMessage
```

```
▼+SignedMessage : struct
    [fields]
   +Signature : Signature
    [embedded]
   +MeteredMessage : MeteredMessage
    [methods]
   +Cid() : cid.Cid, error
   +Marshal() : []byte, error
   +RecoverAddress(r Recoverer) : address.Address, error
   +String() : string
   +Unmarshal(b []byte) : error
   +VerifySignature() : bool
    [functions]
   +NewSignedMessage(msg Message, s Signer, gasPrice AttoFIL, gasLimit GasUnits) : *SignedMessage, error
```

- TipSet 
    - 区块集合

```
 +Tip : Block

▼+TipSet : map[cid.Cid]*Tip
    [methods]
   +AddBlock(b *Block) : error
   +Clone() : TipSet
   +Equals(ts2 TipSet) : bool
   +Height() : uint64, error
   +MinTicket() : Signature, error
   +ParentWeight() : uint64, error
   +Parents() : SortedCidSet, error
   +String() : string
   +ToSlice() : []*Block
   +ToSortedCidSet() : SortedCidSet
```

## abi
- abi
    - 对filecoin中的各类数据定义数据类型
    - 提供abi编解码操作方法


## pubsub

- 提供功能
    - 提供订阅实例化以及订阅方法
    - 提供发布实例化以及发布方法

```
▼ package
    pubsub

▶ imports

▼+Subscriber : struct
    [fields]
   -pubsub : *libp2p.PubSub
    [methods]
   +Subscribe(topic string) : Subscription, error
    [functions]
   +NewSubscriber(sub *libp2p.PubSub) : *Subscriber

▼-subscriptionWrapper : struct
    [embedded]
   +*libp2p.Subscription : *libp2p.Subscription
    [methods]
   +Next(ctx context.Context) : Message, error

▼+Message : interface
    [methods]
   +GetData() : []byte
   +GetFrom() : peer.ID

▼+Subscription : interface
    [methods]
   +Cancel()
   +Next(ctx context.Context) : Message, error
   +Topic() : string
```

```
▼ package
    pubsub

▶ imports

▼+Publisher : struct
    [fields]
   -pubsub : *pubsub.PubSub
    [methods]
   +Publish(topic string, data []byte) : error
    [functions]
   +NewPublisher(sub *pubsub.PubSub) : *Publisher
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
