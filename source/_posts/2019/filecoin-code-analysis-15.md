---
title: filecoin技术架构分析之十五：filecoin源码分析之节点运行逻辑
permalink: filecoin-code-analysis-15
date: 2019-03-10 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---


我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第十五章源码分析之节点运行逻辑。


<!-- more -->

> 分析基于的源码版本：go-filecoin master a0598a54(2019年3月9日)

## 前提

- 我们在前面的章节已经经过了三个阶段的梳理分析
    - 概念阶段，包括概念、通用语言理解、开发网络使用
    - 顶层架构与概念的结合理解
    - 具体源码的简析，包括协议层、支撑包、内部api层、服务层

- 源码部分的command部分比较容易理解，就不单独文章赘述了，基本与内部api层都可以对应起来

- 现在再来看节点的运行逻辑应该会更加清晰了

##  filecoin节点运行逻辑简析

###  基本数据结构

```
▼ package
    node

▶ imports

▼ variables
   +ErrNoMinerAddress
   -filecoinDHTProtocol : dhtprotocol.ID
   -log

   // 创建具体的filecoin节点实例
▼+Config : struct
    [fields]
    // 设置区块时间
   +BlockTime : time.Duration
    // 配置节点是否转发
   +IsRelay : bool
    // libp2p选项
   +Libp2pOpts : []libp2p.Option
    // 在离线模式下，会关闭libp2p
   +OfflineMode : bool
    // 配置资源
   +Repo : repo.Repo
    // 配置区块奖励方法
   +Rewarder : consensus.BlockRewarder
    // 配置节点时空证明校验函数
   +Verifier : proofs.Verifier
    [methods]
    // 创建node实例
   +Build(ctx context.Context) : *Node, error
   -buildHost(ctx context.Context, makeDHT func(host host.Host) routing.IpfsRouting, error) : host.Host, error

 +ConfigOpt : func(*Config) error

▼+Node : struct
    [fields]
    // 确认最新区块，本地持久化并广播
   +AddNewlyMinedBlock : newBlockFunc
    // 订阅主题"/fil/blocks"
   +BlockSub : pubsub.Subscription
    // 块服务接口
   +Blockstore : bstore.Blockstore
    // 维持相关节点连接
   +Bootstrapper : *net.Bootstrapper
    // 读取区块信息
   +ChainReader : chain.ReadStore
    // 同时协议
   +Consensus : consensus.Protocol
    // 块交换,节点间的数据交换
   +Exchange : exchange.Interface
    // new-head 主题
   +HeaviestTipSetCh : chan interface{}
    // 新区块处理请求
   +HeaviestTipSetHandled : func()
    // hello服务
   +HelloSvc : *hello.Handler
    // 消息订阅
   +MessageSub : pubsub.Subscription
    // 挖矿调度
   +MiningScheduler : mining.Scheduler
    // 消息池操作
   +MsgPool : *core.MessagePool
    // 离线模式
   +OfflineMode : bool
   +OnlineStore : *hamt.CborIpldStore
    // 对应libp2p中的host
   +PeerHost : host.Host
    // libp2p中的ping service
   +Ping : *ping.PingService
    // 高层api
   +PorcelainAPI : *porcelain.API
    // 功率表
   +PowerTable : consensus.PowerTableView
    // 配置资源
   +Repo : repo.Repo
    // 检索客户端
   +RetrievalClient : *retrieval.Client
    // 检索矿工
   +RetrievalMiner : *retrieval.Miner
    // 路由,libp2p
   +Router : routing.IpfsRouting
    // 存储矿工
   +StorageMiner : *storage.Miner
    // 存储客户
   +StorageMinerClient : *storage.Client
    // 链同步
   +Syncer : chain.Syncer
    // 钱包管理
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
    // 创建矿工方法
   +CreateMiner(ctx context.Context, accountAddr address.Address, gasPrice types.AttoFIL, gasLimit types.GasUnits, pledge uint64, pid libp2ppeer.ID, collateral *types.AttoFIL) : *address.Address, error
   +GetBlockTime() : time.Duration
   +Host() : host.Host
    // 节点查找方法
   +Lookup() : lookup.PeerLookupService
   +MiningSignerAddress() : address.Address
   +MiningTimes() : time.Duration, time.Duration
    // 创建新的account地址，钱包地址
   +NewAddress() : address.Address, error
   +SectorBuilder() : sectorbuilder.SectorBuilder
   +SetBlockTime(blockTime time.Duration)
    // 启动节点
   +Start(ctx context.Context) : error
    // 启动挖矿
   +StartMining(ctx context.Context) : error
    // 停止节点
   +Stop(ctx context.Context)
    // 停止挖矿
   +StopMining(ctx context.Context)
   -addNewlyMinedBlock(ctx context.Context, b *types.Block)
   -cancelSubscriptions()
   -getLastUsedSectorID(ctx context.Context, minerAddr address.Address) : uint64, error
   -getMinerActorPubKey() : []byte, error
   -handleNewHeaviestTipSet(ctx context.Context, head types.TipSet)
   -handleNewMiningOutput(miningOutCh chan mining.Output)
   -handleSubscription(ctx context.Context, f pubSubProcessorFunc, fname string, s pubsub.Subscription, sname string)
   -isMining() : bool
   -miningAddress() : address.Address, error
   -miningOwnerAddress(ctx context.Context, miningAddr address.Address) : address.Address, error
   -saveMinerConfig(minerAddr address.Address, signerAddr address.Address) : error
   -setIsMining(isMining bool)
   -setupHeartbeatServices(ctx context.Context) : error
   -setupMining(ctx context.Context) : error
    [functions]
    // 调用Build创建node实例
   +New(ctx context.Context, opts ...ConfigOpt) : *Node, error

▼-blankValidator : struct
    [methods]
   +Select(_ string, _ [][]byte) : int, error
   +Validate(_ string, _ []byte) : error

 -newBlockFunc : func(context.Context, *types.Block)

 -pubSubProcessorFunc : func(ctx context.Context, msg pubsub.Message) error

▼ functions
   +BlockTime(blockTime time.Duration) : ConfigOpt
   +IsRelay() : ConfigOpt
   +Libp2pOptions(opts ...libp2p.Option) : ConfigOpt
   +OfflineMode(offlineMode bool) : ConfigOpt
   +RewarderConfigOption(rewarder consensus.BlockRewarder) : ConfigOpt
   +StartMining(ctx context.Context, node *Node) : error
   +VerifierConfigOption(verifier proofs.Verifier) : ConfigOpt
   -initSectorBuilderForNode(ctx context.Context, node *Node, sectorStoreType proofs.SectorStoreType) : sectorbuilder.SectorBuilder, error
   -initStorageMinerForNode(ctx context.Context, node *Node) : *storage.Miner, error
   -readGenesisCid(ds datastore.Datastore) : cid.Cid, error
```

###  创建filecoin节点实例

- 实例化filecoin节点,简析见如下添加的注释

```
// Build instantiates a filecoin Node from the settings specified in the config.
func (nc *Config) Build(ctx context.Context) (*Node, error) {
	// 创建内存资源实例
	if nc.Repo == nil {
		nc.Repo = repo.NewInMemoryRepo()
	}

	// 创建块服务实例
	bs := bstore.NewBlockstore(nc.Repo.Datastore())

	validator := blankValidator{}

	var peerHost host.Host
	var router routing.IpfsRouting

	// 带宽统计实例,加入libp2popts
	bandwidthTracker := p2pmetrics.NewBandwidthCounter()
	nc.Libp2pOpts = append(nc.Libp2pOpts, libp2p.BandwidthReporter(bandwidthTracker))

	// 非离线模式才启用libp2p
	if !nc.OfflineMode {
		makeDHT := func(h host.Host) (routing.IpfsRouting, error) {
			r, err := dht.New(
				ctx,
				h,
				dhtopts.Datastore(nc.Repo.Datastore()),
				dhtopts.NamespacedValidator("v", validator),
				dhtopts.Protocols(filecoinDHTProtocol),
			)
			if err != nil {
				return nil, errors.Wrap(err, "failed to setup routing")
			}
			router = r
			return r, err
		}

		var err error
		// 实例化非离线模式libp2p host
		peerHost, err = nc.buildHost(ctx, makeDHT)
		if err != nil {
			return nil, err
		}
	} else {
		// 离线模式处理
		router = offroute.NewOfflineRouter(nc.Repo.Datastore(), validator)
		peerHost = rhost.Wrap(noopLibP2PHost{}, router)
	}

	// ping服务实例
	// set up pinger
	pinger := ping.NewPingService(peerHost)

	// bitswap实例
	// set up bitswap
	nwork := bsnet.NewFromIpfsHost(peerHost, router)
	//nwork := bsnet.NewFromIpfsHost(innerHost, router)
	bswap := bitswap.New(ctx, nwork, bs)
	bservice := bserv.New(bs, bswap)

	cstOnline := hamt.CborIpldStore{Blocks: bservice}
	cstOffline := hamt.CborIpldStore{Blocks: bserv.New(bs, offline.Exchange(bs))}
	// 获取创世块cid
	genCid, err := readGenesisCid(nc.Repo.Datastore())
	if err != nil {
		return nil, err
	}

	// chain.Store实例以及功率表
	var chainStore chain.Store = chain.NewDefaultStore(nc.Repo.ChainDatastore(), &cstOffline, genCid)
	powerTable := &consensus.MarketView{}

	// 共识协议processor实例
	var processor consensus.Processor
	if nc.Rewarder == nil {
		processor = consensus.NewDefaultProcessor()
	} else {
		processor = consensus.NewConfiguredProcessor(consensus.NewDefaultMessageValidator(), nc.Rewarder)
	}

	// 共识协议实例
	var nodeConsensus consensus.Protocol
	if nc.Verifier == nil {
		nodeConsensus = consensus.NewExpected(&cstOffline, bs, processor, powerTable, genCid, &proofs.RustVerifier{})
	} else {
		nodeConsensus = consensus.NewExpected(&cstOffline, bs, processor, powerTable, genCid, nc.Verifier)
	}

	// 链同步，链读取，消息池实例
	// only the syncer gets the storage which is online connected
	chainSyncer := chain.NewDefaultSyncer(&cstOnline, &cstOffline, nodeConsensus, chainStore)
	chainReader, ok := chainStore.(chain.ReadStore)
	if !ok {
		return nil, errors.New("failed to cast chain.Store to chain.ReadStore")
	}
	msgPool := core.NewMessagePool()

	// Set up libp2p pubsub
	fsub, err := libp2pps.NewFloodSub(ctx, peerHost)
	if err != nil {
		return nil, errors.Wrap(err, "failed to set up pubsub")
	}

	// 钱包服务实例
	backend, err := wallet.NewDSBackend(nc.Repo.WalletDatastore())
	if err != nil {
		return nil, errors.Wrap(err, "failed to set up wallet backend")
	}
	fcWallet := wallet.New(backend)

	// 实例化高层api
	PorcelainAPI := porcelain.New(plumbing.New(&plumbing.APIDeps{
		Chain:        chainReader,
		Config:       cfg.NewConfig(nc.Repo),
		Deals:        strgdls.New(nc.Repo.DealsDatastore()),
		MsgPool:      msgPool,
		MsgPreviewer: msg.NewPreviewer(fcWallet, chainReader, &cstOffline, bs),
		MsgQueryer:   msg.NewQueryer(nc.Repo, fcWallet, chainReader, &cstOffline, bs),
		MsgSender:    msg.NewSender(fcWallet, chainReader, msgPool, consensus.NewOutboundMessageValidator(), fsub.Publish),
		MsgWaiter:    msg.NewWaiter(chainReader, bs, &cstOffline),
		Network:      net.New(peerHost, pubsub.NewPublisher(fsub), pubsub.NewSubscriber(fsub), net.NewRouter(router), bandwidthTracker),
		SigGetter:    mthdsig.NewGetter(chainReader),
		Wallet:       fcWallet,
	}))

	// 实例化node
	nd := &Node{
		blockservice: bservice,
		Blockstore:   bs,
		cborStore:    &cstOffline,
		OnlineStore:  &cstOnline,
		Consensus:    nodeConsensus,
		ChainReader:  chainReader,
		Syncer:       chainSyncer,
		PowerTable:   powerTable,
		PorcelainAPI: PorcelainAPI,
		Exchange:     bswap,
		host:         peerHost,
		MsgPool:      msgPool,
		OfflineMode:  nc.OfflineMode,
		PeerHost:     peerHost,
		Ping:         pinger,
		Repo:         nc.Repo,
		Wallet:       fcWallet,
		blockTime:    nc.BlockTime,
		Router:       router,
	}

	// Bootstrapping network peers.
	periodStr := nd.Repo.Config().Bootstrap.Period
	period, err := time.ParseDuration(periodStr)
	if err != nil {
		return nil, errors.Wrapf(err, "couldn't parse bootstrap period %s", periodStr)
	}

	// 实例化Bootstrapper,指定node的该方法
	// Bootstrapper maintains connections to some subset of addresses
	ba := nd.Repo.Config().Bootstrap.Addresses
	bpi, err := net.PeerAddrsToPeerInfos(ba)
	if err != nil {
		return nil, errors.Wrapf(err, "couldn't parse bootstrap addresses [%s]", ba)
	}
	minPeerThreshold := nd.Repo.Config().Bootstrap.MinPeerThreshold
	nd.Bootstrapper = net.NewBootstrapper(bpi, nd.Host(), nd.Host().Network(), nd.Router, minPeerThreshold, period)

	// 实例化链查找服务，指定node的该方法
	// On-chain lookup service
	defaultAddressGetter := func() (address.Address, error) {
		return nd.PorcelainAPI.GetAndMaybeSetDefaultSenderAddress()
	}
	nd.lookup = lookup.NewChainLookupService(nd.ChainReader, defaultAddressGetter, bs)

	return nd, nil
}
```

