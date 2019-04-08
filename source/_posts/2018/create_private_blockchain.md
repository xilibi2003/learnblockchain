---
title: 如何搭建以太坊私有链
permalink: create_private_blockchain
date: 2018-03-18 20:05:59
categories: 
    - 以太坊
    - 私有链
tags:
    -  以太坊 
    -  私有链
author: 被打劫的强盗
---

在开发以太坊时，很多时候需要搭建一条以太坊私有链，通过本文一起看看如何在Mac上进行搭建。

<!-- more -->
## 写在前面
阅读本文前，你应该对以太坊语言有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

## go-ethereum客户端安装
Go-ethereum客户端通常被称为Geth，它是个命令行界面，执行在Go上实现的完整以太坊节点。Geth得益于Go语言的多平台特性，支持在多个平台上使用(比如Windows、Linux、Mac)。Geth是以太坊协议的具体落地实现，通过Geth，你可以实现以太坊的各种功能，如账户的新建编辑删除，开启挖矿，ether币的转移，智能合约的部署和执行等等。所以，我们选择geth工具来进行开发。由于本人是mac，所以优先使用mac进行开发啦。mac中geth安装如下：

```
brew tap ethereum/ethereum
brew install ethereum
```

检查是否安装成功

```
geth --help
```

如果输出一些帮助提示命令，则说明安装成功。
其他平台可参考[Geth 安装](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
## 搭建私有链
以太坊支持自定义创世区块，要运行私有链，我们就需要定义自己的创世区块，创世区块信息写在一个json格式的配置文件中。首先将下面的内容保存到一个json文件中，例如genesis.json。
json文件内容如下:

```json
{
  "config": {
        "chainId": 10, 
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
  "alloc"      : {},
  "coinbase"   : "0x0000000000000000000000000000000000000000",
  "difficulty" : "0x20000",
  "extraData"  : "",
  "gasLimit"   : "0x2fefd8",
  "nonce"      : "0x0000000000000042",
  "mixhash"    : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp"  : "0x00"
}
```

## 初始化：写入创世区块
准备好创世区块json配置文件后，需要初始化区块链，将上面的创世区块信息写入到区块链中。首先要新建一个目录data0用来存放区块链数据(其实，这个目录data0就相当于一个根节点。当我们基于genesis.json生成根节点后，其他人就可以来连接此根节点，从而能进行交易)。data0目录结构如图所示：

![](https://img.learnblockchain.cn/2018/create_private_blockchain_1.png!wl)

接下来进入privatechain目录中，执行初始化命令：

```
cd privatechain
geth --datadir data0 init genesis.json
```

上面的命令的主体是 geth init，表示初始化区块链，命令可以带有选项和参数，其中--datadir选项后面跟一个目录名，这里为 data0，表示指定数据存放目录为 data0， genesis.json是init命令的参数。

运行上面的命令，会读取genesis.json文件，根据其中的内容，将创世区块写入到区块链中。如果看到log信息中含有`Successfully wrote genesis state`字样，说明初始化成功。

初始化成功后的目录如下：
![](https://img.learnblockchain.cn/2018/create_private_blockchain_2.png!wl)
其中geth/chaindata中存放的是区块数据，keystore中存放的是账户数据。

## 启动私有链节点
初始化完成后，就有了一条自己的私有链，之后就可以启动自己的私有链节点并做一些操作，在终端中输入以下命令即可启动节点：

```
geth --datadir data0 --networkid 1108 console
```

上面命令的主体是geth console，表示启动节点并进入交互式控制台，--datadir选项指定使用data0作为数据目录，--networkid选项后面跟一个数字，这里是1108，表示指定这个私有链的网络id为1108。网络id在连接到其他节点的时候会用到，以太坊公网的网络id是1，为了不与公有链网络冲突，运行私有链节点的时候要指定自己的网络id(上面命令可能会运行失败，我直接重启mac，再进入到privateChain目录中，简单粗暴)。

运行上面的命令后，就启动了区块链节点并进入了Javascript Console：
![](https://img.learnblockchain.cn/2018/create_private_blockchain_3.png!wl)
这是一个交互式的Javascript执行环境，在这里面可以执行Javascript代码，其中>是命令提示符。在这个环境里也内置了一些用来操作以太坊的Javascript对象，可以直接使用这些对象。这些对象主要包括：

**eth：**包含一些跟操作区块链相关的方法
**net：**包含以下查看p2p网络状态的方法
**admin：**包含一些与管理节点相关的方法
**miner：**包含启动&停止挖矿的一些方法
**personal：**主要包含一些管理账户的方法
**txpool：**包含一些查看交易内存池的方法
**web3：**包含了以上对象，还包含一些单位换算的方法

## 玩转Javascript Console
进入以太坊Javascript Console后，就可以使用里面的内置对象做一些操作，这些内置对象提供的功能很丰富，比如查看区块和交易、创建账户、挖矿、发送交易、部署智能合约等。接下来介绍几个常用功能，下面的操作中，前面带>的表示在Javascript Console中执行的命令。

### 创建账户
前面只是搭建了私有链，并没有自己的账户，可以在js console中输入eth.accounts来验证：

```
> eth.accounts
[]
```

此时没有账户，接下来使用personal对象来创建一个账户：

```
> personal.newAccount()
> Passphrase:
> Repeat passphrase:
"0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f"
```

Passphrase其实就是密码的意思，输入两次密码后，就创建了一个账户。再次执行命令:

```
> personal.newAccount()
> Passphrase:
> Repeat passphrase:
"0x46b24d04105551498587e3c6ce2c3341d5988938"
```

这时候再去看账户，就有两个了。

```
> eth.accounts
["0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f", "0x46b24d04105551498587e3c6ce2c3341d5988938"]
```

账户默认会保存在数据目录的keystore文件夹中。查看目录结构，发现data0/keystore中多了两个文件，这两个文件就对应刚才创建的两个账户，这是json格式的文本文件，可以打开查看，里面存的是私钥经过密码加密后的信息。

![](https://img.learnblockchain.cn/2018/create_private_blockchain_4.png!wl)
json文件中信息格式如下：

```
{
  "address": "4a3b0216e1644c1bbabda527a6da7fc5d178b58f",
  "crypto": {
    "cipher": "aes-128-ctr",
    "ciphertext": "238d6d48126b762c8f13e84622b1bbb7713f7244c2f24555c99b76396fae8355",
    "cipherparams": {
      "iv": "d0f5a3d3e6c1eeec77bf631bc938725d"
    },
    "kdf": "scrypt",
    "kdfparams": {
      "dklen": 32,
      "n": 262144,
      "p": 1,
      "r": 8,
      "salt": "70dc72c4eb63bea50f7637d9ff85bb53f6ca8ace17f4245feae9c0bc9abaad82"
    },
    "mac": "bd7fc0c937c39f1cbbf1ca654c33b53d7f9c644c6dacfeefe1641d2f3decea04"
  },
  "id": "57803d82-0cd4-4a78-9c29-9f9252fdcf60",
  "version": 3
}
```

### 查看账户余额
eth对象提供了查看账户余额的方法：

```
> eth.getBalance(eth.accounts[0])
0
> eth.getBalance(eth.accounts[1])
0
```

目前两个账户的以太币余额都是0，要使账户有余额，可以从其他账户转账过来，或者通过挖矿来获得以太币奖励。
### 启动&停止挖矿
通过miner.start()来启动挖矿：

```
> miner.start(10)
```

其中start的参数表示挖矿使用的线程数。第一次启动挖矿会先生成挖矿所需的DAG文件，这个过程有点慢，等进度达到100%后，就会开始挖矿，此时屏幕会被挖矿信息刷屏。

如果想停止挖矿，并且进度已经达到100%之后，可以在js console中输入

```
miner.stop()：
```

注意：输入的字符会被挖矿刷屏信息冲掉，没有关系，只要输入完整的miner.stop()之后回车，即可停止挖矿。

挖到一个区块会奖励5个以太币，挖矿所得的奖励会进入矿工的账户，这个账户叫做coinbase，默认情况下coinbase是本地账户中的第一个账户：

```
> eth.coinbase
"0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f"
```

现在的coinbase是账户0，要想使挖矿奖励进入其他账户，通过miner.setEtherbase()将其他账户设置成coinbase即可：

```
> miner.setEtherbase(eth.accounts[1])
true
> eth.coinbase
"0x46b24d04105551498587e3c6ce2c3341d5988938"
```

挖到区块以后，账户0里面应该就有余额了：

```
> eth.getBalance(eth.accounts[0])
2.31e+21
```

getBalance()返回值的单位是wei，wei是以太币的最小单位，1个以太币=10的18次方个wei。要查看有多少个以太币，可以用web3.fromWei()将返回值换算成以太币：

```
> web3.fromWei(eth.getBalance(eth.accounts[0]),'ether')
2310
```

### 发送交易
截止目前，账户一的余额还是0：

```
> eth.getBalance(eth.accounts[1])
0
```

可以通过发送一笔交易，从账户0转移10个以太币到账户1：

```
> amount = web3.toWei(10,'ether')
"10000000000000000000"
> eth.sendTransaction({from:eth.accounts[0],to:eth.accounts[1],value:amount})
Error: authentication needed: password or unlock
    at web3.js:3143:20
    at web3.js:6347:15
    at web3.js:5081:36
    at <anonymous>:1:1
```

这里报错了，原因是账户每隔一段时间就会被锁住，要发送交易，必须先解锁账户，由于我们要从账户0发送交易，所以要解锁账户0：

```
> personal.unlockAccount(eth.accounts[0])
Unlock account 0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f
Passphrase: 
true
```

输入创建账户时设置的密码，就可以成功解锁账户。然后再发送交易：

```
> amount = web3.toWei(10,'ether')
"10000000000000000000"
> eth.sendTransaction({from:eth.accounts[0],to:eth.accounts[1],value:amount})
INFO [03-07|11:13:11] Submitted transaction                    fullhash=0x1b21bba16dd79b659c83594b0c41de42debb2738b447f6b24e133d51149ae2a6 recipient=0x46B24d04105551498587e3C6CE2c3341d5988938
"0x1b21bba16dd79b659c83594b0c41de42debb2738b447f6b24e133d51149ae2a6"
```

我们去查看账户1中的余额：

```
> eth.getBalance(eth.accounts[1])
0
```

发现还没转过去，此时交易已经提交到区块链，但还未被处理，这可以通过查看txpool来验证：

```
> txpool.status
{
  pending: 1,
  queued: 0
}
```

其中有一条pending的交易，pending表示已提交但还未被处理的交易。

要使交易被处理，必须要挖矿。这里我们启动挖矿，然后等待挖到一个区块之后就停止挖矿：

```
> miner.start(1);admin.sleepBlocks(1);miner.stop();
```

当miner.stop()返回true后，txpool中pending的交易数量应该为0了，说明交易已经被处理了，而账户1应该收到币了：

```
> web3.fromWei(eth.getBalance(eth.accounts[1]),'ether')
10
```

### 查看交易和区块
eth对象封装了查看交易和区块信息的方法。

查看当前区块总数：

```
> eth.blockNumber
463
```

通过区块号查看区块：

```
> eth.getBlock(66)
{
  difficulty: 135266,
  extraData: "0xd783010802846765746886676f312e31308664617277696e",
  gasLimit: 3350537,
  gasUsed: 0,
  hash: "0x265dfcc0649bf6240812256b2b9b4e3ae48d51fd8e43e25329ac111556eacdc8",
  logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  miner: "0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f",
  mixHash: "0xaf755722f62cac9b483d3437dbc795f2d3a02e28ec03d39d8ecbb6012906263c",
  nonce: "0x3cd80f6ec5c2f3e9",
  number: 66,
  parentHash: "0x099776a52223b892d13266bb3aec3cc04c455dc797185f0b3300d39f9fc0a8ec",
  receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 535,
  stateRoot: "0x0c9feec5a201c8c98618331aecbfd2d4d93da1c6064abd0c41ae649fc08d8d06",
  timestamp: 1520391527,
  totalDifficulty: 8919666,
  transactions: [],
  transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  uncles: []
}
```

通过交易hash查看交易：

```
> eth.getTransaction("0x1b21bba16dd79b659c83594b0c41de42debb2738b447f6b24e133d51149ae2a6")
{
  blockHash: "0x1cb368a27cc23c786ff5cdf7cd4351d48f4c8e8aea2e084a5e9d7c480449c79a",
  blockNumber: 463,
  from: "0x4a3b0216e1644c1bbabda527a6da7fc5d178b58f",
  gas: 90000,
  gasPrice: 18000000000,
  hash: "0x1b21bba16dd79b659c83594b0c41de42debb2738b447f6b24e133d51149ae2a6",
  input: "0x",
  nonce: 0,
  r: "0x31d22686e0d408a16497becf6d47fbfdffe6692d91727e5b7ed3d73ede9e66ea",
  s: "0x7ff7c14a20991e2dfdb813c2237b08a5611c8c8cb3c2dcb03a55ed282ce4d9c3",
  to: "0x46b24d04105551498587e3c6ce2c3341d5988938",
  transactionIndex: 0,
  v: "0x38",
  value: 10000000000000000000
}
```

强烈安利几门视频课程给大家：
* [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) -  Solidity 语言面面俱到
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


