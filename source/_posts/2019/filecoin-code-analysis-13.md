---
title: filecoin技术架构分析十三：filecoin源码分析之服务层actor及vm
permalink: filecoin-code-analysis-13
date: 2019-03-08 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十三章源码分析之服务层actor及vm。


<!-- more -->


##  说明
> 分析源代码版本：master 2c87fd59（2019.3.7）

> 回头看第三章开发网使用中创建矿工，提交订单，支付等操作实际上都是actor的新增及状态改变

> 当前的实现vm还不具备通用abi数据的解释执行能力，未达到真正智能合约水平

##  exec(actor及vm的接口定义)
- 说明
    - 提供可执行actor的最小接口要求 ExecutableActor (由actor及具体actor包实现)
    - 提供actor键值存取接口定义 Lookup (由actor包实现)
    - 提供状态临时存储的接口定义　Storage (由vm.Storage实现)
    - actor的执行环境接口定义 VMContext (由vm.context实现)

- 具体源码注释如下

```
▼ package
    exec

▶ imports

▼ constants
   +ErrDanglingPointer
   +ErrDecode
   +ErrInsufficientGas
   +ErrStaleHead

▼ variables
   +Errors

▼+Error : string
    [methods]
   +Error() : string

 +ExportedFunc : func(ctx VMContext) []byte, uint8, error

    // actor符号集合
▼+Exports : map[string]*FunctionSignature
    [methods]
    // 判断是否存在特定方法
   +Has(method string) : bool
    
    // 对于单个函数的符号表
    // todo中的事情：需要转换为非go类型
▼+FunctionSignature : struct
    [fields]
   +Params : []abi.Type
   +Return : []abi.Type

    // 可执行合约接口，这是每一类型的合约必须实现的最小接口
    // 包括account,miner,storagemarket,paymentbroker
▼+ExecutableActor : interface
    [methods]
   +Exports() : Exports
   +InitializeState(storage Storage, initializerData interface{}) : error

   // 由actor.lookup实现键值存储　（actor/storage.go）
▼+Lookup : interface
    [methods]
   +Commit(ctx context.Context) : cid.Cid, error
   +Delete(ctx context.Context, k string) : error
   +Find(ctx context.Context, k string) : interface{}, error
   +IsEmpty() : bool
   +Set(ctx context.Context, k string, v interface{}) : error
   +Values(ctx context.Context) : []*hamt.KV, error

   // 由vm.Storage实现
   // 解决持久化的问题，有副本防止回滚机制
   // 具体实现还有Flush持久化到datastore功能
▼+Storage : interface
    [methods]
    // 提交最新actor　Head
   +Commit(cid.Cid, cid.Cid) : error
    // 如下都为内存中操作
   +Get(cid.Cid) : []byte, error
   +Head() : cid.Cid
   +Put(interface{}) : cid.Cid, error

    // actor的abi执行环境接口,由vm.context实现
▼+VMContext : interface
    [methods]
    // 创建新的合约地址
   +AddressForNewActor() : address.Address, error
    // 查询区块高度
   +BlockHeight() : *types.BlockHeight
    // Gas收费
   +Charge(cost types.GasUnits) : error
    //　创建合约
   +CreateNewActor(addr address.Address, code cid.Cid, initalizationParams interface{}) : error
    // 判断是否为account类型的Actor
   +IsFromAccountActor() : bool
    // 合约中交易信息
   +Message() : *types.Message
    // 执行合约函数
   +Send(to address.Address, method string, value *types.AttoFIL, params []interface{}) : [][]byte, uint8, error
   +Storage() : Storage
    // 当Storage接口完成会删除如下两项
   +ReadStorage() : []byte, error
   +WriteStorage(interface{}) : error
```

##  actor的类型及源码分析
- actor包定义及实现了基础actor,此外filecoin还定义了四种内置的actor类型
    - 存储市场actor,此类actor整个网络只有一个实例，用于创建存储矿工、更新功率表、获取总存储容量
    - Miner actor,此类actor整个网络只有多个实例（随用户数增加而增加），用于执行矿工相关的操作
    - paymentbroker actor,此类actor整个网络只有一个实例，用于创建支付通道以及支付相关信息
    - account actor,账户actor,此类actor整个网络只有多个实例（随用户数增加而增加），只能用于基本的转账操作

###　基础actor包

- 说明
    - 定义了actor的基础结构,其中code如果使用内置的如上四种actor，他们的值都是固定的
    - 提供了actor的基础操作方法
    - 见笔者在代码中的注释

