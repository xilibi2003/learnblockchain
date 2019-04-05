---
title: filecoin技术架构分析九：filecoin源码分析之支撑包分析(1)
permalink: filecoin-code-analysis-9
date: 2019-03-06 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---


我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/2019/03/11/filecoin-code-analysis-0/)第九章filecoin源码分析之支撑包分析(1)。

<!-- more -->

## 目的
> 简析一些支撑包，便于后面分析的理解

##  编译相关
- bin目录：主要为编译用shell脚本
- bls-signatures:　通过cgo编译，导出库及头文件
- build: 编译相关
- util/version:版本检查
- scripts:相关脚本

## cborutil

-  对外提供功能
    -  读取流消息
    -  写入流消息
    -  主要被协议层使用

```
▼ package
    cborutil

▶ imports

▼ constants
   +MaxMessageSize

▼ variables
   +ErrMessageTooLarge

▼+MsgReader : struct
    [fields]
   -br : *bufio.Reader
    [methods]
   +ReadMsg(i interface{}) : error
    [functions]
   +NewMsgReader(r io.Reader) : *MsgReader
```

```
▼ package
    cborutil

▶ imports

▼+MsgWriter : struct
    [fields]
   -w : *bufio.Writer
    [methods]
   +WriteMsg(i interface{}) : error
    [functions]
   +NewMsgWriter(w io.Writer) : *MsgWriter
```

## address

-  对外提供功能
    - 地址相关操作功能
    - 实例化铸币地址、存储市场地址、支付通道地址
    - 实例化两个测试地址
    - 提供主网地址、测试网地址创建接口
    - 提供地址格式转换功能，包含22bytes与41bytes、切片字符串转换、打印。
    - 提供地址的合法性检查功能
- 地址格式
    - 要与id区分开，id用的是ipfs中的cid,而地址则是filecoin独立定义的。
    - 22 bytes地址：包含1byte网络类型、1byte地址版本、20bytes哈希
    - 41 bytes地址：包含2bytes网络类型、1byte地址版本、32bytes编码值、6bytes校验和
    - 用命令显示的是41bytes格式的地址，address包提供了22bytes与41bytes地址的转换接口

```
location: address/constants.go

▼ package
    address

▶ imports

▼ constants
    // Base32编码的字符集
   +Base32Charset
    // 地址的哈希部分，目前为20 bytes
   +HashLength, 20bytes，160bit
    // 地址长度,为HashLength+1+1= 22 bytes
   +Length
    // 地址格式的版本定义：当前为0
   +Version : byte

▼ variables
    // 基于Base32Charset的Base32实例,用于编解码
   +Base32
    // Base32 Reverse集合
   +Base32CharsetReverse
    // 铸币地址,基于"filecoin"哈希生成
   +NetworkAddress : Address
    // 支付通道地址
   +PaymentBrokerAddress : Address
    // 存储市场地址
   +StorageMarketAddress : Address
    // 测试地址
   +TestAddress : Address
    // 测试地址
   +TestAddress2 : Address

▼ functions
   -init()
```

```
location: address/address.go

▼ package
    address

▶ imports

▼ constants
   +Mainnet : Network
   +Testnet

▼ variables
    // 错误提示
   +ErrInvalidBytes
   +ErrUnknownNetwork
   +ErrUnknownVersion
   -generator
    // 配置输入哈希长度20bytes
   -hashConfig

   // Address为22字节字符串
▼+Address : []byte
    [methods]
    // 转换为编码前地址切片输出
   +Bytes() : []byte
    // 判断地址是否为空
   +Empty() : bool
    // 打印地址信息
   +Format(f fmt.State, c rune)
    // 输出地址中的20bytes哈希值
   +Hash() : []byte
    // 转换为编码后地址切片输出
   +MarshalText() : []byte, error
    // 输出地址的网络类型
   +Network() : Network
    // 转换为41bytes的编码输出
    // 2(网络类型)+1(地址版本)+32(base32编码)+6(base32校验位)
   +String() : string
    // 编码后地址切片输出转换为字符
   +UnmarshalText(in []byte) : error
    // 获取地址版本号
   +Version() : byte

    // 类型定义
 +Network : byte

▼ functions
    // 采用blake2b-160再次哈希
   +Hash(input []byte) : []byte
    // 生成测试网络地址,输入为原始哈希,会执行blake2b-160再次哈希
   +MakeTestAddress(input string) : Address
    // 通过字符串网络类型转换为byte网络类型
    // fc:主网转化为0
    // tf:测试网化为1
   +NetworkFromString(input string) : Network, error
    // 通过byte网络类型转换为字符串网络类型
    // 0:主网转化为fc
    // 1:测试网化为tf
   +NetworkToString(n Network) : string
    // 构建新地址：输入为原始20bytes哈希+网络类型+地址版本
   +New(network Network, hash []byte) : Address
    // 构建新地址：输入为22bytes的原始切片
   +NewFromBytes(raw []byte) : Address, error
    // 通过41bytes的字串串生成22bytes的原始地址
   +NewFromString(s string) : Address, error
    // 构建新地址：输入为原始20bytes哈希,调用New
   +NewMainnet(hash []byte) : Address
    // 生成测试网络地址,输入为原始哈希再次哈希,被MakeTestAddress调用
   +NewTestnet(hash []byte) : Address
    // 校验41bytes地址的合法性
   +ParseError(addr string) : error

    // base32编码校验码生成，结果为6bytes
   -createChecksum(hrp string, data []byte) : []byte
    // 解码
   -decode(addr string) : string, byte, []byte, error
    // 编码
   -encode(hrp string, version byte, data []byte) : string, error
   -hrpExpand(hrp string) : []byte
   -init()
   -polymod(values []byte) : uint32
    // 校验和验证
   -verifyChecksum(hrp string, data []byte) : bool

```

