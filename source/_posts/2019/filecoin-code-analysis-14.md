---
title: filecoin技术架构分析十四：filecoin源码分析之服务层链同步、共识协议及挖矿
permalink: filecoin-code-analysis-14
date: 2019-03-09 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---


我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十四章源码分析之服务层链同步、共识协议及挖矿。


<!-- more -->

> 分析基于的源码版本：go-filecoin master a0598a54(2019年3月9日)

##  chain同步

### 基础结构

- TipIndex 定义定义了tipset的基础结构及方法

```
▼ package
    chain

▼+TipIndex : struct
    [fields]
   -mu : sync.Mutex
    // 根据id来获取tipset及其状态根
   -tsasByID : tsasByTipSetID
    // 根据父块来获取tipset及其状态根
   -tsasByParentsAndHeight : map[string]tsasByTipSetID

    [methods]
    // 根据id来获取tipset及其状态根
   +Get(tsKey string) : *TipSetAndState, error
    // 根据父块来获取tipset及其状态根
   +GetByParentsAndHeight(pKey string, h uint64) : []*TipSetAndState, error
    // 根据Id判断是否有此tipset
   +Has(tsKey string) : bool
    // 根据父块判断是否有此tipset
   +HasByParentsAndHeight(pKey string, h uint64) : bool
    // 设置tipset和状态根
   +Put(tsas *TipSetAndState) : error
    [functions]
   +NewTipIndex() : *TipIndex

▼+TipSetAndState : struct
    [fields]
    // tipset
   +TipSet : types.TipSet
    // 相当于区块的root cid
   +TipSetStateRoot : cid.Cid
```

###  链同步

- chain同步的接口定义

```
location: chain/syncer.go

▼ package
    chain

▼+Syncer : interface
    [methods]
    // 处理新区块的接口定义
   +HandleNewBlocks(ctx context.Context, blkCids []cid.Cid) : error

   具体接口实现在location: chain/defalut_syncer.go中
```

- 特殊情况的错误

```
location: chain/reorg.go

    // 如果当前区块头不包含在最新的区块头之上时候，会报此错误
▼ functions
   +IsReorg(curHead types.TipSet, newChain []types.TipSet) : bool
```

### 链存储

- 其中
    - Readstore是一个通用接口
    - Store的设计基本是给ChainSync使用的

```
location: chain/store.go

▼ package
    chain

▼ constants
    // 用于发布新的区块头的主题"new-head"
   +NewHeadTopic

▼ variables
    // 创世块的key
   +GenesisKey

▼+ReadStore : interface
    [methods]
    // 获取历史区块，通过channel实现
   +BlockHistory(ctx context.Context, tips types.TipSet) : chan interface{}
    // 获取创世区块cid
   +GenesisCid() : cid.Cid
    // 通过cid获取具体的block
   +GetBlock(ctx context.Context, id cid.Cid) : *types.Block, error
    // 通过cid获取具体的block
   +GetTipSetAndState(ctx context.Context, tsKey string) : *TipSetAndState, error
    // 获取最新区块
   +Head() : types.TipSet
    // 最新区块变更事件
   +HeadEvents() : *pubsub.PubSub
    // 最新合约状态
   +LatestState(ctx context.Context) : state.Tree, error
    // 加载chain
   +Load(ctx context.Context) : error
    // 停止
   +Stop()

    // 这个接口只是chain同步使用
▼+Store : interface
    [embedded]
   +ReadStore
    [methods]
   +GetBlocks(ctx context.Context, ids types.SortedCidSet) : []*types.Block, error
   +GetTipSetAndStatesByParentsAndHeight(ctx context.Context, pTsKey string, h uint64) : []*TipSetAndState, error
   +HasAllBlocks(ctx context.Context, cs []cid.Cid) : bool
   +HasBlock(ctx context.Context, c cid.Cid) : bool
   +HasTipSetAndState(ctx context.Context, tsKey string) : bool
   +HasTipSetAndStatesWithParentsAndHeight(ctx context.Context, pTsKey string, h uint64) : bool
    // 存储并更新最新区块信息
   +PutTipSetAndState(ctx context.Context, tsas *TipSetAndState) : error
   +SetHead(ctx context.Context, s types.TipSet) : error
```

## consensus
- 主要功能
    - 提供创建选票方法，验证中奖选票方法,确定最终的tipset
    - 将合法的tipset消息取出，生效actor状态

