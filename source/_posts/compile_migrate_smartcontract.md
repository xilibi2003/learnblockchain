---
title: 以太坊测试环境编译并部署智能合约
date: 2018-03-19 20:45:59
categories: 
    - 以太坊
    - 部署智能合约
tags:
    -  以太坊 
    -  测试环境
    -  部署智能合约
author: 罗小辉
---

以太坊测试环境编译并部署智能合约

<!-- more -->

## 选择编写智能合约的语言
Ethereum上的智能合约需要使用solidity语言来撰写。虽然还有其他能用来撰写智能合约的语言如Serpent（类Python）、lll（类Fortran），但目前看到所有公开的智能合约都是使用solidity撰写。

solidity是一种看起来像java的语言。它属于强类型（Strong Type，在定义变数时需要指定类型）语言、在定义函式（function）时同样需指定回传的类型（type）、同样也需要先编译才能执行。这些特性跟java很相似。

##  开发前准备
### 介绍truffle框架
我们使用当前最活跃的智能合约开发框架truffle为基础来开发。
就像一般网站或App开发一样，在提供公开服务之前，开发者会在自己用于写程序的电脑（又称作本机）或透过测试网络来测试程序执行的效果，测试完成后，才会部署到公开的网络上提供服务。开发区块链智能合约（程序）的过程也是如此。特别是公开链上所有写入或读取计算结果的操作都需要真金白银（虚拟代币），而且根据网络状况，每个公开链上的操作都需要要一小段反应时间（15秒~数分钟），这些等待颇浪费宝贵的开发时间⏳。因此在开发的过程中，我们将使用testrpc工具在电脑上模拟智能合约所需的以太坊内存块链测试环境。

testrpc中也包含了Javascript版本的Ethereum虚拟机（Ethereum Virtual Machine），因此可以完整地执行智能合约。

### 安装truffle框架
```
npm install -g ethereumjs-testrpc truffle
```
npm是node中的命令，请自行查阅安装。
### 启动Testrpc
装好后使用testrpc命令来启动以太坊测试环境。
```
luoxiaohui:~ luoxiaohui$ testrpc
EthereumJS TestRPC v6.0.3 (ganache-core: 2.0.2)

Available Accounts
==================
(0) 0x6d978eee45793329d433ca021bf16dcd25d8f197
(1) 0xcb275083dd008e768a273a8920a022380762b2bd
(2) 0x0e5daddcf5e99791966ccd12f316161814efb20c
(3) 0xd01afe1384c2f0d8a8b03e5d703fae1f1abafa62
(4) 0x0911ec933b1ffc04d3ee7978553c5f66c6506131
(5) 0xc5d4d7e1a20bce48393c76f5002715df94d2f183
(6) 0x53597cf11b0ad5c9be66ae389af47392d61ca3fc
(7) 0x2fda478ae8fc1cb94d52b3e455c74a6b53df3f49
(8) 0x4c2bbf8fedef839d91bb57c28912d78b96d574dd
(9) 0x3228823260c53b7acdf6fe6af133c24c5ce92a8a

Private Keys
==================
(0) 45de0cbbfb657f6478427bf0ddd12e2700428aec43067718f2ac2b90a4ce2554
(1) 2552f7ee123d44eff0bdb5b401ba065add2aa77c69d6c46c0369bcf1dd9a04b8
(2) 84f94b39ef71cf708a1d264a3bb6bcdcf1be85661fe2535fa731c947abf6c619
(3) d9637df135ff5af3b6eb2ad32d891d02a5d31693c8e12321033d143889fd44fb
(4) 59d49985ac72e8d7c8d7240127277ca8e2a0a2573b5fae1afac7eec9e874d180
(5) 471adb496803b15075174d582fabc6ed16b7316ec6df4f1f594df4f6e522a232
(6) 2d75529bff0452d1e31ff39171012c6e0e87a744e3455ee8d32a6d36fd08c22f
(7) 479586c4b67dec9984f5302a691498c9dff4892e3ac263898ebb37b3cd304aae
(8) e660f6a0ab46ee1fe7d0d50139fc1f503eccd2f1a29c11b91a200b89e6a027cd
(9) 80842f75f78fdec838b46429e8525348481c236040af32e1986e114cadc55401

HD Wallet
==================
Mnemonic:      actress fiber scene camera margin wine rebel size name license example knock
Base HD Path:  m/44'/60'/0'/0/{account_index}

Listening on localhost:8545
```
可以看到testrpc启动后自动建立了10个帐号（Accounts），与每个帐号对应的私钥（Private Key）。每个帐号中都有100个测试用的以太币（Ether）。要注意testrpc仅运行在內存中，因此每次重开时都会回到全新的状态。