```
location: address/set.go

▼ package
    address

▶ imports

▼ variables
   -addrSetEntry

   // 地址集合
 +Set : map[Address]

▼ functions
   -init()
```

##  config

-  对外提供功能
    - 提供对内存中配置的实例化操作
    - 对具体实例的设置和读取
    - 对配置文件的读写
    - 包含API、启动、数据存储、网络连接、挖矿、钱包、心跳相关配置

```
▼ package
    config

▶ imports

▼ variables
    // 对特定参数的合法性校验规则集合
    // 1 目前只是限定昵称为字符
   +Validators

▼+APIConfig : struct
    [fields]
    // 是否允许跨域请求
   +AccessControlAllowCredentials : bool
    // 允许的方法列表
   +AccessControlAllowMethods : []string
    // 允许的元列表
   +AccessControlAllowOrigin : []string
    // 地址
   +Address : string
    [functions]
    // 实例化APIconfig
   -newDefaultAPIConfig() : *APIConfig

▼+BootstrapConfig : struct
    [fields]
    // 启动地址集合
   +Addresses : []string
    // 最小节点阈值
   +MinPeerThreshold : int
    // 启动时间阈值，目前为10s
   +Period : string
    [functions]
    //　实例化启动配置的接口
   -newDefaultBootstrapConfig() : *BootstrapConfig

    // 存储在内存之中的filecoin配置
▼+Config : struct
    [fields]
    // API相关
   +API : *APIConfig
    // 启动相关
   +Bootstrap : *BootstrapConfig
    // 数据存储相关
   +Datastore : *DatastoreConfig
    // 心跳相关
   +Heartbeat : *HeartbeatConfig
    // 挖矿相关
   +Mining : *MiningConfig
    // 网络连接相关
   +Swarm : *SwarmConfig
    // 钱包相关
   +Wallet : *WalletConfig
    [methods]
    // 获取配置，参数为API的上述子结构
   +Get(key string) : interface{}, error
    // 设置配置，参数为API的上述子结构
   +Set(dottedKey string, jsonString string) : error
    // 写对应目录的配置文件
   +WriteFile(file string) : error
    [functions]
    // 实例化配置，会调用各字节口的实例化
   +NewDefaultConfig() : *Config
    // 读对应目录的配置文件
   +ReadFile(file string) : *Config, error

▼+DatastoreConfig : struct
    [fields]
    // 路径
   +Path : string
    // 类型
   +Type : string
    [functions]
   -newDefaultDatastoreConfig() : *DatastoreConfig

▼+HeartbeatConfig : struct
    [fields]
    // 心跳周期
   +BeatPeriod : string
    // 心跳目标
   +BeatTarget : string
    // 昵称
   +Nickname : string
    // 重连时间
   +ReconnectPeriod : string
    [functions]
   -newDefaultHeartbeatConfig() : *HeartbeatConfig

▼+MiningConfig : struct
    [fields]
    // 自动密封间隔周期
   +AutoSealIntervalSeconds : uint
    // 区块签名地址
   +BlockSignerAddress : address.Address
    // 矿工地址
   +MinerAddress : address.Address
    // 存储报价
   +StoragePrice : *types.AttoFIL
    [functions]
   -newDefaultMiningConfig() : *MiningConfig

▼+SwarmConfig : struct
    [fields]
    // 地址
   +Address : string
    // 转发地址
   +PublicRelayAddress : string
    [functions]
   -newDefaultSwarmConfig() : *SwarmConfig

▼+WalletConfig : struct
    [fields]
    // 默认钱包地址
   +DefaultAddress : address.Address
    [functions]
   -newDefaultWalletConfig() : *WalletConfig

▼ functions
   -validate(dottedKey string, jsonString string) : error
   -validateLettersOnly(key string, value string) : error
```

##  crypto

-  对外提供功能
    - 生成私钥接口
    - 签名接口
    - 私钥转公钥接口
    - 从签名消息中提取公钥接口
    - 验证消息合法性接口
    - 主要用于地址生成、钱包相关