```
▼ package
    consensus

▶ imports

▼ constants
   +ECPrM : uint64
   +ECV : uint64
   +LookBackParameter

▼ variables
   +AncestorRoundsNeeded
   +ErrInvalidBase
   +ErrStateRootMismatch
   +ErrUnorderedTipSets
   -log
   -ticketDomain : *big.Int

    // Expected实现EC共识
▼+Expected : struct
    [fields]
    // 全局功率表
   +PwrTableView : PowerTableView
   -bstore : blockstore.Blockstore
   -cstore : *hamt.CborIpldStore
   -genesisCid : cid.Cid
   -processor : Processor
   -verifier : proofs.Verifier
    [methods]
    // 比较两个tipset的权重
   +IsHeavier(ctx context.Context, a, b types.TipSet, aSt, bSt state.Tree) : bool, error
    // 建立新的tipset
   +NewValidTipSet(ctx context.Context, blks []*types.Block) : types.TipSet, error
    // 运行状态转换
    // 1 新区块到来的时候出发状态转换(chain sync逻辑)
    // 2 进入后判断tipset的有效性，包括验证选票是否中奖
    // 3 逐一执行消息，切换状态
   +RunStateTransition(ctx context.Context, ts types.TipSet, ancestors []types.TipSet, pSt state.Tree) : state.Tree, error
    // 计算tipset权重
   +Weight(ctx context.Context, ts types.TipSet, pSt state.Tree) : uint64, error
   -runMessages(ctx context.Context, st state.Tree, vms vm.StorageMap, ts types.TipSet, ancestors []types.TipSet) : state.Tree, error
   -validateBlockStructure(ctx context.Context, b *types.Block) : error
   -validateMining(ctx context.Context, st state.Tree, ts types.TipSet, parentTs types.TipSet) : error

▼+Processor : interface
    // 会被RunStateTransition间接掉用,进行状态切换(生效挖矿成功的tipset消息)
    [methods]
    // 从tipset中逐一取出block处理
   +ProcessBlock(ctx context.Context, st state.Tree, vms vm.StorageMap, blk *types.Block, ancestors []types.TipSet) : []*ApplicationResult, error
   +ProcessTipSet(ctx context.Context, st state.Tree, vms vm.StorageMap, ts types.TipSet, ancestors []types.TipSet) : *ProcessTipSetResponse, error

▼ functions
    // 与白皮书描述一致，按照存储功率出块，用以判断是否中奖
   +CompareTicketPower(ticket types.Signature, minerPower uint64, totalPower uint64) : bool
    // 产生随机挑战种子,针对时空证明
   +CreateChallengeSeed(parents types.TipSet, nullBlkCount uint64) : proofs.PoStChallengeSeed, error
    // 生成选票
    // 用上一个区块的时空证明+矿工地址（目前直接用的矿工地址,issue1054讨论中） 生成２５６bit哈希
   +CreateTicket(proof proofs.PoStProof, minerAddr address.Address) : []byte
    // 判断是否中奖,调用CompareTicketPower
   +IsWinningTicket(ctx context.Context, bs blockstore.Blockstore, ptv PowerTableView, st state.Tree, ticket types.Signature, miner address.Address) : bool, error
    // 实例化Expected
   +NewExpected(cs *hamt.CborIpldStore, bs blockstore.Blockstore, processor Processor, pt PowerTableView, gCid cid.Cid, verifier proofs.Verifier) : Protocol
   -init()

```

##  mining

###  挖矿的主要逻辑

- 1 不能将空块最为基准块
- 2 基于上一个Tipset信息（如果上一个为空块，必须找到空块之前高度最高的Tipset，并记录中间空块数据）和空块数母生成合法的时空证明挑战参数
- 3 生成时空证明
- 4 时空证明成功，调用共识协议创建奖票
- 5 如果奖票中奖，将未打包的消息打包区块