### 启动及停止filecoin节点

- 启动filecoin节点的流程概览

```
// Start boots up the node.
func (node *Node) Start(ctx context.Context) error {
	// 加载本地chain信息
	if err := node.ChainReader.Load(ctx); err != nil {
		return err
	}

	// 如果存在存储矿工，配置挖矿功能
	// Only set these up if there is a miner configured.
	if _, err := node.miningAddress(); err == nil {
		if err := node.setupMining(ctx); err != nil {
			log.Errorf("setup mining failed: %v", err)
			return err
		}
	}

	// 设置链同步回调函数
	// Start up 'hello' handshake service
	syncCallBack := func(pid libp2ppeer.ID, cids []cid.Cid, height uint64) {
		// TODO it is possible the syncer interface should be modified to
		// make use of the additional context not used here (from addr + height).
		// To keep things simple for now this info is not used.
		err := node.Syncer.HandleNewBlocks(context.Background(), cids)
		if err != nil {
			log.Infof("error handling blocks: %s", types.NewSortedCidSet(cids...).String())
		}
	}
	// 实例化hello握手协议
	node.HelloSvc = hello.New(node.Host(), node.ChainReader.GenesisCid(), syncCallBack, node.ChainReader.Head)

	// 实例化存储矿工协议
	cni := storage.NewClientNodeImpl(dag.NewDAGService(node.BlockService()), node.Host(), node.GetBlockTime())
	var err error
	node.StorageMinerClient, err = storage.NewClient(cni, node.PorcelainAPI)
	if err != nil {
		return errors.Wrap(err, "Could not make new storage client")
	}

	// 实例化检索客户及检索矿工协议
	node.RetrievalClient = retrieval.NewClient(node)
	node.RetrievalMiner = retrieval.NewMiner(node)

	// 订阅区块通知
	// subscribe to block notifications
	blkSub, err := node.PorcelainAPI.PubSubSubscribe(BlockTopic)
	if err != nil {
		return errors.Wrap(err, "failed to subscribe to blocks topic")
	}
	node.BlockSub = blkSub

	// 订阅消息通知
	// subscribe to message notifications
	msgSub, err := node.PorcelainAPI.PubSubSubscribe(msg.Topic)
	if err != nil {
		return errors.Wrap(err, "failed to subscribe to message topic")
	}
	node.MessageSub = msgSub

	cctx, cancel := context.WithCancel(context.Background())
	node.cancelSubscriptionsCtx = cancel

	// 启用新线程订阅区块及消息主题,设置handle回调
	go node.handleSubscription(cctx, node.processBlock, "processBlock", node.BlockSub, "BlockSub")
	go node.handleSubscription(cctx, node.processMessage, "processMessage", node.MessageSub, "MessageSub")

	// 启用新线程处理新的tipset事件
	node.HeaviestTipSetHandled = func() {}
	node.HeaviestTipSetCh = node.ChainReader.HeadEvents().Sub(chain.NewHeadTopic)
	go node.handleNewHeaviestTipSet(cctx, node.ChainReader.Head())

	// 非离线模式启动bootstapper服务
	if !node.OfflineMode {
		node.Bootstrapper.Start(context.Background())
	}

	// 启动心跳服务
	if err := node.setupHeartbeatServices(ctx); err != nil {
		return errors.Wrap(err, "failed to start heartbeat services")
	}

	return nil
}
```