## 创建项目
开启另一个终端窗口，开始创建项目：
```
luoxiaohui:eth luoxiaohui$ mkdir SmardContractDemo
luoxiaohui:eth luoxiaohui$ rm -rf SmardContractDemo/
luoxiaohui:eth luoxiaohui$ mkdir SmartContractDemo
luoxiaohui:eth luoxiaohui$ cd SmartContractDemo/
luoxiaohui:SmartContractDemo luoxiaohui$ ls
luoxiaohui:SmartContractDemo luoxiaohui$ mkdir HelloWorld
luoxiaohui:SmartContractDemo luoxiaohui$ cd HelloWorld/
luoxiaohui:HelloWorld luoxiaohui$ ls
luoxiaohui:HelloWorld luoxiaohui$ truffle init
Downloading...
Unpacking...
Setting up...
Unbox successful. Sweet!

Commands:

  Compile:        truffle compile
  Migrate:        truffle migrate
  Test contracts: truffle test
luoxiaohui:HelloWorld luoxiaohui$ ls
contracts		test			truffle.js
migrations		truffle-config.js
```
**目录结构：**
/contracts:存放智能合约原始代码的地方，可以看到里面已经有一个sol文件，我们开发的HelloWorld.sol文件就存放在这里。

/migrations:这是 Truffle用来部署智能合约的功能，待会儿我们会修改1_initial_migration.js来部署 HelloWorld.sol。

truffle.js: Truffle 的配置文档。

## 新建HelloWorld合约
在contracts文件夹下新建HelloWorld.sol文件，当然也可以直接在HelloWorld路径下面直接执行truffle create contract HelloWorld命令来创建HelloWorld.sol。
```
luoxiaohui:HelloWorld luoxiaohui$ cd contracts/
luoxiaohui:contracts luoxiaohui$ ls
Migrations.sol
luoxiaohui:contracts luoxiaohui$ truffle create contract HelloWorld
luoxiaohui:contracts luoxiaohui$ ls
HelloWorld.sol	Migrations.sol
```
编辑HelloWorld.sol文件內容如下：
```
pragma solidity ^0.4.4;


contract HelloWorld {
  function HelloWorld() {
    // constructor
  }

  function sayHello () returns(string) {
  	return ("Hello World");
  }
  
  function print(string name) constant returns (string) {
    return name;
	}
}
```
`pragma solidity ^0.4.4;`指名目前使用的solidity版本，不同版本的solidity可能会编译出不同的bytecode。^代表兼容solidity`0.4.4 ~ 0.4.9`的版本。
`contract`关键字类似于其他语言中较常见的`class`。因为`solidity`是专为智能合约（Contact）设计的语言，声明`contract`后即内置了开发智能合约所需的功能。也可以把这句理解为`class HelloWorld extends Contract`。
```
function sayHello () returns(string) {
  	return ("Hello World");
  }
```
函数的结构与其他程序类似，但如果有传入的参数或回传值，需要指定参数或回传值的类型（type）。
`print`方法中传入了一个`name`参数。我们也为`print`方法加入一个`constant`声明，表示调用这个方法并不会改变区块链的状态。如此一来，透过`truffle-contract`来调用此方法时，会自动选用`call`来呼叫，也不需要额外提供`gas`。
## 编译
执行`truffle compile`命令，我们可以将HelloWorld.sol原始码编译成Ethereum bytecode。
```
luoxiaohui:contracts luoxiaohui$ cd ..
luoxiaohui:HelloWorld luoxiaohui$ ls
contracts		test			truffle.js
migrations		truffle-config.js
luoxiaohui:HelloWorld luoxiaohui$ truffle compile
Compiling ./contracts/HelloWorld.sol...
Compiling ./contracts/Migrations.sol...

Compilation warnings encountered:

/Users/luoxiaohui/Develop/eth/SmartContractDemo/HelloWorld/contracts/HelloWorld.sol:5:3: Warning: No visibility specified. Defaulting to "public".
  function HelloWorld() {
  ^
Spanning multiple lines.
,/Users/luoxiaohui/Develop/eth/SmartContractDemo/HelloWorld/contracts/HelloWorld.sol:9:3: Warning: No visibility specified. Defaulting to "public".
  function sayHello () returns(string) {
  ^
Spanning multiple lines.
,/Users/luoxiaohui/Develop/eth/SmartContractDemo/HelloWorld/contracts/HelloWorld.sol:9:3: Warning: Function state mutability can be restricted to pure
  function sayHello () returns(string) {
  ^
Spanning multiple lines.

Writing artifacts to ./build/contracts

luoxiaohui:HelloWorld luoxiaohui$ ls
build			migrations		truffle-config.js
contracts		test
```
编译成功后，会在HelloWorld文件夹下面的build/contracts文件夹下面看见HelloWorld.json文件。
## 部署
truffle框架中提供了方便部署合约的脚本。打开migrations/1_initial_migration.js文件（脚本使用Javascript编写），将内容修改如下：
```
var HelloWorld = artifacts.require("./HelloWorld.sol");

module.exports = function(deployer) {
  deployer.deploy(HelloWorld);
};
```
使用`artifacts.require`语句来取得准备部署的合约。使用`deployer.deploy`语句将合约部署到区块链上。这边`HelloWorld`是`contract`的名称而不是文件名。因此可以用此语法读入任一.sol文件中的任一合约。

