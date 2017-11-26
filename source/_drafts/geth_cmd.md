---
title: geth使用详解
date: 2017-11-23 19:41:53
categories: BlockChain
tags:
    - geth
author: Tiny熊
---


<!-- more -->

## 开发环境搭建

### Solidity安装

强烈建议新手使用[Browser-Solidity](https://ethereum.github.io/browser-solidity)来进行开发。
Browser-Solidity是一个基于浏览器的Solidity，就可以不用安装Solidity。

Solidity安装方法如下，在命令行中输入：
```
npm install -g solc
```
> npm是Node.js包管理器，没有npm命令，请先安装[Node.js](https://nodejs.org/en/)

我本人使用Mac，其他平台请查看[Solidity安装指引](https://solidity.readthedocs.io/en/develop/installing-solidity.html）。

### geth 安装
[](https://github.com/ethereum/go-ethereum)
[geth官方安装指引](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
```
brew tap ethereum/ethereum
brew install ethereum
```
> brew 是 Mac 下的包管理工具，和Ubuntu里的apt-get类似



### ganache-cli 安装
testrpc 并入Truffle框架后，更名为：ganache-cli 
[ganache-cli](https://github.com/trufflesuite/ganache-cli)
```
npm install -g ganache-cli
```
运行
```
ganache-cli
```



### truffle安装
[官方安装指引](https://github.com/trufflesuite/truffle)

```
npm install -g truffle
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