```
▼ package
    crypto

▶ imports

▼ constants
    // 定义私钥长度32位
   +PrivateKeyBytes
    // 定义公钥长度65位
   +PublicKeyBytes

▼ functions
    // 从签名消息中恢复公钥
   +EcRecover(msg, signature []byte) : []byte, error
    // 比较私钥是否相同
   +Equals(sk, other []byte) : bool
    // 生成私钥,调用GenerateKeyFromSeed
   +GenerateKey() : []byte, error
    // 生成私钥
   +GenerateKeyFromSeed(seed io.Reader) : []byte, error
    // 由私钥得到公钥
   +PublicKey(sk []byte) : []byte
    // 使用私钥签名
   +Sign(sk, msg []byte) : []byte, error
    // 验证签名合法性
   +Verify(pk, msg, signature []byte) : bool
   ```

##  util/convert

- 提供功能
    ToCid:转cid功能

## functional-tests

- 测试脚本

##  flags

- 通过ldflags注入,表示git提交版本号

```
var Commit string
```

##  fixtures

- 提供功能
    - 定义不同网络启动相关地址
    - 预先分配初始网络状态，比如代币的预先分配

```
▼ package
    fixtures

▶ imports

▼ constants
    // 开发人员，开发网络启动相关地址
   -nightlyFilecoinBootstrap0 : string
   -nightlyFilecoinBootstrap1 : string
   -nightlyFilecoinBootstrap2 : string
   -nightlyFilecoinBootstrap3 : string
   -nightlyFilecoinBootstrap4 : string
    // 测试网络启动相关地址
   -testFilecoinBootstrap0 : string
   -testFilecoinBootstrap1 : string
   -testFilecoinBootstrap2 : string
   -testFilecoinBootstrap3 : string
   -testFilecoinBootstrap4 : string
    // 用户，开发网络启动相关地址
   -userFilecoinBootstrap0 : string
   -userFilecoinBootstrap1 : string
   -userFilecoinBootstrap2 : string
   -userFilecoinBootstrap3 : string
   -userFilecoinBootstrap4 : string

▼ variables
    // 开发人员，开发网络启动相关地址
   +DevnetNightlyBootstrapAddrs
    // 测试网络启动相关地址
   +DevnetTestBootstrapAddrs
    // 用户，开发网络启动相关地址
   +DevnetUserBootstrapAddrs
    // 预生成测试网络地址集合
   +TestAddresses : []string
    // 预生成测试矿工账户集合
   +TestMiners : []string
    // 预生成地址的私钥
   -testKeys : []string

▼-detailsStruct : struct
    [fields]
    // 创世区块cid
   +GenesisCid : cid.Cid
   +Keys : []*types.KeyInfo
   +Miners : []

▼ functions
    // 预生成的Key文件路径
   +KeyFilePaths() : []string

    // 预生成信息
    // 1 解析gen.json文件到detailsStruct结构体
    // 2 追击Miners信息到TestMiners中
   -init()
```
- 如下为gen.json文件,可据此预先给特定矿工分配代币

```
{
  "keys": 5,
  "preAlloc": [
    "1000000000000",
    "1000000000000",
    "1000000000000",
    "1000000000000",
    "1000000000000"
  ],
  "miners": [{
    "owner": 0,
    "power": 1
  }]
}
```

##  filnet

- 提供功能
    - 节点启动
    - 定期检查连接节点，如果数量不够会链接随机节点

```
location: filnet/address.go

▼ package
    filnet

▼ imports
    gx/ipfs/QmNTCey11oxhb1AxDnQBRHtdhap6Ctud872NjAYPYYXPuc/go-multiaddr
    gx/ipfs/QmRhFARzTHcFh8wUxwN5KvyTGq73FLC65EfFAhz8Ng7aGb/go-libp2p-peerstore

▼ functions
    // 节点id转换为完整的节点信息，包括所有的多地址格式
   +PeerAddrsToPeerInfos(addrs []string) : []pstore.PeerInfo, error
```

```
location: filnet/bootstrap.go

▼ package
    filnet

▶ imports

▼ variables
   -log

▼+Bootstrapper : struct
    [fields]
    // 对应bootstrap
   +Bootstrap : func([]peer.ID)
    // 连接超时时间，用于连接随机节点
   +ConnectionTimeout : time.Duration
    // 最小连接节点数量阈值
   +MinPeerThreshold : int
    // 定时检查连接节点数量,小于阈值会处理
   +Period : time.Duration
    // 随机节点切片
   -bootstrapPeers : []pstore.PeerInfo
   -cancel : context.CancelFunc
   -ctx : context.Context
   -d : inet.Dialer
   -dhtBootStarted : bool
   -h : host.Host
   -r : routing.IpfsRouting
   -ticker : *time.Ticker
    [methods]
    // 定时调用Bootstrap 检查连接节点数量,小于阈值会处理
   +Start(ctx context.Context)
    // 停止节点
   +Stop()
    // 如果启动节点不够，将会尝试连接随机节点。
   -bootstrap(currentPeers []peer.ID)
    [functions]
    // 实例化
   +NewBootstrapper(bootstrapPeers []pstore.PeerInfo, h host.Host, d inet.Dialer, r routing.IpfsRouting, minPeer int, period time.Duration) : *Bootstrapper

▼ functions
   -hasPID(pids []peer.ID, pid peer.ID) : bool
```


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
