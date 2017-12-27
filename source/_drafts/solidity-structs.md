---
title: 智能合约语言 Solidity 教程系列6 - 结构体与映射
date: 2017-12-27 11:55:26
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

Solidity 教程系列第6篇 - Solidity 结构体。

<!-- more -->
## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

本文前半部分是参考Solidity官方文档（当前最新版本：0.4.20）进行翻译，后半部分对官方文档中没有提供代码的知识点补充代码说明（订阅[专栏](https://xiaozhuanlan.com/blockchaincore)阅读）。

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

Mapping types are declared as mapping(_KeyType => _ValueType). Here _KeyType can be almost any type except for a mapping, a dynamically sized array, a contract, an enum and a struct. _ValueType can actually be any type, including mappings.

Mappings can be seen as hash tables which are virtually initialized such that every possible key exists and is mapped to a value whose byte-representation is all zeros: a type’s default value. The similarity ends here, though: The key data is not actually stored in a mapping, only its keccak256 hash used to look up the value.

Because of this, mappings do not have a length or a concept of a key or value being “set”.

Mappings are only allowed for state variables (or as storage reference types in internal functions).

It is possible to mark mappings public and have Solidity create a getter. The _KeyType will become a required parameter for the getter and it will return _ValueType.

The _ValueType can be a mapping too. The getter will have one parameter for each _KeyType, recursively.

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

Note

Mappings are not iterable, but it is possible to implement a data structure on top of them. For an example, see iterable mapping.