```
location: actor/actor.go

▼ package
    actor

    // Actor可以理解为合约或者账户，转账操作要检查code cid合法性
▼+Actor : struct
    [fields]
    //余额
   +Balance : *types.AttoFIL

    // 合约代码的cid，vm具体执行其对应的代码
    // 1 具体代码的cid
    // 2 在go语言实现的四种特定合约，这个字段是常量，比如account,miner,storagemarket,paymentbroker
   +Code : cid.Cid

    //　合约状态的最新状态
   +Head : cid.Cid

    // 防止重放攻击而设置的参数
   +Nonce : types.Uint64

    [methods]
    // 计算actor的cid
   +Cid() : cid.Cid, error

    // 打印合约信息
   +Format(f fmt.State, c rune)

    // 增加Nonce+1方法
   +IncNonce()

    // 编码
   +Marshal() : []byte, error

    // 解码
   +Unmarshal(b []byte) : error
    [functions]
   +NewActor(code cid.Cid, balance *types.AttoFIL) : *Actor

▼ functions
    // 只有account类型的actor使用
   +NextNonce(actor *Actor) : uint64, error
   -init()
```

```
location: actor/export.go

▼ functions
    // 返回某个actor的方法执行函数
   +MakeTypedExport(actor exec.ExecutableActor, method string) : exec.ExportedFunc

   //　序列化成字节切片
   +MarshalValue(val interface{}) : []byte, error
```

### storagemarket actor
- 主要功能
    - 创建存储矿工
    - 获取总存储量
    - 更新功率

```
▼ package
    storagemarket

▶ imports

▼ constants
   +ErrInsufficientCollateral
   +ErrPledgeTooLow
   +ErrUnknownMiner

▼ variables
   +Errors
   +MinimumCollateralPerSector
   +MinimumPledge
   -storageMarketExports

▼+Actor : struct
    [methods]
    // 创建存储矿工
    // 会调用到miner actor的创建
   +CreateMiner(vmctx exec.VMContext, pledge *big.Int, publicKey []byte, pid peer.ID) : address.Address, uint8, error
   +Exports() : exec.Exports
    // 获取总存储
   +GetTotalStorage(vmctx exec.VMContext) : *big.Int, uint8, error
   +InitializeState(storage exec.Storage, _ interface{}) : error
    // 更新功率
   +UpdatePower(vmctx exec.VMContext, delta *big.Int) : uint8, error

▼+State : struct
    [fields]
    // miners合集的cid
   +Miners : cid.Cid
   +TotalCommittedStorage : *big.Int

▼ functions
   +MinimumCollateral(sectors *big.Int) : *types.AttoFIL
    // 实例化存储市场
   +NewActor() : *actor.Actor, error
   -init()
```

### miner actor
- 提供功能
    - 有基本转账功能 
    - 提供如下功能
    - filecoin网络中存在多个Miner Actor

```
▼ package
    miner

▶ imports

▼ constants
   +ErrAskNotFound
   +ErrCallerUnauthorized
   +ErrInsufficientPledge
   +ErrInvalidPoSt
   +ErrInvalidSealProof
   +ErrInvalidSector
   +ErrPublicKeyTooBig
   +ErrSectorCommitted
   +ErrStoragemarketCallFailed
   +MaximumPublicKeySize

▼ variables
   +Errors
   +GracePeriodBlocks
   +ProvingPeriodBlocks
   -minerExports

▼+Actor : struct
    [fields]
   +Bootstrap : bool
    [methods]
    // 增加订单
   +AddAsk(ctx exec.VMContext, price *types.AttoFIL, expiry *big.Int) : *big.Int, uint8, error
    // 抵押承诺
   +CommitSector(ctx exec.VMContext, sectorID uint64, commD, commR, commRStar, proof []byte) : uint8, error
   +Exports() : exec.Exports
    // 获取存储矿工相关信息
   +GetAsk(ctx exec.VMContext, askid *big.Int) : []byte, uint8, error
   +GetAsks(ctx exec.VMContext) : []uint64, uint8, error
   +GetKey(ctx exec.VMContext) : []byte, uint8, error
   +GetLastUsedSectorID(ctx exec.VMContext) : uint64, uint8, error
   +GetOwner(ctx exec.VMContext) : address.Address, uint8, error
   +GetPeerID(ctx exec.VMContext) : peer.ID, uint8, error
   +GetPledge(ctx exec.VMContext) : *big.Int, uint8, error
   +GetPower(ctx exec.VMContext) : *big.Int, uint8, error
   +GetProvingPeriodStart(ctx exec.VMContext) : *types.BlockHeight, uint8, error
   +GetSectorCommitments(ctx exec.VMContext) : map[string]types.Commitments, uint8, error
   +InitializeState(storage exec.Storage, initializerData interface{}) : error
    // 提交时空证明
   +SubmitPoSt(ctx exec.VMContext, postProofs []proofs.PoStProof) : uint8, error
    // 更新节点Id
   +UpdatePeerID(ctx exec.VMContext, pid peer.ID) : uint8, error

    // 报价单：价格，时长，序号
▼+Ask : struct
    [fields]
   +Expiry : *types.BlockHeight
   +ID : *big.Int
   +Price : *types.AttoFIL

    // 矿工Actor状态
▼+State : struct
    [fields]
   +Asks : []*Ask
   +Collateral : *types.AttoFIL
   +LastPoSt : *types.BlockHeight
   +LastUsedSectorID : uint64
   +NextAskID : *big.Int
   +Owner : address.Address
   +PeerID : peer.ID
   +PledgeSectors : *big.Int
   +Power : *big.Int
   +ProvingPeriodStart : *types.BlockHeight
   +PublicKey : []byte
   +SectorCommitments : map[string]types.Commitments
    [functions]
   +NewState(owner address.Address, key []byte, pledge *big.Int, pid peer.ID, collateral *types.AttoFIL) : *State

▼ functions
   +NewActor() : *actor.Actor
   -init()
```

