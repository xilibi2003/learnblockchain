---
title: Geth控制台使用实战篇
date: 2017-11-23 19:41:53
categories: Geth
tags:
    - Geth使用
author: Tiny熊
---

Geth控制台（REPL）实现了所有的[web3 API](http://web3js.readthedocs.io/en/1.0/index.html)和[admin api]()，
使用实战，请结合[Geth命令用法](https://learnblockchain.cn/2017/11/29/geth_cmd_options/)阅读。

结合应用场景
<!-- more -->

Geth控制台（REPL）


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


## 连接geth节点
另外一个启动geth的方法是连接到一个geth节点：
```
$ geth attach ipc:/some/custom/path
$ geth attach http://191.168.1.1:8545
$ geth attach ws://191.168.1.1:8546
```

## 启动多节点(集群)
https://ethereum.gitbooks.io/frontier-guide/content/cluster.html
```

```


## 在本地创建一个测试网络

https://github.com/ethereum/go-ethereum/wiki/JavaScript-Console
https://github.com/ethereum/go-ethereum/wiki/Setting-up-private-network-or-local-cluster

```
geth --datadir /Users/Emmett/blockchain/eth_testNet -rpc -rpcaddr 127.0.0.1 -rpcport 8545 --dev

另一个
geth attach ipc://Users/Emmett/blockchain/eth_testNet/geth.ipc 


```

tail -f net2.log

geth --datadir="net1" -verbosity 6 --ipcdisable --port 30301 --rpcport 8101 console 2>> net1.log
geth --datadir="net2" --verbosity 6 --ipcdisable --port 30302 --rpcport 8102 console 2>> net2.log

命令：
attach      Start an interactive JavaScript environment (connect to node)
console     Start an interactive JavaScript environment
 init        Bootstrap and initialize a new genesis block

OPTIONS：
  --datadir "/Users/Emmett/Library/Ethereum"  Data directory for the databases and keystore
   --networkid value                           Network identifier (integer, 1=Frontier, 2=Morden (disused), 3=Ropsten, 4=Rinkeby) (default: 1)

DEVELOPER CHAIN OPTIONS:
--dev               Ephemeral proof-of-authority network with a pre-funded developer account, mining enabled



API AND CONSOLE OPTIONS:

 --rpc                  Enable the HTTP-RPC server
 --ipcpath              Filename for IPC socket/pipe within the datadir (explicit paths escape it)


 --port value          Network listening port (default: 30303)


 MINER OPTIONS:
  --mine                    Enable mining
 

进入控制台
```
geth console
```

以开发方式登录
```
geth --datadir eth_testNet --dev
```

geth --dev console



## 写

```js
pragma solidity ^0.4.18;
contract hello {
    string greeting;
    
    function hello(string _greeting) public {
        greeting = _greeting;
    }

    function say() constant public returns (string) {
        return greeting;
    }
}
```
把输入的参数打印出来

https://ethereum.github.io/browser-solidity

![](/images/eth_code_hello_step1.jpeg)

![](/images/eth_code_hello_step2.jpeg)
IDE 已经帮我们生成好了部署代码

拷贝会控制台

看到输出：

```
Contract mined! address: 0x79544078dcd9d560ec3f6eff0af42a9fc84c7d19 transactionHash: 0xe2caab22102e93434888a0b8013a7ae7e804b132e4a8bfd2318356f6cf0480b3
```




## 参考链接

[solidity官方文档]()


http://www.ziggify.com/blog/blockchain-stack-1-installing-ethereum-geth-smart-contract/

https://medium.com/shokone/https-medium-com-shokone-building-a-hello-world-smart-contract-on-ethereum-f303c7d05f0


geth --datadir ./.ethereum/devnet --dev --mine --minerthreads 1 --etherbase 0
