---
title: 智能合约语言 Solidity 教程系列6 - 结构体与映射
permalink: solidity-structs
date: 2017-12-27 11:55:26
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

Solidity 教程系列第6篇 - Solidity 结构体与映射。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->
## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

本系列文章一部分是参考Solidity官方文档（当前最新版本：0.4.20）进行翻译，另一部分是Solidity深入分析，这部分请订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读。

## 结构体(Structs)

Solidity提供**struct**来定义自定义类型，自定义的类型是引用类型。
我们看看下面的例子：
```js
pragma solidity ^0.4.11;

contract CrowdFunding {
    // 定义一个包含两个成员的新类型
    struct Funder {
        address addr;
        uint amount;
    }

    struct Campaign {
        address beneficiary;
        uint fundingGoal;
        uint numFunders;
        uint amount;
        mapping (uint => Funder) funders;
    }

    uint numCampaigns;
    mapping (uint => Campaign) campaigns;

    function newCampaign(address beneficiary, uint goal) public returns (uint campaignID) {
        campaignID = numCampaigns++; // campaignID 作为一个变量返回
        // 创建一个结构体实例，存储在storage ，放入mapping里
        campaigns[campaignID] = Campaign(beneficiary, goal, 0, 0);
    }

    function contribute(uint campaignID) public payable {
        Campaign storage c = campaigns[campaignID];
        // 用mapping对应项创建一个结构体引用
        // 也可以用 Funder(msg.sender, msg.value) 来初始化.
        c.funders[c.numFunders++] = Funder({addr: msg.sender, amount: msg.value});
        c.amount += msg.value;
    }

    function checkGoalReached(uint campaignID) public returns (bool reached) {
        Campaign storage c = campaigns[campaignID];
        if (c.amount < c.fundingGoal)
            return false;
        uint amount = c.amount;
        c.amount = 0;
        c.beneficiary.transfer(amount);
        return true;
    }
}
```
上面是一个简化版的众筹合约，但它可以让我们理解**structs**的基础概念，**struct**可以用于映射和数组中作为元素。其本身也可以包含映射和数组等类型。

不能声明一个struct同时将自身struct作为成员，这个限制是基于结构体的大小必须是有限的。
但**struct**可以作为**mapping**的值类型成员。

注意在函数中，将一个**struct**赋值给一个局部变量（默认是storage类型），实际是拷贝的引用，所以修改局部变量值的同时，会影响到原变量。

当然，也可以直接通过访问成员修改值，而不用一定赋值给一个局部变量，如campaigns[campaignID].amount = 0

## 映射(Mappings)

映射类型，一种键值对的映射关系存储结构。定义方式为mapping(_KeyType => _KeyValue)。键类型允许除映射、变长数组、合约、枚举、结构体外的几乎所有类型（）。值类型没有任何限制，可以为任何类型包括映射类型。

**映射**可以被视作为一个哈希表，所有可能的键会被虚拟化的创建，映射到一个类型的默认值（二进制的全零表示）。在映射表中，并不存储键的数据，仅仅存储它的keccak256哈希值，这个哈希值在查找值时需要用到。
正因为此，**映射**是没有长度的，也没有键集合或值集合的概念。

**映射类型**，仅能用来作为状态变量，或在内部函数中作为**storage**类型的引用。

可以通过将映射标记为public，来让Solidity创建一个访问器。通过提供一个键值做为参数来访问它，将返回对应的值。
映射的值类型也可以是映射，使用访问器访问时，要提供这个映射值所对应的键，不断重复这个过程。
来看一个例子：


```js
pragma solidity ^0.4.0;

contract MappingExample {
    mapping(address => uint) public balances;

    function update(uint newBalance) public {
        balances[msg.sender] = newBalance;
    }
}

contract MappingUser {
    function f() public returns (uint) {
        MappingExample m = new MappingExample();
        m.update(100);
        return m.balances(this);
    }
}
```

注意：
映射并未提供迭代输出的方法，可以自行实现一个这样的数据结构。参考[iterable mapping](https://github.com/ethereum/dapp-bin/blob/master/library/iterable_mapping.sol)

另外强烈安利一门课程给大家： [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。

## 参考文档
[Solidity官方文档](https://solidity.readthedocs.io/en/develop/types.html#mappings)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。


