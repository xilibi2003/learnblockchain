---
title: filecoin技术架构分析五:filecoin源码分析之协议层心跳协议
permalink: filecoin-code-analysis-5
date: 2019-03-04 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第五章filecoin源码分析之协议层心跳协议。


<!-- more -->

## 源码信息

- version
    - master分支 619b0eb1（2019年３月２日）
- package
    - metrics
- location
    - metrics/heartbeat.go
    - node/node.go

## 源码分析
### 数据结构

- 定义心跳协议名称以及连接超时时间

```
// HeartbeatProtocol is the libp2p protocol used for the heartbeat service
const (
	HeartbeatProtocol = "fil/heartbeat/1.0.0"
	// Minutes to wait before logging connection failure at ERROR level
	connectionFailureErrorLogPeriodMinutes = 10 * time.Minute
)
```

- 定义心跳信息结构
    - 节点的区块头
    - 节点的区块高度
    - 节点的昵称
    - 是否在区块同步中（ＴＯＤＯ）
    - 矿工地址（如果没有挖矿，这里为零地址）

```
// Heartbeat contains the information required to determine the current state of a node.
// Heartbeats are used for aggregating information about nodes in a log aggregator
// to support alerting and devnet visualization.
type Heartbeat struct {
	// Head represents the heaviest tipset the nodes is mining on
	Head string
	// Height represents the current height of the Tipset
	Height uint64
	// Nickname is the nickname given to the filecoin node by the user
	Nickname string
	// TODO: add when implemented
	// Syncing is `true` iff the node is currently syncing its chain with the network.
	// Syncing bool

	// Address of this node's active miner. Can be empty - will return the zero address
	MinerAddress address.Address
}
```

- 心跳服务结构体
    - 主机结构体：对应libp2p主机
    - 心跳配置
    - 区块头获取
    - 挖矿地址获取
    - stream锁
    - stream

```
// HeartbeatService is responsible for sending heartbeats.
type HeartbeatService struct {
	Host   host.Host
	Config *config.HeartbeatConfig

	// A function that returns the heaviest tipset
	HeadGetter func() types.TipSet

	// A function that returns the miner's address
	MinerAddressGetter func() address.Address

	streamMu sync.Mutex
	stream   net.Stream
}
```

- 定义心跳服务Option函数
    - 函数入参为心跳服务结构体,主要用于对心跳服务结构体传参或者解析
```
// HeartbeatServiceOption is the type of the heartbeat service's functional options.
type HeartbeatServiceOption func(service *HeartbeatService)
```

### 方法
- 获取心跳服务的stream实例

```
// Stream returns the HeartbeatService stream. Safe for concurrent access.
// Stream is a libp2p connection that heartbeat messages are sent over to an aggregator.
func (hbs *HeartbeatService) Stream() net.Stream {
	hbs.streamMu.Lock()
	defer hbs.streamMu.Unlock()
	return hbs.stream
}
```

- 设置心跳服务的stream实例

```
// SetStream sets the stream on the HeartbeatService. Safe for concurrent access.
func (hbs *HeartbeatService) SetStream(s net.Stream) {
	hbs.streamMu.Lock()
	defer hbs.streamMu.Unlock()
	hbs.stream = s
}
```

- 定时确认连接性，并调用运行心跳服务

```
// Start starts the heartbeat service by, starting the connection loop. The connection
// loop will attempt to connected to the aggregator service, once a successful
// connection is made with the aggregator service hearbeats will be sent to it.
// If the connection is broken the heartbeat service will attempt to reconnect via
// the connection loop. Start will not return until context `ctx` is 'Done'.
func (hbs *HeartbeatService) Start(ctx context.Context) {
	log.Debug("starting heartbeat service")

	rd, err := time.ParseDuration(hbs.Config.ReconnectPeriod)
	if err != nil {
		log.Errorf("invalid heartbeat reconnectPeriod: %s", err)
		return
	}

    //启动重连定时器
	reconTicker := time.NewTicker(rd)
	defer reconTicker.Stop()
	// Timestamp of the first connection failure since the last successful connection.
	// Zero initially and while connected.
	var failedAt time.Time
	// Timestamp of the last ERROR log (or of failure, before the first ERROR log).
	var erroredAt time.Time
	for {
		select {
		case <-ctx.Done():
			return
		case <-reconTicker.C:
            //重连定时周期到，重新连接
			if err := hbs.Connect(ctx); err != nil {
				// Logs once as a warning immediately on failure, then as error every 10 minutes.
				now := time.Now()
				logfn := log.Debugf
				if failedAt.IsZero() { // First failure since connection
					failedAt = now
					erroredAt = failedAt // Start the timer on raising to ERROR level
					logfn = log.Warningf
				} else if now.Sub(erroredAt) > connectionFailureErrorLogPeriodMinutes {
					logfn = log.Errorf
					erroredAt = now // Reset the timer
				}
				failureDuration := now.Sub(failedAt)
				logfn("Heartbeat service failed to connect for %s: %s", failureDuration, err)
				// failed to connect, continue reconnect loop
				continue
			}
			failedAt = time.Time{}

			// we connected, send heartbeats!
			// Run will block until it fails to send a heartbeat.
            //如果连接成功，运行心跳服务
			if err := hbs.Run(ctx); err != nil {
				log.Warning("disconnecting from aggregator, failed to send heartbeat")
				continue
			}
		}
	}
}
```


- 运行心跳服务

```
// Run is called once the heartbeat service connects to the aggregator. Run
// send the actual heartbeat. Run will block until `ctx` is 'Done`. An error will
// be returned if Run encounters an error when sending the heartbeat and the connection
// to the aggregator will be closed.
func (hbs *HeartbeatService) Run(ctx context.Context) error {
	bd, err := time.ParseDuration(hbs.Config.BeatPeriod)
	if err != nil {
		log.Errorf("invalid heartbeat beatPeriod: %s", err)
		return err
	}

    //启动心跳定时器
	beatTicker := time.NewTicker(bd)
	defer beatTicker.Stop()

    //通过encoder进行流写入
	// TODO use cbor instead of json
	encoder := json.NewEncoder(hbs.stream)
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-beatTicker.C:
        //心跳定时周期到，调用Beat方法获取心跳参数
			hb := hbs.Beat()
            //写入流，发起心跳
			if err := encoder.Encode(hb); err != nil {
                //发生错误会关闭流连接
				hbs.stream.Conn().Close() // nolint: errcheck
				return err
			}
		}
	}
}
```

- 获取心跳参数

```
// Beat will create a heartbeat.
func (hbs *HeartbeatService) Beat() Heartbeat {
	nick := hbs.Config.Nickname
	ts := hbs.HeadGetter()
	tipset := ts.ToSortedCidSet().String()
	height, err := ts.Height()
	if err != nil {
		log.Warningf("heartbeat service failed to get chain height: %s", err)
	}
	addr := hbs.MinerAddressGetter()
	return Heartbeat{
		Head:         tipset,
		Height:       height,
		Nickname:     nick,
		MinerAddress: addr,
	}
}
```

- 心跳流连接
```
// Connect will connects to `hbs.Config.BeatTarget` or returns an error
func (hbs *HeartbeatService) Connect(ctx context.Context) error {
	log.Debugf("Heartbeat service attempting to connect, targetAddress: %s", hbs.Config.BeatTarget)
	targetMaddr, err := ma.NewMultiaddr(hbs.Config.BeatTarget)
	if err != nil {
		return err
	}

	pid, err := targetMaddr.ValueForProtocol(ma.P_P2P)
	if err != nil {
		return err
	}

	peerid, err := peer.IDB58Decode(pid)
	if err != nil {
		return err
	}

	// Decapsulate the /p2p/<peerID> part from the target
	// /ip4/<a.b.c.d>/p2p/<peer> becomes /ip4/<a.b.c.d>
	targetPeerAddr, _ := ma.NewMultiaddr(
		fmt.Sprintf("/p2p/%s", peer.IDB58Encode(peerid)))
	targetAddr := targetMaddr.Decapsulate(targetPeerAddr)

	hbs.Host.Peerstore().AddAddr(peerid, targetAddr, pstore.PermanentAddrTTL)

    // 建立心跳服务流
	s, err := hbs.Host.NewStream(ctx, peerid, HeartbeatProtocol)
	if err != nil {
		log.Debugf("failed to open stream, peerID: %s, targetAddr: %s %s", peerid, targetAddr, err)
		return err
	}
	log.Infof("successfully to open stream, peerID: %s, targetAddr: %s", peerid, targetAddr)

    //设置流函数
	hbs.SetStream(s)
	return nil
}
```

### 函数
- 向心跳服务结构体传参,用于设置获取矿工地址函数

```
// WithMinerAddressGetter returns an option that can be used to set the miner address getter.
func WithMinerAddressGetter(ag func() address.Address) HeartbeatServiceOption {
	return func(service *HeartbeatService) {
		service.MinerAddressGetter = ag
	}
}
```
- 获取默认的矿工地址

```
func defaultMinerAddressGetter() address.Address {
	return address.Address{}
}
```

- 实例化心跳服务,具体的实例化在node包中实现。

```
// NewHeartbeatService returns a HeartbeatService
func NewHeartbeatService(h host.Host, hbc *config.HeartbeatConfig, hg func() types.TipSet, options ...HeartbeatServiceOption) *HeartbeatService {
	srv := &HeartbeatService{
		Host:               h,
		Config:             hbc,
		HeadGetter:         hg,
		MinerAddressGetter: defaultMinerAddressGetter,
	}

    // 设置心跳服务的获取矿工属性,这会覆盖到上面设置的默认矿工地址
	for _, option := range options {
		option(srv)
	}

	return srv
}
```

### 实例化及业务逻辑
- 主要由node调用,location:node/node.go,主要逻辑如下

- 在node的启动方法中，调用node.setupHeartbeatServices方法，建立心跳服务

```
// Start boots up the node.
func (node *Node) Start(ctx context.Context) error {
    ......

	if err := node.setupHeartbeatServices(ctx); err != nil {
		return errors.Wrap(err, "failed to start heartbeat services")
	}

	return nil
}
```

- 建立心跳服务,具体见如下注释

```
func (node *Node) setupHeartbeatServices(ctx context.Context) error {
    // 设置“矿工地址获取函数”
	mag := func() address.Address {
		addr, err := node.miningAddress()
		// the only error miningAddress() returns is ErrNoMinerAddress.
		// if there is no configured miner address, simply send a zero
		// address across the wire.
		if err != nil {
			return address.Address{}
		}
		return addr
	}

    // 存在心跳目标的时候，实例化心跳服务实例
	// start the primary heartbeat service
	if len(node.Repo.Config().Heartbeat.BeatTarget) > 0 {
        //调用metrics包中的建立心跳服务实例、以及启动心跳服务实例方法
		hbs := metrics.NewHeartbeatService(node.Host(), node.Repo.Config().Heartbeat, node.ChainReader.Head, metrics.WithMinerAddressGetter(mag))
		go hbs.Start(ctx)
	}

    // 确认是否用户有通过环境变量配置额外的心跳告警服务（自定义指向其他节点），根据用户配置的数目，拉起对应的多线程心跳服务。
	// check if we want to connect to an alert service. An alerting service is a heartbeat
	// service that can trigger alerts based on the contents of heatbeats.
	if alertTarget := os.Getenv("FIL_HEARTBEAT_ALERTS"); len(alertTarget) > 0 {
		ahbs := metrics.NewHeartbeatService(node.Host(), &config.HeartbeatConfig{
			BeatTarget:      alertTarget,
			BeatPeriod:      "10s",
			ReconnectPeriod: "10s",
			Nickname:        node.Repo.Config().Heartbeat.Nickname,
		}, node.ChainReader.Head, metrics.WithMinerAddressGetter(mag))
		go ahbs.Start(ctx)
	}
	return nil
}
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
