---
title: DApp教程：用Truffle 开发一个链上记事本
permalink: dapp_noteOnChain
un_reward: true
date: 2019-03-30 21:29:55
categories: 
    - 以太坊
    - Dapp
tags:
    - Dapp
    - Truffle
author: Tiny熊
---

以编写一个链上记事本为例，介绍如何开发DApp，一年多前写的[开发、部署第一个DApp](https://learnblockchain.cn/2018/01/12/first-dapp/)因为Truffle 、MetaMask、Solidity都有升级，也随手更新了。
通过两个教程大家可以更好理解前端如何与合约进行交互， 本文也将介绍如何使用**Truffle 把合约部署到以太坊正式网络**上（貌似很多人遇到问题）。

<!-- more -->

## 项目背景及效果

链上记事本让事件永久上链，让事件成为无法修改的历史，从此再无删帖，之前有一个帖子，介绍如何MetaMask上链记事，现在我们通过这个DApp来完成。

链上记事本有两个功能：

1. 添加一个新记事
2. 查看之前(自己的)记事本

**实现效果：**
![记事本DApp 效果图](https://img.learnblockchain.cn/2019/15539548973073.jpg!wl)

本合约也部署到以太坊官方测试网络Ropsten， 如Englist first Note 的交易记录可以在[EtherScan查询](https://ropsten.etherscan.io/tx/0xd6b7366fa06a643be0de7abc26e04b0509595f9a1cf216e6f7c29f1ad78c8775)。

## 项目准备

创建项目文件夹：noteOnChain，然后在目录下，执行：

```
truffle unbox pet-shop
```

使用Truffle 对项目初始化。

> 如果没有使用过truffle 可以阅读[开发、部署第一个DApp](https://learnblockchain.cn/2018/01/12/first-dapp/)。

Truffle 的Box，是一套套的开发模板， 它会帮助我们安装好相应的依赖，快速的启动应用开发。
如果我们项目需要是使用到 JQuery， Bootstrap库，使用`pet-shop`这个Box 是不错的选择，官方还提供了React 、 Vue 项目相应的模板，所有的Box 可以在[这里](https://truffleframework.com/boxes)查询。


## 合约实现

项目初始化会在`noteOnChain`目录下生成`contracts`目录来存放合约文件，在`contracts`目录下添加一个合约文件`NoteContract.sol`:

```javasrcipt
pragma solidity ^0.5.0;

contract NoteContract {    
    mapping(address => string [] ) public notes;

    constructor() public {
    }

    event NewNote(address, string note);

// 添加记事
    function addNote( string memory note) public {
        notes[msg.sender].push(note);
        emit NewNote(msg.sender, note);
    }

    function getNotesLen(address own) public view returns (uint) {
        return notes[own].length;
    }
}

```

合约关键是状态变量`notes`的定义，这是一个mapping， 保存着所有地址下所有的记事本。


### 修改记事本逻辑

如果需要修改笔记功能，可以在合约中加入以下代码：

```javasrcipt
    event ModifyNote(address, uint index);
    
    function modifyNote(address own, uint index, string memory note) public {
        notes[own][index] = note;
        emit ModifyNote(own, index);
    }

```

如果需要只有自己能修改笔记可以modifyNote的第一行加上:
```javasrcipt
require(own == msg.sender);
```


## 合约部署

先为合约添加一个部署脚本：

```
var Note = artifacts.require("./NoteContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Note);
};
```

truffle部署的命令是

```
truffle migrate
```

默认情况下，会部署到本地的Ganache提供的测试网络，本文介绍下如何**通过Truffle部署到太坊官方网络**，这里以部署到以太坊测试网络Ropsten为例进行介绍。


> Ganache 的安装使用可阅读[开发、部署第一个DApp](https://learnblockchain.cn/2018/01/12/first-dapp/)



### Infura 节点服务注册 与 HDWalletProvider 安装


大多数人应该都没有部署自己的节点，我们可以使用[Infura](https://infura.io/) 提供的节点服务。

> 有部分人可能不解 Infura 服务，其实 MetaMask 后面的节点服务就是Infura。

然后通过 `HDWalletProvider` 连接到Infura节点，并为我们签署交易，通过下面命令安装HDWalletProvider：

```
npm install truffle-hdwallet-provider
```

在使用Infura之前，我们需要注册一个访问Infura服务的Token， 注册地址为：[https://infura.io/register](https://infura.io/register)， 注册后创建一个  Project, 复制节点url：

![](https://img.learnblockchain.cn/2019/15540848537217.jpg!wl)

### 为 truffle 配置一个新网络

修改` truffle.js` 加入一个新网络.

1. 首先引入 HDWalletProvider：

```
var HDWalletProvider = require("truffle-hdwallet-provider");
```

2. 配置签名的钱包助记词：

```
var mnemonic = "orange apple banana ... ";
```

助记词其实不应该明文配置保存，最好配置在一个隐私文件里，并被代码管理工具所忽略。

3. 加入新网络，以Ropsten为例：

```javascript
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/xxx")
      },
      network_id: 3,
      gas: 7003605,
      gasPrice: 100000000000,
    } 
  }
```

HDWalletProvider 的第一个参数是助记词（确保账号有足够的余额），第二个参数是 上面复制的 Infura 节点服务地址，gas 和 gasPrice 分别配置部署时的Gas Limit 和 Gas Price。

Truffle 网络的配置可查阅[链接](https://truffleframework.com/docs/truffle/reference/configuration#networks)。

### 部署

通过以下命令来选择网络部署：

```
truffle migrate --network ropsten
```

此过程大约需要等待半分钟，正常的话会输出像下面的提示：


```Using network 'ropsten'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xd79bc3c5a7d338a7f85db9f86febbee738ebdec9494f49bda8f9f4c90b649db7
  Migrations: 0x0c6c4fc8831755595eda4b5724a61ff989e2f8b9
Saving successful migration to network...
  ... 0xc37320561d0004dc149ea42d839375c3fc53752bae5776e4e7543ad16c1b06f0
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying NoteContract...
  ... 0x7efbb3e4f028aa8834d0078293e0db7ff8aff88e72f33960fc806a618a6ce4d3
  NoteContract: 0xda05d7bfa5b6af7feab7bd156e812b4e564ef2b1
Saving successful migration to network...
  ... 0x6257dd237eb8b120c8038b066e257baee03b9c447c3ba43f843d1856de1fe132
Saving artifacts...
```

我们可以用输出的交易Hash到https://ropsten.etherscan.io/ 查询。


## 前端界面

Truffle Boxs为项目生成了html前端文件`src/index.html`，删除原来Boxs提供的宠物相关代码，加入一下html：

```html
    <div class="form-group">
      <div class="col-sm-8 col-sm-push-1 ">
        <textarea class="form-control" id="new_note" ></textarea>
      </div>
      <button for="new_note" class="" id="add_new">添加笔记</button>
    </div>

  <div id="notes" >
  </div>
```

以上html 定义了一个文本框`textarea`用来输入笔记，定义了一个`button`用来提交笔记上链。
定义了一个id为 notes 的div， 用来加载已有笔记。初始内容为空，后通过[web3](https://web3.learnblockchain.cn/0.2x.x/)读取到合约里笔记后，通过JQuery插入。


## 合约交互

删除原来Boxs提供的加载宠物逻辑，逻辑分三个部分：
1. 初始化 web3 及合约
2. 获取笔记填充到前端页面
3. 发布笔记上链

### 初始化

 在`initWeb3`函数中，完成web3的初始化：

```javascript
    // 最新dapp 浏览器或MetaMask  
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // 请求账号授权
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);
```

完成`initContract`初始化合约：

```javascript
initContract: function() {
    $.getJSON('NoteContract.json', function(data) {
      App.contracts.noteContract = TruffleContract(data);
      App.contracts.noteContract.setProvider(App.web3Provider);

      App.contracts.noteContract.deployed().then(function(instance) {
        App.noteIntance = instance;
        return App.getNotes();
      });
    });
    return App.bindEvents();
}
```

### 获取笔记填充到前端页面

`initContract`函数里， `noteIntance`保存了部署后的合约实例，getNotes用来获取当前账号的所有笔记:

```javascript
getNotes: function() {
    App.noteIntance.getNotesLen(App.account).then(function(len) {
      App.noteLength = len;
      if (len > 0) {
        App.loadNote( len - 1);
      } 
    }).catch(function(err) {
    });
}
```

目前solidity 还无法支持返回动态类型的数组，没有办法直接获取到如string 数组的内容，所有这里采用一个变通的方法，先获取到笔记的长度，然后通过loadNote来逐条获取笔记：

```javascript
loadNote: function(index) {
    App.noteIntance.notes(App.account, index).then(function(note) {
      $("#notes").append(
      '<div > <textarea >'
      + note
      + '</textarea></div>' ;
      if (index -1 >= 0) {
        App.loadNote(index - 1);
      }
    } ).catch(function(err) {
    });
}
```

### 发布笔记上链

使用JQuery监听用户点击`add_new`按钮，然后调用合约的 `addNote` 函数把用户输入的笔记存储到智能合约。

```
  bindEvents: function() {
    $("#add_new").on('click', function() {
      $("#loader").show();

      App.noteIntance.addNote($("#new_note").val()).then(function(result) {
         return App.watchChange();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
}
```

## 运行DApp

使用以下命令，启动DApp 服务：

```
npm run dev
```

在浏览器打开`http://localhost:3000` 浏览器的MetaMask 也需要连接Ropsten网络，确保网络一致。

> 不知道如何设置MetaMask 可阅读[开发、部署第一个去中心化应用(](https://learnblockchain.cn/2018/01/12/first-dapp/)。


本文为保持主干清晰，代码有删减， 网站代码请订阅[小专栏](https://xiaozhuanlan.com/blockchaincore)查看。


## 参考文档

[Truffle 官方文档](https://truffleframework.com/) 


加我微信：xlbxiong 备注：DApp， 加入以太坊DApp开发微信群。


加入[知识星球](https://learnblockchain.cn/images/zsxq.png) 成长比别人快一点。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，学区块链的都在这里，打造最好的区块链技术博客。



