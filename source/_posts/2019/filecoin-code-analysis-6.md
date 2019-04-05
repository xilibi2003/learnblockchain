---
title: filecoin技术架构分析六:filecoin源码协议层分析之hello握手协议
permalink: filecoin-code-analysis-6
date: 2019-03-04 17:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---

我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第六章filecoin源码协议层分析之hello握手协议.

<!-- more -->

## 目的
- 处理节点上线后的区块同步握手。

## 源码信息

- version
    - master分支 619b0eb1（2019年３月２日）
- package
    - hello
- location
    - protocol/hello
    - node/node.go

## 源码分析
### 数据结构

- 定义协议名称

```
// Protocol is the libp2p protocol identifier for the hello protocol.
const protocol = "/fil/hello/1.0.0"
```

- 定义hello协议消息体结构
    - TipSet切片
    - TipSet高度
    - 创世区块cid

```
// Message is the data structure of a single message in the hello protocol.
type Message struct {
	HeaviestTipSetCids   []cid.Cid
	HeaviestTipSetHeight uint64
	GenesisHash          cid.Cid
}
```

- 同步回调函数类型定义

```
type syncCallback func(from peer.ID, cids []cid.Cid, height uint64)
```

- 获取Tipset函数类型定义

```
type getTipSetFunc func() types.TipSet
```

- Handler结构体,当连接到其他节点的时候，其一,会发送包含本节点信息的hello 消息给对端节点; 其二, 对端也会回复一个包含对端节点信息的消息体过来。
    - host 对应libp2p上的主机
    - 创世区块cid
    - 区块同步回调函数
    - 获取TipSet的函数

```
// Handler implements the 'Hello' protocol handler. Upon connecting to a new
// node, we send them a message containing some information about the state of
// our chain, and receive the same information from them. This is used to
// initiate a chainsync and detect connections to forks.
type Handler struct {
	host host.Host

	genesis cid.Cid

	// chainSyncCB is called when new peers tell us about their chain
	chainSyncCB syncCallback

	// getHeaviestTipSet is used to retrieve the current heaviest tipset
	// for filling out our hello messages.
	getHeaviestTipSet getTipSetFunc
}
```

- 错误的创世区块

```
// ErrBadGenesis is the error returned when a missmatch in genesis blocks happens.
var ErrBadGenesis = fmt.Errorf("bad genesis block")
```

-  以上基本是作为hello客户端的一些定义，以下作为hello服务端的一些定义

```
// New peer connection notifications
type helloNotify Handler

//　连接超时时间
const helloTimeout = time.Second * 10
```

### 方法
#### Handler 方法

- 流函数处理，接收远端节点的hello消息


```
func (h *Handler) handleNewStream(s net.Stream) {
	defer s.Close() // nolint: errcheck

    //获取远端节点实例
	from := s.Conn().RemotePeer()

	var hello Message
    // 读取流信息到hello结构体中
	if err := cbu.NewMsgReader(s).ReadMsg(&hello); err != nil {
		log.Warningf("bad hello message from peer %s: %s", from, err)
		return
	}

    // 调用processHelloMessage方法对接收到的消息进行处理
	switch err := h.processHelloMessage(from, &hello); err {
    // 如果创世区块不一样，关闭流连接退出，不予处理
	case ErrBadGenesis:
		log.Warningf("genesis cid: %s does not match: %s, disconnecting from peer: %s", &hello.GenesisHash, h.genesis, from)
		s.Conn().Close() // nolint: errcheck
		return
	case nil: // ok, noop
	default:
		log.Error(err)
	}
}
```

- 处理hello消息

```
func (h *Handler) processHelloMessage(from peer.ID, msg *Message) error {
    // 如果创世区块不一样，报错
	if !msg.GenesisHash.Equals(h.genesis) {
		return ErrBadGenesis
	}

    // 调用区块同步方法
    // 此回调函数实在node包实例化hello协议的时候中定义的
	h.chainSyncCB(from, msg.HeaviestTipSetCids, msg.HeaviestTipSetHeight)
	return nil
}
```

- 响应远端节点的连接，回复hello消息体 

```
func (h *Handler) getOurHelloMessage() *Message {
	heaviest := h.getHeaviestTipSet()
	height, err := heaviest.Height()
	if err != nil {
		panic("somehow heaviest tipset is empty")
	}

	return &Message{
		GenesisHash:          h.genesis,
		HeaviestTipSetCids:   heaviest.ToSortedCidSet().ToSlice(),
		HeaviestTipSetHeight: height,
	}
}

func (h *Handler) sayHello(ctx context.Context, p peer.ID) error {
	s, err := h.host.NewStream(ctx, p, protocol)
	if err != nil {
		return err
	}
	defer s.Close() // nolint: errcheck

    //获取本节点的hello消息体
	msg := h.getOurHelloMessage()

    //向远端节点发送消息体
	return cbu.NewMsgWriter(s).WriteMsg(&msg)
}
```

####  helloNotify方法

-  hello方法，返回一个handler实例

```
func (hn *helloNotify) hello() *Handler {
	return (*Handler)(hn)
}
```

- helloNotify实现了libp2p-net/interface.go中的Notifiee接口

```
func (hn *helloNotify) Connected(n net.Network, c net.Conn) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), helloTimeout)
		defer cancel()
		p := c.RemotePeer()
        // 有其他节点连接的时候调用sayHello,发送hello消息体
		if err := hn.hello().sayHello(ctx, p); err != nil {
			log.Warningf("failed to send hello handshake to peer %s: %s", p, err)
		}
	}()
}

func (hn *helloNotify) Listen(n net.Network, a ma.Multiaddr)      {}
func (hn *helloNotify) ListenClose(n net.Network, a ma.Multiaddr) {}
func (hn *helloNotify) Disconnected(n net.Network, c net.Conn)    {}
func (hn *helloNotify) OpenedStream(n net.Network, s net.Stream)  {}
func (hn *helloNotify) ClosedStream(n net.Network, s net.Stream)  {}
```

### 函数

- 创建hello实例

```
// New creates a new instance of the hello protocol and registers it to
// the given host, with the provided callbacks.
func New(h host.Host, gen cid.Cid, syncCallback syncCallback, getHeaviestTipSet getTipSetFunc) *Handler {
	hello := &Handler{
		host:              h,
		genesis:           gen,
		chainSyncCB:       syncCallback,
		getHeaviestTipSet: getHeaviestTipSet,
	}

    //设置流处理回调函数
	h.SetStreamHandler(protocol, hello.handleNewStream)

    //注册网络状态改变通知回调函数
	// register for connection notifications
	h.Network().Notify((*helloNotify)(hello))

	return hello
}



//上文中的helloNotify 实现了libp2p-net/interface.go中的Notifiee接口
// Notifiee is an interface for an object wishing to receive
// notifications from a Network.
type Notifiee interface {
	Listen(Network, ma.Multiaddr)      // called when network starts listening on an addr
	ListenClose(Network, ma.Multiaddr) // called when network stops listening on an addr
	Connected(Network, Conn)           // called when a connection opened
	Disconnected(Network, Conn)        // called when a connection closed
	OpenedStream(Network, Stream)      // called when a stream opened
	ClosedStream(Network, Stream)      // called when a stream closed

	// TODO
	// PeerConnected(Network, peer.ID)    // called when a peer connected
	// PeerDisconnected(Network, peer.ID) // called when a peer disconnected
}
```

###  实例化及业务逻辑

- location: node/node.go

- Node节点中定义了hello服务

```
type Node struct {
    ......

	HelloSvc     *hello.Handler
    ......
}
```

- 启动hello服务

```
// Start boots up the node.
func (node *Node) Start(ctx context.Context) error {
    ......

	// Start up 'hello' handshake service
    // 定义区块同步的回调函数
	syncCallBack := func(pid libp2ppeer.ID, cids []cid.Cid, height uint64) {
		// TODO it is possible the syncer interface should be modified to
		// make use of the additional context not used here (from addr + height).
		// To keep things simple for now this info is not used.
        // 触发调用会启动同步区块的动作
		err := node.Syncer.HandleNewBlocks(context.Background(), cids)
		if err != nil {
			log.Infof("error handling blocks: %s", types.NewSortedCidSet(cids...).String())
		}
	}
    //实例化hello服务
	node.HelloSvc = hello.New(node.Host(), node.ChainReader.GenesisCid(), syncCallBack, node.ChainReader.Head)

    ......
}
```

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
