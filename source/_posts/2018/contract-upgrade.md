---
title: 如何编写一个可升级的智能合约
permalink: contract-upgrade
date: 2018-03-15 16:14:01
categories: 
    - 以太坊
    - 智能合约
tags:
    - 智能合约
author: Tiny熊
---

区块链信任基础的数据不可修改的特性，让它传统应用程序有一个很大的不同的地方是一经发布于区块链上就无法修改（不能直接在原有的合约上直接修改再重新发布）。

<!-- more -->

## 写在前面
阅读本文前，你应该对以太坊、智能合约及[Solidity语言](https://learnblockchain.cn/categories/ethereum/Solidity/)有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)


## 当智能合约出现bug

一方面正式由于智能合约的不可修改的特性，因为只要规则确定之后，没人能够修改它，大家才能够信任它。但另一方面，如果规则的实现有Bug, 可能会造成代币被盗，或是调用消耗大量的gas。这时就需要我们去修复错误。

我们知道一个智能合约包含两部分： 代码逻辑和数据，而代码逻辑又是最容易出问题的部分, 如在实现如下合约时，由于手抖在写addTen()时，10写成了11。


```js
pragma solidity ^0.4.18;

contract MyContract {
    mapping (address => uint256) public balanceOf;
    
    function setBlance(address _address,uint256 v) public {
        balanceOf[_address] = v;
    }

    function addTen(address addr) public returns (uint){
        return balanceOf[addr] + 11;
    }
}

```
假如我们在部署之后发现了这个问题，想要修复这个bug的话，只好重新部署合约，可是这时会有一个尴尬的问题，原来的合约已经有很多人使用，如果部署新的合约，老合约的数据将会丢失。

## 数据合约及控制合约
那么如何解决上面的问题了，一个解决方案是分离合约中的数据，使用一个单独的合约来存储数据（下文称数据合约），使用一个单独的合约写业务逻辑（下文称控制合约）。 
我们来看看代码如何实现。

```js
pragma solidity ^0.4.18;

contract DataContract {
    mapping (address => uint256) public balanceOf;

    function setBlance(address _address,uint256 v) public {
        balanceOf[_address] = v;
    }
}

contract ControlContract {

    DataContract dataContract;

    function ControlContract(address _dataContractAddr) public {
        dataContract = DataContract(_dataContractAddr);
    }

    function addTen(address addr) public returns (uint){
        return dataContract.balanceOf(addr) + 11;
    }
}

```

现在我们有两个合约DataContract 专门用来存数据，ControlContract用来处理逻辑，并利用DataContract来读写数据。通过这样的设计，可以在更新控制合约后保持数据合约不变，这样就不会丢失数据，也不用迁移数据。

## 读写控制
通过DataContract我们可以单独更新合约逻辑，不过你也许发现了一个新的问题，DataContract的数据不仅仅可以被ControlContract读写，还可以被其他的合约读写，因此需要对DataContract添加读写控制。我们给DataContract添加一个mapping, 用来控制哪些地址可以访问数据，同时添加了修饰器及设置访问的方法，代码如下：

```js
pragma solidity ^0.4.18;

contract DataContract {
    mapping (address => uint256) public balanceOf;
    mapping (address => bool) accessAllowed;
    
    function DataContract() public {
        accessAllowed[msg.sender] = true;
    }

    function setBlance(address _address,uint256 v) public {
        balanceOf[_address] = v;
    }
    
    modifier platform() {
        require(accessAllowed[msg.sender] == true);
        _;
    }
    
    function allowAccess(address _addr) platform public {
        accessAllowed[_addr] = true;
    }
    
    function denyAccess(address _addr) platform public {
        accessAllowed[_addr] = false;
    }
}

...

```
订阅我的[小专栏](https://xiaozhuanlan.com/blockchaincore)可参看合约的完整代码。

部署方法如下：
1. 先部署DataContract合约
2. 使用DataContract合约地址作为部署ControlContract合约的参数
3. 用ControlContract合约地址作为参数调用DataContract合约的allowAccess方法。
如果需要更新控制合约(如修复了addTen)则重新执行第2-3步，同时对老的控制合约执行denyAccess()。

## 更多
当我们在实现数据合约时，它包含的逻辑应该越少越好，并且应该是严格测试过的，因为一旦数据合约部署之后，就没法更改。
大多数情况下，和用户交互的是DApp， 因此当控制合约升级之后，需要升级DApp，使之关联新的控制合约。

尽管合约可以通过本文的方式升级，但我们依然要谨慎升级，因为升级表示你可以重写逻辑，会降低用户对你的信任度。
本文介绍升级方法更多的是一种思路，实际项目中可能会对应多个控制合约及数据合约。

欢迎来我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**讨论区块链技术。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