- 停止filecoin节点的流程概览 

> 释放资源，停止相关服务

```
// Stop initiates the shutdown of the node.
func (node *Node) Stop(ctx context.Context) {
	node.ChainReader.HeadEvents().Unsub(node.HeaviestTipSetCh)
	// 停止挖矿
	node.StopMining(ctx)

	// 取消订阅
	node.cancelSubscriptions()
	// 停止链读取服务
	node.ChainReader.Stop()

	// 停止密封服务
	if node.SectorBuilder() != nil {
		if err := node.SectorBuilder().Close(); err != nil {
			fmt.Printf("error closing sector builder: %s\n", err)
		}
		node.sectorBuilder = nil
	}

	// 关闭host实例
	if err := node.Host().Close(); err != nil {
		fmt.Printf("error closing host: %s\n", err)
	}

	// 关闭资源实例
	if err := node.Repo.Close(); err != nil {
		fmt.Printf("error closing repo: %s\n", err)
	}

	// 关闭bootstqpper实例
	node.Bootstrapper.Stop()

	fmt.Println("stopping filecoin :(")
}
```


### 启动及停止挖矿

- 启动挖矿

```
// StartMining causes the node to start feeding blocks to the mining worker and initializes
// the SectorBuilder for the mining address.
func (node *Node) StartMining(ctx context.Context) error {
	// 如果在挖矿中，退出
	if node.isMining() {
		return errors.New("Node is already mining")
	}
	// 获取矿工地址
	minerAddr, err := node.miningAddress()
	if err != nil {
		return errors.Wrap(err, "failed to get mining address")
	}

	// 确保密封服务实例存在
	// ensure we have a sector builder
	if node.SectorBuilder() == nil {
		if err := node.setupMining(ctx); err != nil {
			return err
		}
	}

	// 获取地址
	minerOwnerAddr, err := node.miningOwnerAddress(ctx, minerAddr)
	minerSigningAddress := node.MiningSignerAddress()
	if err != nil {
		return errors.Wrapf(err, "failed to get mining owner address for miner %s", minerAddr)
	}

	blockTime, mineDelay := node.MiningTimes()

	// 实例化挖矿调度服务
	if node.MiningScheduler == nil {
		getStateFromKey := func(ctx context.Context, tsKey string) (state.Tree, error) {
			tsas, err := node.ChainReader.GetTipSetAndState(ctx, tsKey)
			if err != nil {
				return nil, err
			}
			return state.LoadStateTree(ctx, node.CborStore(), tsas.TipSetStateRoot, builtin.Actors)
		}
		getState := func(ctx context.Context, ts types.TipSet) (state.Tree, error) {
			return getStateFromKey(ctx, ts.String())
		}
		getWeight := func(ctx context.Context, ts types.TipSet) (uint64, error) {
			parent, err := ts.Parents()
			if err != nil {
				return uint64(0), err
			}
			// TODO handle genesis cid more gracefully
			if parent.Len() == 0 {
				return node.Consensus.Weight(ctx, ts, nil)
			}
			pSt, err := getStateFromKey(ctx, parent.String())
			if err != nil {
				return uint64(0), err
			}
			return node.Consensus.Weight(ctx, ts, pSt)
		}
		getAncestors := func(ctx context.Context, ts types.TipSet, newBlockHeight *types.BlockHeight) ([]types.TipSet, error) {
			return chain.GetRecentAncestors(ctx, ts, node.ChainReader, newBlockHeight, consensus.AncestorRoundsNeeded, consensus.LookBackParameter)
		}
		processor := consensus.NewDefaultProcessor()
		worker := mining.NewDefaultWorker(node.MsgPool, getState, getWeight, getAncestors, processor, node.PowerTable,
			node.Blockstore, node.CborStore(), minerAddr, minerOwnerAddr, minerSigningAddress, node.Wallet, blockTime)
		node.MiningScheduler = mining.NewScheduler(worker, mineDelay, node.ChainReader.Head)
	}

	// paranoid check
	// 启动挖矿服务
	if !node.MiningScheduler.IsStarted() {
		node.miningCtx, node.cancelMining = context.WithCancel(context.Background())
		outCh, doneWg := node.MiningScheduler.Start(node.miningCtx)

		node.miningDoneWg = doneWg
		node.AddNewlyMinedBlock = node.addNewlyMinedBlock
		node.miningDoneWg.Add(1)
		go node.handleNewMiningOutput(outCh)
	}

	// initialize a storage miner
	// 初始化存储矿工
	storageMiner, err := initStorageMinerForNode(ctx, node)
	if err != nil {
		return errors.Wrap(err, "failed to initialize storage miner")
	}
	node.StorageMiner = storageMiner

	// loop, turning sealing-results into commitSector messages to be included
	// in the chain
	// 新开线程处理，1 密封完成处理；2 接受停止挖矿消息
	go func() {
		for {
			select {
				// 密封完成处理
			case result := <-node.SectorBuilder().SectorSealResults():
				if result.SealingErr != nil {
					log.Errorf("failed to seal sector with id %d: %s", result.SectorID, result.SealingErr.Error())
				} else if result.SealingResult != nil {

					// TODO: determine these algorithmically by simulating call and querying historical prices
					gasPrice := types.NewGasPrice(0)
					gasUnits := types.NewGasUnits(300)

					val := result.SealingResult
					// This call can fail due to, e.g. nonce collisions. Our miners existence depends on this.
					// We should deal with this, but MessageSendWithRetry is problematic.
					_, err := node.PorcelainAPI.MessageSend(
						node.miningCtx,
						minerOwnerAddr,
						minerAddr,
						nil,
						gasPrice,
						gasUnits,
						"commitSector",
						val.SectorID,
						val.CommD[:],
						val.CommR[:],
						val.CommRStar[:],
						val.Proof[:],
					)
					if err != nil {
						log.Errorf("failed to send commitSector message from %s to %s for sector with id %d: %s", minerOwnerAddr, minerAddr, val.SectorID, err)
						continue
					}

					node.StorageMiner.OnCommitmentAddedToChain(val, nil)
				}
				// 挖矿取消
			case <-node.miningCtx.Done():
				return
			}
		}
	}()

	// schedules sealing of staged piece-data
	// 定时密封阶段性的碎片数据
	if node.Repo.Config().Mining.AutoSealIntervalSeconds > 0 {
		go func() {
			for {
				select {
					// 取消
				case <-node.miningCtx.Done():
					return
					// 定时密封
				case <-time.After(time.Duration(node.Repo.Config().Mining.AutoSealIntervalSeconds) * time.Second):
					log.Info("auto-seal has been triggered")
					if err := node.SectorBuilder().SealAllStagedSectors(node.miningCtx); err != nil {
						log.Errorf("scheduler received error from node.SectorBuilder.SealAllStagedSectors (%s) - exiting", err.Error())
						return
					}
				}
			}
		}()
	} else {
		log.Debug("auto-seal is disabled")
	}
	// 设置微挖矿状态
	node.setIsMining(true)

	return nil
}
```

- 停止挖矿

```
// StopMining stops mining on new blocks.
func (node *Node) StopMining(ctx context.Context) {
	node.setIsMining(false)

	// 取消挖矿
	if node.cancelMining != nil {
		node.cancelMining()
	}

	// 等待执行中的挖矿任务完成后结束
	if node.miningDoneWg != nil {
		node.miningDoneWg.Wait()
	}

	// TODO: stop node.StorageMiner
}
```

## 阶段性分析结束说明

> 至此笔者针对go-filecoin部分的分析快告一个小的段落了

> 文章因为时间的关系，书面出来只是将关键部分书面表达出来，更多的像是笔者的一个分析笔记,但是我相信对于想分析源码的朋友有一定帮助

> 后面会抽空补充一章总结，笔者在第4章中有提到过，薄读->厚读->再薄读,我们还需要一次薄读，来加深我们对filecoin的认识。


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