###  paymentbroker actor

- 说明
    - 全网只有一个paymentbroker
    - 几个概念的关系简图

![](https://img.learnblockchain.cn/2019/payment.png!wl)

- 源码分析注释
```
▼ package
    paymentbroker

▼+Actor : struct
    [methods]
    // 关闭支付通道
   +Close(vmctx exec.VMContext, payer address.Address, chid *types.ChannelID, amt *types.AttoFIL, validAt *types.BlockHeight, sig []byte) : uint8, error
    // 创建支付通道
   +CreateChannel(vmctx exec.VMContext, target address.Address, eol *types.BlockHeight) : *types.ChannelID, uint8, error
   +Exports() : exec.Exports
    // 增加资金
   +Extend(vmctx exec.VMContext, chid *types.ChannelID, eol *types.BlockHeight) : uint8, error
   +InitializeState(storage exec.Storage, initializerData interface{}) : error
    // 查询某个支付者的信息
   +Ls(vmctx exec.VMContext, payer address.Address) : []byte, uint8, error
    // 撤回资金
   +Reclaim(vmctx exec.VMContext, chid *types.ChannelID) : uint8, error
    // 赎回(或者收款)资金
   +Redeem(vmctx exec.VMContext, payer address.Address, chid *types.ChannelID, amt *types.AttoFIL, validAt *types.BlockHeight, sig []byte) : uint8, error
    // 收据，指明在特定区块高度之前都是有效的
   +Voucher(vmctx exec.VMContext, chid *types.ChannelID, amount *types.AttoFIL, validAt *types.BlockHeight) : []byte, uint8, error

▼+PaymentChannel : struct
    [fields]
    // 支付通道内金额
   +Amount : *types.AttoFIL
    // 已被赎回金额
   +AmountRedeemed : *types.AttoFIL
   +Eol : *types.BlockHeight
    // 收款人地址
   +Target : address.Address

▼ functions
    // 收据的签名及校验
   +SignVoucher(channelID *types.ChannelID, amount *types.AttoFIL, validAt *types.BlockHeight, addr address.Address, signer types.Signer) : types.Signature, error
   +VerifyVoucherSignature(payer address.Address, chid *types.ChannelID, amt *types.AttoFIL, validAt *types.BlockHeight, sig []byte) : bool
   -createVoucherSignatureData(channelID *types.ChannelID, amount *types.AttoFIL, validAt *types.BlockHeight) : []byte
   -findByChannelLookup(ctx context.Context, storage exec.Storage, byPayer exec.Lookup, payer address.Address) : exec.Lookup, error
   -init()
   -reclaim(ctx context.Context, vmctx exec.VMContext, byChannelID exec.Lookup, payer address.Address, chid *types.ChannelID, channel *PaymentChannel) : error
   -updateChannel(ctx exec.VMContext, target address.Address, channel *PaymentChannel, amt *types.AttoFIL, validAt *types.BlockHeight) : error
   -withPayerChannels(ctx context.Context, storage exec.Storage, payer address.Address, f func(exec.Lookup) error) : error
   -withPayerChannelsForReading(ctx context.Context, storage exec.Storage, payer address.Address, f func(exec.Lookup) error) : error
```

###    account actor
- 说明
    - 纯账户，记录nonce
    - 只有转帐功能
    - filecoin网络中存在多个account Actor

```
▼ package
    account

▶ imports

▼ variables
   -accountExports

▼+Actor : struct
    [methods]
   +Exports() : exec.Exports
   +InitializeState(_ exec.Storage, _ interface{}) : error

▼ functions
    // 实例化account actor 集成actor包中Actor所实现的所有方法
   +NewActor(balance *types.AttoFIL) : *actor.Actor, error
    // 将其他actor类型转为account，保留余额
   +UpgradeActor(act *actor.Actor) : error
```

##  vm(虚拟机运行环境)

- 虚拟机执行函数

```
▼ package
    vm

▶ imports

▼-sendDeps : struct
    [fields]
   -transfer : func(*actor.Actor, *actor.Actor, *types.AttoFIL) error

▼ functions
    // 执行合约
   +Send(ctx context.Context, vmCtx *Context) : [][]byte, uint8, error
    // 转账
   +Transfer(fromActor, toActor *actor.Actor, value *types.AttoFIL) : error
   -send(ctx context.Context, deps sendDeps, vmCtx *Context) : [][]byte, uint8, error
```
- vm环境实现

```
▼+Context : struct
    [fields]
   -ancestors : []types.TipSet
   -blockHeight : *types.BlockHeight
   -deps : *deps
   -from : *actor.Actor
   -gasTracker : *GasTracker
   -lookBack : int
   -message : *types.Message
   -state : *state.CachedTree
   -storageMap : StorageMap
   -to : *actor.Actor
    [methods]
    // 实现上述VMContext 接口，注释见上
   +AddressForNewActor() : address.Address, error
   +BlockHeight() : *types.BlockHeight
   +Charge(cost types.GasUnits) : error
   +CreateNewActor(addr address.Address, code cid.Cid, initializerData interface{}) : error
   +GasUnits() : types.GasUnits
   +IsFromAccountActor() : bool
   +Message() : *types.Message
   +Rand(sampleHeight *types.BlockHeight) : []byte, error
   +ReadStorage() : []byte, error
   +Send(to address.Address, method string, value *types.AttoFIL, params []interface{}) : [][]byte, uint8, error
   +Storage() : exec.Storage
   +WriteStorage(memory interface{}) : error
    [functions]
   +NewVMContext(params NewContextParams) : *Context

▼+NewContextParams : struct
    [fields]
   +Ancestors : []types.TipSet
   +BlockHeight : *types.BlockHeight
   +From : *actor.Actor
   +GasTracker : *GasTracker
   +LookBack : int
   +Message : *types.Message
   +State : *state.CachedTree
   +StorageMap : StorageMap
   +To : *actor.Actor

▼-deps : struct
    [fields]
   +EncodeValues : func([]*abi.Value) []byte, error
   +GetOrCreateActor : func(context.Context, address.Address, func() *actor.Actor, error) *actor.Actor, error
   +Send : func(context.Context, *Context) [][]byte, uint8, error
   +ToValues : func([]interface{}) []*abi.Value, error

▼ deps* : ctype
    [functions]
   -makeDeps(st *state.CachedTree) : *deps

▼ functions
   -computeActorAddress(creator address.Address, nonce uint64) : address.Address, error
```

- 合约状态存储

```
▼+Storage : struct
    [fields]
   -actor : *actor.Actor
   -blockstore : blockstore.Blockstore
   -chunks : map[cid.Cid]ipld.Node
    [methods]
   +Commit(newCid cid.Cid, oldCid cid.Cid) : error
   +Flush() : error
   +Get(cid cid.Cid) : []byte, error
   +Head() : cid.Cid
   +Prune() : error
   +Put(v interface{}) : cid.Cid, error
   -liveDescendantIds(id cid.Cid) : *cid.Set, error
    [functions]
   +NewStorage(bs blockstore.Blockstore, act *actor.Actor) : Storage

▼-storageMap : struct
    [fields]
   -blockstore : blockstore.Blockstore
   -storageMap : map[address.Address]Storage
    [methods]
   +Flush() : error
   +NewStorage(addr address.Address, actor *actor.Actor) : Storage

▼+StorageMap : interface
    [methods]
   +Flush() : error
   +NewStorage(addr address.Address, actor *actor.Actor) : Storage

▼ functions
   +NewStorageMap(bs blockstore.Blockstore) : StorageMap
```

## state包(actor状态)
- 表征actor的状态
    

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