现在执行truffle migrate命令：
```
luoxiaohui:HelloWorld luoxiaohui$ truffle migrate
Error: No network specified. Cannot determine current network.
    at Object.detect (/usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-core/lib/environment.js:31:1)
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-core/lib/commands/migrate.js:91:1
    at finished (/usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-workflow-compile/index.js:53:1)
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/index.js:303:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/profiler.js:157:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:3874:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:473:1
    at replenish (/usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:993:1)
    at iterateeCallback (/usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:983:1)
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:958:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:3871:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/profiler.js:153:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:1126:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:473:1
    at iteratorCallback (/usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:1050:1)
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:958:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/~/async/dist/async.js:1123:1
    at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-compile/profiler.js:132:1
    at FSReqWrap.oncomplete (fs.js:153:5)
```
此时报错：`No network specified. Cannot determine current network.`，我们需要改一下truffle.js文件，如下所示:
```
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // 匹配任何network id
         }
    }
};
```
执行truffle migrate命令：
```
luoxiaohui:HelloWorld luoxiaohui$ truffle migrate --reset
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying HelloWorld...
  ... 0xe0f218b68644f6e0f25878db4ae3747f24c1684a08bf00ac06606f875da87403
  HelloWorld: 0x0a57d97d0b44dddb951bbcb36581b13207155c3b
Saving artifacts...
```
`--reset`表示部署过一次之后，下次再部署，需要添加此属性。切换到testrpc控制台中，不出意外应该有反应了：
```
Listening on localhost:8545
net_version
eth_accounts

eth_sendTransaction

  Transaction: 0xe0f218b68644f6e0f25878db4ae3747f24c1684a08bf00ac06606f875da87403
  Contract created: 0x0a57d97d0b44dddb951bbcb36581b13207155c3b
  Gas usage: 142468
  Block Number: 1
  Block Time: Sun Mar 11 2018 16:59:30 GMT+0800 (CST)

eth_newBlockFilter
eth_getFilterChanges
eth_getTransactionReceipt
eth_getCode
eth_uninstallFilter
net_version
eth_accounts
eth_call
eth_sendTransaction

  Transaction: 0x3e44103d7a50666bec47d86a0978b5bdc915f4730456f3d28e164ef56176720d
  Gas usage: 21934
  Block Number: 2
  Block Time: Sun Mar 11 2018 17:01:41 GMT+0800 (CST)
```
## 与合约互动
`truffle`提供命令行工具，执行`truffle console`命令后，可用Javascript来和刚刚部署的合约互动。
```
truffle(development)> HelloWorld.deployed().then(instance => contract = instance)
TruffleContract {
  constructor: 
   { [Function: TruffleContract]
     _static_methods: 
      { setProvider: [Function: setProvider],
        new: [Function: new],
        at: [Function: at],
        deployed: [Function: deployed],
        defaults: [Function: defaults],
        hasNetwork: [Function: hasNetwork],
        isDeployed: [Function: isDeployed],
        detectNetwork: [Function: detectNetwork],
        setNetwork: [Function: setNetwork],
        resetAddress: [Function: resetAddress],
        link: [Function: link],
        clone: [Function: clone],
        addProp: [Function: addProp],
        toJSON: [Function: toJSON] },
     _properties: 
      { contract_name: [Object],
        contractName: [Object],
        abi: [Object],
        network: [Function: network],
        networks: [Function: networks],
        address: [Object],
        transactionHash: [Object],
        links: [Function: links],
        events: [Function: events],
        binary: [Function: binary],
        deployedBinary: [Function: deployedBinary],
        unlinked_binary: [Object],
        bytecode: [Object],
        deployedBytecode: [Object],
        sourceMap: [Object],
        deployedSourceMap: [Object],
        source: [Object],
        sourcePath: [Object],
        legacyAST: [Object],
        ast: [Object],
        compiler: [Object],
        schema_version: [Function: schema_version],
        schemaVersion: [Function: schemaVersion],
        updated_at: [Function: updated_at],
        updatedAt: [Function: updatedAt] },
     _property_values: {},
     _json: 
      { contractName: 'HelloWorld',
        abi: [Array],
        bytecode: '0x6060604052341561000f57600080fd5b6102488061001e6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806311114af114610051578063ef5fb05b14610127575b600080fd5b341561005c57600080fd5b6100ac600480803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506101b5565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100ec5780820151818401526020810190506100d1565b50505050905090810190601f1680156101195780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561013257600080fd5b61013a6101c5565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561017a57808201518184015260208101905061015f565b50505050905090810190601f1680156101a75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101bd610208565b819050919050565b6101cd610208565b6040805190810160405280600b81526020017f48656c6c6f20576f726c64000000000000000000000000000000000000000000815250905090565b6020604051908101604052806000815250905600a165627a7a72305820f612c9a7978abafecc42437856f4abb1a667c6f9f3e60e87c134d5ddc00877b80029',
        deployedBytecode: '0x60606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806311114af114610051578063ef5fb05b14610127575b600080fd5b341561005c57600080fd5b6100ac600480803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506101b5565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100ec5780820151818401526020810190506100d1565b50505050905090810190601f1680156101195780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561013257600080fd5b61013a6101c5565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561017a57808201518184015260208101905061015f565b50505050905090810190601f1680156101a75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101bd610208565b819050919050565b6101cd610208565b6040805190810160405280600b81526020017f48656c6c6f20576f726c64000000000000000000000000000000000000000000815250905090565b6020604051908101604052806000815250905600a165627a7a72305820f612c9a7978abafecc42437856f4abb1a667c6f9f3e60e87c134d5ddc00877b80029',
        sourceMap: '26:225:0:-;;;50:46;;;;;;;;26:225;;;;;;',
        deployedSourceMap: '26:225:0:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;175:74;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:2;8:100;;;99:1;94:3;90;84:5;80:1;75:3;71;64:6;52:2;49:1;45:3;40:15;;8:100;;;12:14;3:109;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;100:69:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:2;8:100;;;99:1;94:3;90;84:5;80:1;75:3;71;64:6;52:2;49:1;45:3;40:15;;8:100;;;12:14;3:109;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;175:74:0;221:6;;:::i;:::-;242:4;235:11;;175:74;;;:::o;100:69::-;129:6;;:::i;:::-;142:22;;;;;;;;;;;;;;;;;;;;100:69;:::o;26:225::-;;;;;;;;;;;;;;;:::o',
        source: 'pragma solidity ^0.4.4;\n\n\ncontract HelloWorld {\n  function HelloWorld() {\n    // constructor\n  }\n\n  function sayHello () returns(string) {\n  \treturn ("Hello World");\n  }\n  \n  function print(string name) constant returns (string) {\n    return name;\n}\n}\n',
        sourcePath: '/Users/luoxiaohui/Develop/eth/SmartContractDemo/HelloWorld/contracts/HelloWorld.sol',
        ast: [Object],
        legacyAST: [Object],
        compiler: [Object],
        networks: [Object],
        schemaVersion: '2.0.0',
        updatedAt: '2018-03-11T09:09:50.198Z' },
     setProvider: [Function: bound setProvider],
     new: [Function: bound new],
     at: [Function: bound at],
     deployed: [Function: bound deployed],
     defaults: [Function: bound defaults],
     hasNetwork: [Function: bound hasNetwork],
     isDeployed: [Function: bound isDeployed],
     detectNetwork: [Function: bound detectNetwork],
     setNetwork: [Function: bound setNetwork],
     resetAddress: [Function: bound resetAddress],
     link: [Function: bound link],
     clone: [Function: bound clone],
     addProp: [Function: bound addProp],
     toJSON: [Function: bound toJSON],
     web3: 
      Web3 {
        _requestManager: [Object],
        currentProvider: [Object],
        eth: [Object],
        db: [Object],
        shh: [Object],
        net: [Object],
        personal: [Object],
        bzz: [Object],
        settings: [Object],
        version: [Object],
        providers: [Object],
        _extend: [Object] },
     class_defaults: 
      { from: '0x6d978eee45793329d433ca021bf16dcd25d8f197',
        gas: 6721975,
        gasPrice: 100000000000 },
     currentProvider: 
      HttpProvider {
        host: 'http://localhost:8545',
        timeout: 0,
        user: undefined,
        password: undefined,
        headers: undefined,
        send: [Function],
        sendAsync: [Function],
        _alreadyWrapped: true },
     network_id: '1520754729941' },
  abi: 
   [ { inputs: [],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'constructor' },
     { constant: false,
       inputs: [],
       name: 'sayHello',
       outputs: [Array],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'function' },
     { constant: true,
       inputs: [Array],
       name: 'print',
       outputs: [Array],
       payable: false,
       stateMutability: 'view',
       type: 'function' } ],
  contract: 
   Contract {
     _eth: 
      Eth {
        _requestManager: [Object],
        getBalance: [Object],
        getStorageAt: [Object],
        getCode: [Object],
        getBlock: [Object],
        getUncle: [Object],
        getCompilers: [Object],
        getBlockTransactionCount: [Object],
        getBlockUncleCount: [Object],
        getTransaction: [Object],
        getTransactionFromBlock: [Object],
        getTransactionReceipt: [Object],
        getTransactionCount: [Object],
        call: [Object],
        estimateGas: [Object],
        sendRawTransaction: [Object],
        signTransaction: [Object],
        sendTransaction: [Object],
        sign: [Object],
        compile: [Object],
        submitWork: [Object],
        getWork: [Object],
        coinbase: [Getter],
        getCoinbase: [Object],
        mining: [Getter],
        getMining: [Object],
        hashrate: [Getter],
        getHashrate: [Object],
        syncing: [Getter],
        getSyncing: [Object],
        gasPrice: [Getter],
        getGasPrice: [Object],
        accounts: [Getter],
        getAccounts: [Object],
        blockNumber: [Getter],
        getBlockNumber: [Object],
        protocolVersion: [Getter],
        getProtocolVersion: [Object],
        iban: [Object],
        sendIBANTransaction: [Function: bound transfer] },
     transactionHash: null,
     address: '0x155d6d4e1deb951b70c01498369cad1103e1bf9e',
     abi: [ [Object], [Object], [Object] ],
     sayHello: 
      { [Function: bound ]
        request: [Function: bound ],
        call: [Function: bound ],
        sendTransaction: [Function: bound ],
        estimateGas: [Function: bound ],
        getData: [Function: bound ],
        '': [Circular] },
     print: 
      { [Function: bound ]
        request: [Function: bound ],
        call: [Function: bound ],
        sendTransaction: [Function: bound ],
        estimateGas: [Function: bound ],
        getData: [Function: bound ],
        string: [Circular] },
     allEvents: [Function: bound ] },
  sayHello: 
   { [Function]
     call: [Function],
     sendTransaction: [Function],
     request: [Function: bound ],
     estimateGas: [Function] },
  print: 
   { [Function]
     call: [Function],
     sendTransaction: [Function],
     request: [Function: bound ],
     estimateGas: [Function] },
  sendTransaction: [Function],
  send: [Function],
  allEvents: [Function: bound ],
  address: '0x155d6d4e1deb951b70c01498369cad1103e1bf9e',
  transactionHash: null }
```
如果有报错：`Error: HelloWorld has not been deployed to detected network (network/artifact mismatch)`，请重新部署`truffle migrate --reset`，并重新进入到`truffle`环境。

`HelloWorld.deployed().then(instance => contract = instance)`这里使用HelloWorld.deployed().then语句来取得HelloWorld合约的Instance（实例），并存到contract变量中，以方便后续的调用。
调用方法：
```
truffle(development)> contract.sayHello.call()
'Hello World'
truffle(development)> contract.print.call("luoxiaohui")
'luoxiaohui'
```
直接呼叫`contract.sayHello()`也会得到一样的结果。`truffle-contract`提供使用call()来读取只读（read only）的数据，这样就不需提供`gas`。因此如果遇到的操作需要向区块链写入数据，我们就不能用call语句了。至此，我们已写好并部署完成了第一个智能合约，也验证了合约确实可以运作啦～

