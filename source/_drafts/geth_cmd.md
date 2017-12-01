---
title: Geth控制台使用实战及Web3.js使用
date: 2017-12-01 19:41:53
categories: 以太坊
tags:
    - Geth使用
    - Web3.js
author: Tiny熊
---

在开发以太坊去中心化应用，免不了和以太坊进行交互，那就离不开Web3。
Geth控制台（REPL）实现了所有的[web3 API](http://web3js.readthedocs.io/en/1.0/index.html)及[Admin API](https://github.com/ethereum/go-ethereum/wiki/Management-APIs#admin)，
使用好Geth就是必修课。结合[Geth命令用法](https://learnblockchain.cn/2017/11/29/geth_cmd_options/)阅读效果更佳。

<!-- more -->

## 写在前面
阅读本文之前，你需要对以太坊（区块链）有初步的了解，如果你不知道以太坊是什么，请先阅读[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)。
如果你在我的小专栏之外的地方阅读到本文，你可能只能阅读本文的节选，阅读完整全文请订阅小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)


## geth控制台初探 - 启动、退出
安装参考[智能合约开发环境搭建](https://learnblockchain.cn/2017/11/24/init-env/)
最简单启动方式如下：
```
$ geth console
```
geth控制台启动成功之后，可以看到**>**提示符。
退出输入exit

## geth 日志控制

### 重定向日志到文件
使用**geth console**启动是，会在当前的交互界面下时不时出现日志。
可以使用以下方式把日志输出到文件。
```
$ geth console 2>>geth.log
```

可以新开一个命令行终端输入以下命令查看日志：
```
$ tail -f geth.log
```

### 重定向另一个终端
也可以把日志重定向到另一个终端，先在想要看日志的终端输入：
```
$ tty
```
就可以获取到终端编号，如：/dev/ttys003
然后另一个终端使用：
```
$ geth console 2>> /dev/ttys003
```
启动geth, 这是日志就输出到另一个终端。
如果不想看到日志还可以重定向到空终端：
```
$ geth console 2>> /dev/null
```

### 日志级别控制
使用**--verbosity**可以控制日志级别，如不想看到日志还可以使用：
```
$ geth --verbosity 0 console
```

## 启动一个开发模式测试节点

```
geth --datadir /home/xxx/testNet --dev console
```
> 技巧：如果我们经常使用一个方式来启动，可以把命令存为一个bash脚本。
> ~/bin你可以放一些常用的脚本，并把~/bin加入到环境变量PATH里。


## 连接geth节点
另外一个启动geth的方法是连接到一个geth节点：
```
$ geth attach ipc:/some/custom/path
$ geth attach http://191.168.1.1:8545
$ geth attach ws://191.168.1.1:8546
```
如连接刚刚打开的开发模式节点使用：
```
geth attach ipc:testNet/geth.ipc
```

## 启动本地多节点连接集群
为了启动多个节点，需要先确保:
1. 每个节点都有不同的**--datadir**
2. 每个节点要运行在不同的端口，使用**--port**及**--rpcport**控制
3. 每个节点ipc唯一或禁用ipc，使用参数**--ipcpath**或**--ipcdisable**
4. 节点需要需要建立连接
先启动第一个节点
```
geth --datadir="test1" --ipcdisable --port 30301 --rpcport 8101 console 2>> test1.log
```
在另一个终端开启另一个节点：
```
geth --datadir="test2" --ipcdisable --port 30302 --rpcport 8102 console 2>> test2.log
```

分别查看节点信息
```
> net.peerCount
1
> admin.nodeInfo.enode
"enode://2f7683398c1......@192.168.1.3:30301"
```
使用admin.addPeer建立连接：
```
> admin.addPeer("enode://....")
true
```
参数是另一个节点的enode，返回true，说明成功建立连接。
再次查看节点数量:
```
> net.peerCount
2
```
admin模块下面再详细讲。

## 常用命令（API）使用
我们打开一个控制台后，会看到如下输出：
![](https://learnblockchain.cn/images/open_geth_eth.jpg)
modules代表了所有可以使用的模块：
```
modules: admin:1.0 clique:1.0 debug:1.0 eth:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 shh:1.0 txpool:1.0 web3:1.0
```
在交互式命令行里输入任何一个模块名，就会列出所有支持的属性和函数，如输入：
```
> eth
{
  accounts: ["0x856e604698f79cef417aab0c6d6e1967191dba43", "0x81c9fdc9910740cdc0debf90ce52a087e3ce014e"],
  blockNumber: 3,
  coinbase: "0x856e604698f79cef417aab0c6d6e1967191dba43",
  compile: {
    lll: function(),
    serpent: function(),
    solidity: function()
  },
  defaultAccount: undefined,
  defaultBlock: "latest",
  gasPrice: 1,
  hashrate: 0,
  mining: true,
  pendingTransactions: [],
  protocolVersion: "0x3f",
  syncing: false,
  call: function(),
  contract: function(abi),
  estimateGas: function(),
  filter: function(options, callback, filterCreationErrorCallback),
  getAccounts: function(callback),
  getBalance: function(),
  getBlock: function(),
  getBlockNumber: function(callback),
  getBlockTransactionCount: function(),
  getBlockUncleCount: function(),
  getCode: function(),
  getCoinbase: function(callback),
  getCompilers: function(),
  getGasPrice: function(callback),
  getHashrate: function(callback),
  getMining: function(callback),
  getPendingTransactions: function(callback),
  getProtocolVersion: function(callback),
  getRawTransaction: function(),
  getRawTransactionFromBlock: function(),
  getStorageAt: function(),
  getSyncing: function(callback),
  getTransaction: function(),
  getTransactionCount: function(),
  getTransactionFromBlock: function(),
  getTransactionReceipt: function(),
  getUncle: function(),
  getWork: function(),
  iban: function(iban),
  icapNamereg: function(),
  isSyncing: function(callback),
  namereg: function(),
  resend: function(),
  sendIBANTransaction: function(),
  sendRawTransaction: function(),
  sendTransaction: function(),
  sign: function(),
  signTransaction: function(),
  submitTransaction: function(),
  submitWork: function()
}
```
我们可以把模块名当成一个粗略帮助使用，帮助我们快速了解有哪些函数，更详细参数可进一步查看[官方文档](http://web3js.readthedocs.io/en/1.0/index.html)

下面列举几个常用模块（命令）的使用：
### 创建账号
```
> personal.newAccount()
> Passphrase:
> Repeat passphrase:
"0x5c19d5106c2937bc8f7a90dc0b589b22b6a2356a"
```
这时在对应的datadir的keystore文件夹下也会生成一个对应的keyfile文件，它的名称格式为UTC--时间--公钥地址，如：
```
UTC--2017-12-01T08-22-32.989797544Z--5c19d5106c2937bc8f7a90dc0b589b22b6a2356a
```
一定记住输入的密码并且保存备份好keyfile文件，在发起交易时，必须同时拥有keyfile和密码。如果丢失了keyfile或者忘记了对应的密码，那么就意味着丢失了账户中所有的以太币。
> 注意，不像中心化的服务，忘记密码后可以通过联系客户等方式找回，我们需要自己对安全负责。

### 转账-发送以太币
```
> var sender = eth.accounts[0];
> var receiver = eth.accounts[1];
> var amount = web3.toWei(0.01, "ether")
> eth.sendTransaction({from:sender, to:receiver, value: amount})
```
注意在花费以太币时，需要对账户进行解锁，解锁使用**personal.unlockAccount(account)**。

### miner模块：开始和停止挖矿
```
> miner.start()
true
> miner.stop()
true
```
miner.start()可以带参数指明并行的挖矿线程数
挖矿的奖励会发送到收钱（coinbase）地址，默认是第一个账号，可以使用
```
> eth.coinbase
"0x81c9fdc9910740cdc0debf90ce52a087e3ce014e"
```
获取收钱（coinbase）地址。
用`miner.setEtherbase(eth.accounts[1])`来设置收钱地址。


### admin模块
admin主要提供节点的管理功能，这里列几个常用API， 完整文档请参考官方文档[Admin API](https://github.com/ethereum/go-ethereum/wiki/Management-APIs#admin)
#### 节点的信息：admin.nodeInfo

```
> admin.nodeInfo
{
  enode: "enode://2f76833....@192.168.1.3:30301",
  id: "2f768339....",
  ip: "192.168.1.3",
  listenAddr: "[::]:30301",
  name: "Geth/v1.7.3-stable/darwin-amd64/go1.9.2",
  ports: {
    discovery: 30301,
    listener: 30301
  },
  protocols: {
    ...
  }
}
```
返回的信息有：enode(节点的Url,在连接节点的时候使用), id, ip, 监听端口，使用的协议等

#### admin.addPeer(enodde)
连接网络上的节点

#### admin.peers
```
> admin.peers
```
包含已连接节点信息的对象数组.

#### admin.startRPC
```
> admin.startRPC("127.0.0.1", 8545)
true
```
启动一个基于HTTP JSON RPC API服务器， 对应的是stopRPC()
startRPC用一下方式启动控制台的效果是一样的。
```
geth --rpc --rpcaddr 127.0.0.1 --rpcport 8545
```
## 启动本地多节点连接集群
为了启动多个节点，需要先确保:
1. 每个节点都有不同的**--datadir**
2. 每个节点要运行在不同的端口，使用**--port**及**--rpcport**控制
3. 每个节点ipc唯一或禁用ipc，使用参数**--ipcpath**或**--ipcdisable**
4. 节点需要需要建立连接
先启动第一个节点
```
geth --datadir="test1" --ipcdisable --port 30301 --rpcport 8101 console 2>> test1.log
```
在另一个终端开启另一个节点：
```
geth --datadir="test2" --ipcdisable --port 30302 --rpcport 8102 console 2>> test2.log
```

分别查看节点信息
```
> net.peerCount
1
> admin.nodeInfo.enode
"enode://2f7683398c1......@192.168.1.3:30301"
```
使用admin.addPeer建立连接：
```
> admin.addPeer("enode://....")
true
```
参数是另一个节点的enode，返回true，说明成功建立连接。
再次查看节点数量:
```
> net.peerCount
2
```
admin模块下面再详细讲。

## 常用命令（API）使用
我们打开一个控制台后，会看到如下输出：
![](https://learnblockchain.cn/images/open_geth_eth.jpg)
modules代表了所有可以使用的模块：
```
modules: admin:1.0 clique:1.0 debug:1.0 eth:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 shh:1.0 txpool:1.0 web3:1.0
```
在交互式命令行里输入任何一个模块名，就会列出所有支持的属性和函数，如输入：
```
> eth
{
  accounts: ["0x856e604698f79cef417aab0c6d6e1967191dba43", "0x81c9fdc9910740cdc0debf90ce52a087e3ce014e"],
  blockNumber: 3,
  coinbase: "0x856e604698f79cef417aab0c6d6e1967191dba43",
  compile: {
    lll: function(),
    serpent: function(),
    solidity: function()
  },
  defaultAccount: undefined,
  defaultBlock: "latest",
  gasPrice: 1,
  hashrate: 0,
  mining: true,
  pendingTransactions: [],
  protocolVersion: "0x3f",
  syncing: false,
  call: function(),
  contract: function(abi),
  estimateGas: function(),
  filter: function(options, callback, filterCreationErrorCallback),
  getAccounts: function(callback),
  getBalance: function(),
  getBlock: function(),
  getBlockNumber: function(callback),
  getBlockTransactionCount: function(),
  getBlockUncleCount: function(),
  getCode: function(),
  getCoinbase: function(callback),
  getCompilers: function(),
  getGasPrice: function(callback),
  getHashrate: function(callback),
  getMining: function(callback),
  getPendingTransactions: function(callback),
  getProtocolVersion: function(callback),
  getRawTransaction: function(),
  getRawTransactionFromBlock: function(),
  getStorageAt: function(),
  getSyncing: function(callback),
  getTransaction: function(),
  getTransactionCount: function(),
  getTransactionFromBlock: function(),
  getTransactionReceipt: function(),
  getUncle: function(),
  getWork: function(),
  iban: function(iban),
  icapNamereg: function(),
  isSyncing: function(callback),
  namereg: function(),
  resend: function(),
  sendIBANTransaction: function(),
  sendRawTransaction: function(),
  sendTransaction: function(),
  sign: function(),
  signTransaction: function(),
  submitTransaction: function(),
  submitWork: function()
}
```
我们可以把模块名当成一个粗略帮助使用，帮助我们快速了解有哪些函数，更详细参数可进一步查看[官方文档](http://web3js.readthedocs.io/en/1.0/index.html)

下面列举几个常用模块（命令）的使用：
### 创建账号
```
> personal.newAccount()
> Passphrase:
> Repeat passphrase:
"0x5c19d5106c2937bc8f7a90dc0b589b22b6a2356a"
```
这时在对应的datadir的keystore文件夹下也会生成一个对应的keyfile文件，它的名称格式为UTC--时间--公钥地址，如：
```
UTC--2017-12-01T08-22-32.989797544Z--5c19d5106c2937bc8f7a90dc0b589b22b6a2356a
```
一定记住输入的密码并且保存备份好keyfile文件，在发起交易时，必须同时拥有keyfile和密码。如果丢失了keyfile或者忘记了对应的密码，那么就意味着丢失了账户中所有的以太币。
> 注意，不像中心化的服务，忘记密码后可以通过联系客户等方式找回，我们需要自己对安全负责。

### 转账-发送以太币
```
> var sender = eth.accounts[0];
> var receiver = eth.accounts[1];
> var amount = web3.toWei(0.01, "ether")
> eth.sendTransaction({from:sender, to:receiver, value: amount})
```
注意在花费以太币时，需要对账户进行解锁，解锁使用**personal.unlockAccount(account)**。

### miner模块：开始和停止挖矿
```
> miner.start()
true
> miner.stop()
true
```
miner.start()可以带参数指明并行的挖矿线程数
挖矿的奖励会发送到收钱（coinbase）地址，默认是第一个账号，可以使用
```
> eth.coinbase
"0x81c9fdc9910740cdc0debf90ce52a087e3ce014e"
```
获取收钱（coinbase）地址。
用`miner.setEtherbase(eth.accounts[1])`来设置收钱地址。


### admin模块
admin主要提供节点的管理功能，这里列几个常用API， 完整文档请参考官方文档[Admin API](https://github.com/ethereum/go-ethereum/wiki/Management-APIs#admin)
#### 节点的信息：admin.nodeInfo

```
> admin.nodeInfo
{
  enode: "enode://2f76833....@192.168.1.3:30301",
  id: "2f768339....",
  ip: "192.168.1.3",
  listenAddr: "[::]:30301",
  name: "Geth/v1.7.3-stable/darwin-amd64/go1.9.2",
  ports: {
    discovery: 30301,
    listener: 30301
  },
  protocols: {
    ...
  }
}
```
返回的信息有：enode(节点的Url,在连接节点的时候使用), id, ip, 监听端口，使用的协议等

#### admin.addPeer(enodde)
连接网络上的节点

#### admin.peers
```
> admin.peers
```
包含已连接节点信息的对象数组.

#### admin.startRPC
```
> admin.startRPC("127.0.0.1", 8545)
true
```
启动一个基于HTTP JSON RPC API服务器， 对应的是stopRPC()
startRPC用一下方式启动控制台的效果是一样的。
```
geth --rpc --rpcaddr 127.0.0.1 --rpcport 8545
```

更多内容请前往区块链技术小专栏查看[全文链接](https://xiaozhuanlan.com/topic/5617843029)。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客