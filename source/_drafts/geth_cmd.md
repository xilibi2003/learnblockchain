---
title: geth使用详解
date: 2017-11-23 19:41:53
categories: BlockChain
tags:
    - geth
author: Tiny熊
---

如果你对于以太坊智能合约开发还没有概念（本文会假设你已经知道这些概念），建议先阅读[入门篇](https://learnblockchain.cn/2017/11/20/whatiseth/)。
就先学习任何编程语言一样，入门的第一个程序都是Hello World，今天我们来看看智能合约的Hello World如何写。

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


var _greeting = "Hello World" ;
var browser_helloworld_sol_helloContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"say","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_greeting","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var browser_helloworld_sol_hello = browser_helloworld_sol_helloContract.new(
   _greeting,
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b6040516102b83803806102b8833981016040528080518201919050508060009080519060200190610041929190610048565b50506100ed565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061008957805160ff19168380011785556100b7565b828001600101855582156100b7579182015b828111156100b657825182559160200191906001019061009b565b5b5090506100c491906100c8565b5090565b6100ea91905b808211156100e65760008160009055506001016100ce565b5090565b90565b6101bc806100fc6000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063954ab4b214610046575b600080fd5b341561005157600080fd5b6100596100d4565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561009957808201518184015260208101905061007e565b50505050905090810190601f1680156100c65780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6100dc61017c565b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101725780601f1061014757610100808354040283529160200191610172565b820191906000526020600020905b81548152906001019060200180831161015557829003601f168201915b5050505050905090565b6020604051908101604052806000815250905600a165627a7a723058204a5577bb3ad30e02f7a3bdd90eedcc682700d67fc8ed6604d38bb739c0655df90029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })