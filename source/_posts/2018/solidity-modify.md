---
title: 智能合约语言 Solidity 教程系列10 - 完全理解函数修改器
permalink: solidity-modify
date: 2018-04-09 20:35:47
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

这是Solidity教程系列文章第10篇，带大家完全理解Solidity的函数修改器。
Solidity系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。


## 函数修改器(Function Modifiers)

函数修改器(Modifiers)可以用来改变一个函数的行为。比如用于在函数执行前检查某种前置条件。

> 如果熟悉Python的同学，会发现函数修改器的作用和Python的装饰器很相似。

修改器是一种可被继承合约属性，同时还可被继承的合约重写(override)。下面我们来看一段示例代码： 

```js
pragma solidity ^0.4.11;

contract owned {
    function owned() public { owner = msg.sender; }
    address owner;

    // 定义了一个函数修改器，可被继承
    //  修饰时，函数体被插入到 “_;” 处
    // 不符合条件时，将抛出异常
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

contract mortal is owned {
    //  使用继承的`onlyOwner` 
    function close() public onlyOwner {
        selfdestruct(owner);
    }
}

contract priced {
    // 函数修改器可接收参数
    modifier costs(uint price) {
        if (msg.value >= price) {
            _;
        }
    }
}

contract Register is priced, owned {
    mapping (address => bool) registeredAddresses;
    uint price;

    function Register(uint initialPrice) public { price = initialPrice; }

    // 需要提供payable 以接受以太
    function register() public payable costs(price) {
        registeredAddresses[msg.sender] = true;
    }

    function changePrice(uint _price) public onlyOwner {
        price = _price;
    }
}

```

上面onlyOwner就是定义的一个函数修改器，当用这个修改器区修饰一个函数时，则函数必须满足onlyOwner的条件才能运行，这里的条件是：必须是合约的创建这才能调用函数，否则抛出异常。
我们在[实现一个可管理、增发、兑换、冻结等高级功能的代币](https://learnblockchain.cn/2018/01/27/create-token2/)文章中就使用了这个函数修改器。

### 多个修改器
如果同一个函数有多个修改器，他们之间以空格隔开，修饰器会依次检查执行。

在修改器中或函数内的显式的return语句，仅仅跳出当前的修改器或函数。返回的变量会被赋值，但执行流会在前一个修改器后面定义的"_"后继续执行， 如：

```js
contract Mutex {
    bool locked;
    modifier noReentrancy() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    // 防止递归调用
    // return 7 之后，locked = false 依然会执行
    function f() public noReentrancy returns (uint) {
        require(msg.sender.call());
        return 7;
    }
}
```

修改器的参数可以是任意表达式。在此上下文中，所有的函数中引入的符号，在修改器中均可见。但修改器中引入的符号在函数中不可见，因为它们有可能被重写。

### 深入理解修改器的执行次序
再来看一个复杂一点的例子，来深入理解修改器：

```js

pragma solidity ^0.4.11;


contract modifysample {

    uint a = 10;
    
    modifier mf1 (uint b) {
        uint c = b;
        _;
        c = a;
        a = 11;
    }
    
     modifier mf2 () {
        uint c = a;
        _;
    }
    
    modifier mf3() {
        a = 12;
        return ;
        _;
        a = 13;
    }
    
    function test1() mf1(a) mf2 mf3 public   {
        a = 1;
    }
    
     function test2() public constant returns (uint)   {
        return a;  
    }  
}

```
上面的智能合约运行test1()之后，状态变量a的值是多少， 是1， 11， 12，还是13呢？
答案是 11, 大家可以运行下test2获取下a值。

我们来分析一下 test1， 它扩展之后是这样的：

```js
uint c = b;
        uint c = a;
            a = 12;
            return ;
            _;
            a = 13;
c = a;
a = 11;
```

这个时候就一目了然了，最后a 为11， 注意第5及第6行是不是执行的。

强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

## 参考文献
[官方文档-Function Modifiers](https://solidity.readthedocs.io/en/develop/contracts.html#function-modifiers)

如果你想和认识我，和我建立联系，欢迎加入知识星球[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)，我会在星球为大家解答技术问题，作为星友福利，星友可加入我创建的区块链技术群，群内已经聚集了200多位区块链技术爱好者。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


