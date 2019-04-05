---
title: filecoin技术架构分析七：filecoin源码协议层分析之存储协议
permalink: filecoin-code-analysis-7
date: 2019-03-05 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第七章filecoin源码协议层分析之存储协议。


<!-- more -->

## 协议概览图
![](https://img.learnblockchain.cn/2019/storage_protocol.png!wl)

## 源码信息

- version
    - master分支 619b0eb1（2019年３月２日）
- package
    - storage
- location
    - protocol/storage

## 源码分析

### 存储矿工

```
▼ package
    storage

▶ imports

▼ constants
    //等待密封数据前缀
   -dealsAwatingSealDatastorePrefix
    // 存储交易协议名称："/fil/storage/mk/1.0.0"
   -makeDealProtocol
    // 矿工数据存储前缀
   -minerDatastorePrefix
    // 存储查询协议名称："/fil/storage/qry/1.0.0"
   -queryDealProtocol
    // Gas及Gas限制
   -submitPostGasLimit
   -submitPostGasPrice
    // 支付通道建立等待时间
   -waitForPaymentChannelDuration

▼ variables
   -log

▼+Miner : struct
    [fields]
    // 交易集合
   -deals : map[cid.Cid]*storageDeal
    // 等待密封结构体
   -dealsAwaitingSeal : *dealsAwaitingSealStruct
    // 交易的资源对象
   -dealsDs : repo.Datastore
    // 交易锁
   -dealsLk : sync.Mutex
    // 存储矿工地址
   -minerAddr : address.Address
    // 节点的Owner地址
   -minerOwnerAddr : address.Address
    // 节点对象，有定义存储矿工必须实现的接口
   -node : node
    // 存储矿工的高层API
   -porcelainAPI : minerPorcelain
    // 是否在生成时空证明中,以及对应的锁
   -postInProcess : *types.BlockHeight
   -postInProcessLk : sync.Mutex
    // 接受交易以及拒绝交易
   -proposalAcceptor : func(ctx context.Context, m *Miner, p *DealProposal) *DealResponse, error
   -proposalRejector : func(ctx context.Context, m *Miner, p *DealProposal, reason string) *DealResponse, error

    [methods]
    // 密封消息提交到区块链时候，所执行的回调函数,在node中执行
    // 1 失败，则调用dealsAwaitingSeal.fail
    // 2 成功，则调用dealsAwaitingSeal.success
    // 3 成功之后，需要保存密封扇区信息，如果失败调用dealsAwaitingSeal.fail
   +OnCommitmentAddedToChain(sector *sectorbuilder.SealedSectorMetadata, err error)
    // 新区块产生的回调，由node调用,它将会触发新的存储证明
    // 如果时空证明过期，将会在新的周期重新出发时空证明
   +OnNewHeaviestTipSet(ts types.TipSet)
   // 由handleQueryDeal调用,返回查询结果
   +Query(ctx context.Context, c cid.Cid) : *DealResponse
   // 生成时空证明
   -generatePoSt(commRs []proofs.CommR, challenge proofs.PoStChallengeSeed) : proofs.PoStProof, []uint64, error
   // 获取支付通道信息
   // 1 等待支付通道建立完成
   // 2 获取支付通道信息并返回
   // 3 支付信息包括：合约地址、支付者地址、通道信息、支付通道消息cid、支付凭证合集
   -getPaymentChannel(ctx context.Context, p *DealProposal) : *paymentbroker.PaymentChannel, error
   // 获取新的时空证明时间
   -getProvingPeriodStart() : *types.BlockHeight, error
   // 获取存储矿工的特定交易
   -getStorageDeal(c cid.Cid) : *storageDeal
   // 获取存储矿工报价
   -getStoragePrice() : *types.AttoFIL, error
    // 存储交易请求的入口方法,交易请求流的handle函数
    // 1 读取流中交易请求信息
    // 2 调用receiveStorageProposal处理交易请求
    // 3 回复处理回复
   -handleMakeDeal(s inet.Stream)
    //解析具体流信息，处理查询请求，会调用Query请求
   -handleQueryDeal(s inet.Stream)
    // 从资源目录中加载交易信息到Miner实例中
   -loadDeals() : error
    // 加载待密封的信息
   -loadDealsAwaitingSeal() : error
   // 密封失败，更新响应信息
   -onCommitFail(dealCid cid.Cid, message string)
   // 密封成功，更新响应信息
   // 1 切换状态至Posted
   // 2 更新证明信息：扇区ID,副本信息，原始数据信息
   -onCommitSuccess(dealCid cid.Cid, sector *sectorbuilder.SealedSectorMetadata)
   // 处理存储交易
   // 1,获取存储交易信息
   // 2,数据处理，密封
   -processStorageDeal(c cid.Cid)
    // 处理交易请求
    // 1 检查签名的正确性
    // 2 检查支付信息正确性,调用validateDealPayment方法
    // 3 不合法调用proposalRejector(rejectProposal)拒绝请求;合法调用proposalAcceptor(acceptProposal)回复
   -receiveStorageProposal(ctx context.Context, sp *SignedDealProposal) : *DealResponse, error
    // 从Miner对象中存储交易信息到资源目录中
   -saveDeal(proposalCid cid.Cid) : error
    // 存储待密封信息至资源目录
   -saveDealsAwaitingSeal() : error
   // 提交时空证明
   // 1 产生随机种子
   // 2 根据时空证明输入长度，生成副本切片
   // 3 随机种子＋副本切片作为输入生成时空证明
   // 4 调用高层接口发送消息
   -submitPoSt(start, end *types.BlockHeight, inputs []generatePostInput)
   // 更新交易响应消息
   -updateDealResponse(proposalCid cid.Cid, f func(*DealResponse)) : error
   // 检查支付信息的正确性
   // 1 客户出价必须高于矿工报价
   // 2 收款人必须为本节点矿工
   // 3 支付通道总资金必须大于矿工报价
   // 4 必须有交易凭证，且交易凭证总金额必须大于矿工报价
   -validateDealPayment(ctx context.Context, p *DealProposal) : error

    [functions]
    // 实例化存储矿工
    // 1 通过node传参赋值
    // 2 指定密封成功失败的回调函数
    // 3 设置交易请求以及交易查询的流handle方法
   +NewMiner(ctx context.Context, minerAddr, minerOwnerAddr address.Address, nd node, dealsDs repo.Datastore, porcelainAPI minerPorcelain) : *Miner, error

▼-dealsAwaitingSealStruct : struct
    [fields]
    // 从扇区id获取失败信息
   +FailedSectors : map[uint64]string
    // 从扇区id获取交易的cid
   +SectorsToDeals : map[uint64][]cid.Cid
    // 从扇区id获取sector元数据
   +SuccessfulSectors : map[uint64]*sectorbuilder.SealedSectorMetadata
   -l : sync.Mutex
    // 失败处理回调，在实例化Miner指向onCommitFail
   -onFail : func(dealCid cid.Cid, message string)
    // 成功处理回调,在实例化Miner指向onCommitSuccess
   -onSuccess : func(dealCid cid.Cid, sector *sectorbuilder.SealedSectorMetadata)

    [methods]
    // 对数据进行密封
   -add(sectorID uint64, dealCid cid.Cid)
    // 密封失败处理dealsAwaitingSeal.onFail
   -fail(sectorID uint64, message string)
    // 密封成功处理dealsAwaitingSeal.onSuccess
   -success(sector *sectorbuilder.SealedSectorMetadata)

▼-generatePostInput : struct
    [fields]
    // 副本merkle根
   -commD : proofs.CommD
    // 原始数据merkle根
   -commR : proofs.CommR
    // 中间数据merkle根
   -commRStar : proofs.CommRStar
    // 扇区ID
   -sectorID : uint64

▼-storageDeal : struct
    [fields]
    // 交易请求结构体
   +Proposal : *DealProposal
    // 交易请求响应结构体
   +Response : *DealResponse

    // 存储矿工高层API
▼-minerPorcelain : interface
    [methods]
    // 区块高度
   +ChainBlockHeight(ctx context.Context) : *types.BlockHeight, error
    // 获取配置
   +ConfigGet(dottedPath string) : interface{}, error
    // 发送、查询、等待消息
   +MessageQuery(ctx context.Context, optFrom, to address.Address, method string, params ...interface{}) : [][]byte, *exec.FunctionSignature, error
   +MessageSend(ctx context.Context, from, to address.Address, value *types.AttoFIL, gasPrice types.AttoFIL, gasLimit types.GasUnits, method string, params ...interface{}) : cid.Cid, error
   +MessageWait(ctx context.Context, msgCid cid.Cid, cb func(*types.Block, *types.SignedMessage, *types.MessageReceipt) error) : error

▼-node : interface
    [methods]
    // 区块高度
   +BlockHeight() : *types.BlockHeight, error
    // 区块服务，存储/查询服务
   +BlockService() : bserv.BlockService
    // 区块时间
   +GetBlockTime() : time.Duration
    // 主机信息
   +Host() : host.Host
    // 扇区创建,具体包含
    // 1 增加、读取piece;
    // 2 密封所有非空分期扇区
    // 3 密封结果通过返回，通过通道channel的方式
    // 4 获取扇区中最大的piece字节大小
    // 5 生成时空证明
   +SectorBuilder() : sectorbuilder.SectorBuilder

▼ functions
    // 存储交易信息之后，调用processStorageDeal处理交易信息
   -acceptProposal(ctx context.Context, sm *Miner, p *DealProposal) : *DealResponse, error
    // 获取具体文件大小
   -getFileSize(ctx context.Context, c cid.Cid, dserv ipld.DAGService) : uint64, error
   -init()
    // 存储交易信息,更新响应消息，并返回
   -rejectProposal(ctx context.Context, sm *Miner, p *DealProposal, reason string) : *DealResponse, error
```

### 存储客户

```
▼ package
    storage

▼ imports

▼ constants
   +ChannelExpiryInterval
    // Gas及Gas限制
   +CreateChannelGasLimit
   +CreateChannelGasPrice
   +ErrDupicateDeal
    // 建立Voucher的周期
   +VoucherInterval
    // 存储前缀
   -clientDatastorePrefix

▼ variables
   +Errors

▼+Client : struct
    [fields]
    
    // 存储客户高层API
   -api : clientPorcelainAPI
    // 交易集合
   -deals : map[cid.Cid]*clientDeal
    // 交易资源目录对象及锁
   -dealsDs : repo.Datastore
   -dealsLk : sync.Mutex
    // 存储客户节点
   -node : clientNode

    [methods]
    // 加载特定交易的凭证
   +LoadVouchersForDeal(dealCid cid.Cid) : []*paymentbroker.PaymentVoucher, error

    // 发起存储交易
    // 1 获取文件大小、矿工报价、区块高度、目的地址 
    // 2 建立支付通道
    // 3 调用MakeProtocolRequest发起交易请求
    // 4 检查交易响应
    // 5 持久化交易响应并回复
   +ProposeDeal(ctx context.Context, miner address.Address, data cid.Cid, askID uint64, duration uint64, allowDuplicates bool) : *DealResponse, error

    // 查询交易
    // 1 获取矿工信息，地址、节点ID
    // 2 调用MakeProtocolRequest发起请求
   +QueryDeal(ctx context.Context, proposalCid cid.Cid) : *DealResponse, error

    // 检查交易响应
   -checkDealResponse(ctx context.Context, resp *DealResponse) : error

    // 判断是否为重复交易
   -isMaybeDupDeal(p *DealProposal) : bool

    // 加载交易信息
   -loadDeals() : error

    // 返回目标矿工地址
   -minerForProposal(c cid.Cid) : address.Address, error

    // 持久化交易响应
   -recordResponse(resp *DealResponse, miner address.Address, p *DealProposal) : error

    // 保存交易信息
   -saveDeal(cid cid.Cid) : error

    [functions]
    // 实例化存储客户
   +NewClient(nd clientNode, api clientPorcelainAPI, dealsDs repo.Datastore) : *Client, error

▼+ClientNodeImpl : struct
    [fields]
   -blockTime : time.Duration
   -dserv : ipld.DAGService
   -host : host.Host

    [methods]
    //实现clientNode接口
   +GetBlockTime() : time.Duration

    // 获取文件大小
   +GetFileSize(ctx context.Context, c cid.Cid) : uint64, error

    // 发起协议请求
    // 1 建立对应的存储交易或者请求的协议流
    // 2 发起请求
   +MakeProtocolRequest(ctx context.Context, protocol protocol.ID, peer peer.ID, request interface{}, response interface{}) : error

    [functions]
    // 实例化客户节点
   +NewClientNodeImpl(ds ipld.DAGService, host host.Host, bt time.Duration) : *ClientNodeImpl

▼-clientDeal : struct
    [fields]
    // 目标矿工，请求及响应
   +Miner : address.Address
   +Proposal : *DealProposal
   +Response : *DealResponse

▼-clientNode : interface
    // 由ClientNodeImpl实现
    [methods]
   +GetBlockTime() : time.Duration
   +GetFileSize(context.Context, cid.Cid) : uint64, error
   +MakeProtocolRequest(ctx context.Context, protocol protocol.ID, peer peer.ID, request interface{}, response interface{}) : error

▼-clientPorcelainAPI : interface
    [embedded]
   +types.Signer

    [methods]
    // 获取区块高度
   +ChainBlockHeight(ctx context.Context) : *types.BlockHeight, error
    // 创建支付通道
    // 包括源及目的地址，价格，时间，支付间隔，通道超时时间，Gas及限制
   +CreatePayments(ctx context.Context, config porcelain.CreatePaymentsParams) : *porcelain.CreatePaymentsReturn, error
    // 获取目标地址
   +GetAndMaybeSetDefaultSenderAddress() : address.Address, error
    // 获取矿工报价
   +MinerGetAsk(ctx context.Context, minerAddr address.Address, askID uint64) : miner.Ask, error
    // 获取矿工Owner地址
   +MinerGetOwnerAddress(ctx context.Context, minerAddr address.Address) : address.Address, error
    // 获取矿工节点ID
   +MinerGetPeerID(ctx context.Context, minerAddr address.Address) : peer.ID, error

▼ functions
   -init()
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