```
location: mining/working

//这里是挖矿逻辑的真正入口

// Mine implements the DefaultWorkers main mining function..
// The returned bool indicates if this miner created a new block or not.
func (w *DefaultWorker) Mine(ctx context.Context, base types.TipSet, nullBlkCount int, outCh chan<- Output) bool {
	log.Info("Worker.Mine")
	ctx = log.Start(ctx, "Worker.Mine")
	defer log.Finish(ctx)
    // 不能将空块作为基准块挖矿
	if len(base) == 0 {
		log.Warning("Worker.Mine returning because it can't mine on an empty tipset")
		outCh <- Output{Err: errors.New("bad input tipset with no blocks sent to Mine()")}
		return false
	}

	st, err := w.getStateTree(ctx, base)
	if err != nil {
		log.Errorf("Worker.Mine couldn't get state tree for tipset: %s", err.Error())
		outCh <- Output{Err: err}
		return false
	}

	log.Debugf("Mining on tipset: %s, with %d null blocks.", base.String(), nullBlkCount)
	if ctx.Err() != nil {
		log.Warningf("Worker.Mine returning with ctx error %s", ctx.Err().Error())
		return false
	}

    // 基于上一个基准Tipset以及空块数目生成Post随机挑战参数
	challenge, err := consensus.CreateChallengeSeed(base, uint64(nullBlkCount))
	if err != nil {
		outCh <- Output{Err: err}
		return false
	}

    // 生成时空证明
	prCh := createProof(challenge, w.createPoSTFunc)

	var proof proofs.PoStProof
	var ticket []byte
	select {
	case <-ctx.Done():
		log.Infof("Mining run on base %s with %d null blocks canceled.", base.String(), nullBlkCount)
		return false
	case prChRead, more := <-prCh:
		if !more {
			log.Errorf("Worker.Mine got zero value from channel prChRead")
			return false
		}
		copy(proof[:], prChRead[:])
        // 时空证明成功，调用共识协议创建奖票
		ticket = consensus.CreateTicket(proof, w.minerAddr)
	}

	// TODO: Test the interplay of isWinningTicket() and createPoSTFunc()
	// https://github.com/filecoin-project/go-filecoin/issues/1791
    // 调用共识协议确认是否中奖
	weHaveAWinner, err := consensus.IsWinningTicket(ctx, w.blockstore, w.powerTable, st, ticket, w.minerAddr)

	if err != nil {
		log.Errorf("Worker.Mine couldn't compute ticket: %s", err.Error())
		outCh <- Output{Err: err}
		return false
	}

	if weHaveAWinner {
        // 如果中奖将打包消息，生成区块
		next, err := w.Generate(ctx, base, ticket, proof, uint64(nullBlkCount))
		if err == nil {
			log.SetTag(ctx, "block", next)
			log.Debugf("Worker.Mine generates new winning block! %s", next.Cid().String())
		}
		outCh <- NewOutput(next, err)
		return true
	}

	return false
}
```

### 其他细节源码简析

- 消息队列（交易消息集）的处理 

```
location: mining/mqueue.go

▼ package
    mining

▶ imports

▼+MessageQueue : struct
    [fields]
   -senderQueues : queueHeap
    [methods]
    // 取出消息切片，即多条消息
   +Drain() : []*types.SignedMessage
   +Empty() : bool
    // 从队列取出一条消息
   +Pop() : *types.SignedMessage, bool
    [functions]
    // 实例化消息队列
   +NewMessageQueue(msgs []*types.SignedMessage) : MessageQueue

 -nonceQueue : []*types.SignedMessage

    // 一些队列的基本操作
    // 1 长度、push、pop功能
    // 2 Less主要是比较两条交易中的Gas价格，大家可以回头看看type中的消息定义,这里不赘述了
    // 3 为什么要提供Less接口，留给大家思索一下，熟悉以太坊的可能一眼就看出了
▼-queueHeap : []nonceQueue
    [methods]
   +Len() : int
   +Less(i, j int) : bool
   +Pop() : interface{}
   +Push(x interface{})
   +Swap(i, j int)
```

- 调度器
    - 入口
    - node实例会调用NewScheduler创建相关实例并启动挖矿

```
▼ package
    mining

▶ imports

▼ constants
   +MineDelayConversionFactor

▼-timingScheduler : struct
    [fields]
   -isStarted : bool
   -mineDelay : time.Duration
    // 查找权重最高的Tipset
   -pollHeadFunc : func() types.TipSet
    // 底层的挖矿逻辑，在下面会分析Worker
   -worker : Worker
    [methods]
    // 判断是否启动挖矿
   +IsStarted() : bool
    // 启动挖矿
   +Start(miningCtx context.Context) : chan Output, *sync.WaitGroup

▼+Scheduler : interface
    [methods]
   +IsStarted() : bool
   +Start(miningCtx context.Context) : chan Output, *sync.WaitGroup

▼ functions
   +MineOnce(ctx context.Context, w Worker, md time.Duration, ts types.TipSet) : Output, error
    // 实例化timingScheduler 
   +NewScheduler(w Worker, md time.Duration, f func() types.TipSet) : Scheduler
   -nextNullBlkCount(prevNullBlkCount int, prevBase, currBase types.TipSet) : int
```

- 打包区块
    - 具体见如下注释，可对应此查阅源码。

```
location: mining/block_generate.go

▼ package
    mining

▶ imports

▼ DefaultWorker* : ctype
    [methods]
    // 1 如果节点没有产生过有效存储，无法参与挖矿
    // 2 计算区块高度= 基准Tipset高度+空块数目
    // 3 取出未打包消息，调用vm执行,生成收据，并更新状态
    // 4 打包区块信息,返回
   +Generate(ctx context.Context, baseTipSet types.TipSet, ticket types.Signature, proof proofs.PoStProof, nullBlockCount uint64) : *types.Block, error
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
