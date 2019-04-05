---
title: filecoin技术架构分析之十二：filecoin源码分析之内部接口层plumbing＆porcelain接口
permalink: filecoin-code-analysis-12
date: 2019-03-07 18:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十二章源码分析之内部接口层plumbing＆porcelain接口。


<!-- more -->

## 说明
- 目前官方正在将api包解耦，往plumbing、porcelain中迁移
    - 缘由: 原来的api包，依赖于node包，而node包应该属于api之上的，这导致代码耦合性大
    - node作为一个上帝对象，被api包依赖，对架构扩展性，其他类型节点扩展开发不利
    - 就在笔者写这篇文章的同时，官方应该还在继续迁移，后面api包会逐步都迁移完

- porcelain主要依赖于plumbing接口

- 上一章所述的api包将会被废除

##  plumbing＆porcelain模式简述
- 该模式是借鉴git的思路，提供两种接口，porcelain偏高层面对用户更加友好方便；plumbing偏底层，友好度弱于porcelain
- porcelain是英文瓷器的意思,类似洗手盆之类；plumbing是水管装置的意思，类似下水管,用户当然直接用洗手盆省心，不用管水管的事情
- 用户级更偏向用porcelain，协议级更偏向使用plumbing，

##  plumbing底层接口
- 说明
    - plumbing底层接口是为实现协议以及面向网络的必须最小实现
    - 更应用级别的调用更多将会调用到porcelain高层接口

- 提供的具体功能接口
    - 区块状态读取
    - 配置信息
    - 日志
    - 消息池操作
    - 消息预览，Gas计算
    - 消息查询
    - 消息发送
    - 消息等待
    - 网络操作
    - Chain状态获取（actor信息）
    - 钱包底层操作

- 具体的方法如下

```
▼ package
    plumbing

▶ imports

▼+API : struct
    [fields]
   -chain : chain.ReadStore
   -config : *cfg.Config
   -logger : logging.EventLogger
   -msgPool : *core.MessagePool
   -msgPreviewer : *msg.Previewer
   -msgQueryer : *msg.Queryer
   -msgSender : *msg.Sender
   -msgWaiter : *msg.Waiter
   -network : *ntwk.Network
   -sigGetter : *mthdsig.Getter
   -wallet : *wallet.Wallet
    [methods]
   +ActorGet(ctx context.Context, addr address.Address) : *actor.Actor, error
   +ActorGetSignature(ctx context.Context, actorAddr address.Address, method string) : *exec.FunctionSignature, error
   +BlockGet(ctx context.Context, id cid.Cid) : *types.Block, error
   +ChainHead(ctx context.Context) : types.TipSet
   +ChainLs(ctx context.Context) : chan interface{}
   +ConfigGet(dottedPath string) : interface{}, error
   +ConfigSet(dottedPath string, paramJSON string) : error
   +MessagePoolGet(cid cid.Cid) : *types.SignedMessage, bool
   +MessagePoolPending() : []*types.SignedMessage
   +MessagePoolRemove(cid cid.Cid)
   +MessagePreview(ctx context.Context, from, to address.Address, method string, params ...interface{}) : types.GasUnits, error
   +MessageQuery(ctx context.Context, optFrom, to address.Address, method string, params ...interface{}) : [][]byte, *exec.FunctionSignature, error
   +MessageSend(ctx context.Context, from, to address.Address, value *types.AttoFIL, gasPrice types.AttoFIL, gasLimit types.GasUnits, method string, params ...interface{}) : cid.Cid, error
   +MessageWait(ctx context.Context, msgCid cid.Cid, cb func(*types.Block, *types.SignedMessage, *types.MessageReceipt) error) : error
   +NetworkFindProvidersAsync(ctx context.Context, key cid.Cid, count int) : chan pstore.PeerInfo
   +NetworkGetPeerID() : peer.ID
   +PubSubPublish(topic string, data []byte) : error
   +PubSubSubscribe(topic string) : pubsub.Subscription, error
   +SignBytes(data []byte, addr address.Address) : types.Signature, error
   +WalletAddresses() : []address.Address
   +WalletFind(address address.Address) : wallet.Backend, error
   +WalletNewAddress() : address.Address, error
    [functions]
   +New(deps *APIDeps) : *API
```

## porcelain高层接口
- 说明
    - porcelain主要依赖plumbing实现。
    - 主要是面向用户级操作

- 提供功能
    - 获取区块高度
    - 建立支付通道/多支付通道
    - 获取默认地址
    - 消息池等待未被打包进区块的消息
    - 采用默认地址发送消息
    - 获取指定矿工报价单
    - 获取矿工Owner地址
    - 获取矿工节点ID
    - 创建矿工，预览Gas消耗
    - 矿工报价，预览Gas消耗
    - 矿工报价
    - 获取签名支付凭证
    - 钱包余额查询

```
▼ package
    porcelain

▶ imports

▼+API : struct
    [embedded]
   +*plumbing.API : *plumbing.API
    [methods]
   +ChainBlockHeight(ctx context.Context) : *types.BlockHeight, error
   +CreatePayments(ctx context.Context, config CreatePaymentsParams) : *CreatePaymentsReturn, error
   +GetAndMaybeSetDefaultSenderAddress() : address.Address, error
   +MessagePoolWait(ctx context.Context, messageCount uint) : []*types.SignedMessage, error
   +MessageSendWithDefaultAddress(ctx context.Context, from, to address.Address, value *types.AttoFIL, gasPrice types.AttoFIL, gasLimit types.GasUnits, method string, params ...interface{}) : cid.Cid, error
   +MinerGetAsk(ctx context.Context, minerAddr address.Address, askID uint64) : minerActor.Ask, error
   +MinerGetOwnerAddress(ctx context.Context, minerAddr address.Address) : address.Address, error
   +MinerGetPeerID(ctx context.Context, minerAddr address.Address) : peer.ID, error
   +MinerPreviewCreate(ctx context.Context, fromAddr address.Address, pledge uint64, pid peer.ID, collateral *types.AttoFIL) : types.GasUnits, error
   +MinerPreviewSetPrice(ctx context.Context, from address.Address, miner address.Address, price *types.AttoFIL, expiry *big.Int) : types.GasUnits, error
   +MinerSetPrice(ctx context.Context, from address.Address, miner address.Address, gasPrice types.AttoFIL, gasLimit types.GasUnits, price *types.AttoFIL, expiry *big.Int) : MinerSetPriceResponse, error
   +PaymentChannelLs(ctx context.Context, fromAddr address.Address, payerAddr address.Address) : map[string]*paymentbroker.PaymentChannel, error
   +PaymentChannelVoucher(ctx context.Context, fromAddr address.Address, channel *types.ChannelID, amount *types.AttoFIL, validAt *types.BlockHeight) : *paymentbroker.PaymentVoucher, error
   +WalletBalance(ctx context.Context, address address.Address) : *types.AttoFIL, error
    [functions]
   +New(plumbing *plumbing.API) : *API
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
