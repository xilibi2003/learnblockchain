---
title: 智能合约语言 Solidity 教程系列4 - 数据存储位置分析 
permalink: solidity_reftype_datalocation
date: 2017-12-21 11:51:02
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---


Solidity教程系列第4篇 - Solidity数据位置分析。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。
<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

这部分的内容官方英文文档讲的不是很透，因此我在参考Solidity官方文档（当前最新版本：0.4.20）的同时加入了深入分析部分，欢迎订阅[专栏](https://xiaozhuanlan.com/blockchaincore)。

## 数据位置(Data location)
在系列第一篇，我们提到 Solidity 类型分为两类：
**值类型(Value Type)** 及 **引用类型(Reference Types)**，
前面我们已经介绍完了值类型，接下来会介绍引用类型。

引用类型是一个复杂类型，占用的空间通常超过256位， 拷贝时开销很大，因此我们需要考虑将它们存储在什么位置，是**memory**（内存中，数据不是永久存在）还是**storage**（永久存储在区块链中）
所有的复杂类型如数组(arrays)和结构体(struct)有一个额外的属性：**数据的存储位置（data location）**。可为**memory**和**storage**。

根据上下文的不同，大多数时候数据位置有默认值，也通过指定关键字storage和memory修改它。

函数参数（包含返回的参数）默认是**memory**。
局部复杂类型变量（local variables）和 状态变量（state variables） 默认是**storage**。
> 局部变量：局部作用域（越过作用域即不可被访问，等待被回收）的变量，如函数内的变量。状态变量：合约内声明的公有变量


还有一个存储位置是：**calldata**，用来存储函数参数，是只读的，不会永久存储的一个数据位置。外部函数的参数（不包括返回参数）被强制指定为calldata。效果与memory差不多。


数据位置指定非常重要，因为他们影响着赋值行为。
在memory和storage之间或与状态变量之间相互赋值，总是会创建一个完全独立的拷贝。
而将一个storage的状态变量，赋值给一个storage的局部变量，是通过引用传递。所以对于局部变量的修改，同时修改关联的状态变量。
另一方面，将一个memory的引用类型赋值给另一个memory的引用，不会创建拷贝（即：memory之间是引用传递）。

> 1. 注意：不能将memory赋值给局部变量。
> 2. 对于值类型，总是会进行拷贝。

下面看一段代码：
```
pragma solidity ^0.4.0;

contract C {
    uint[] x; //  x的存储位置是storage

    // memoryArray的存储位置是 memory
    function f(uint[] memoryArray) public {
        x = memoryArray;    // 从 memory 复制到 storage
        var y = x;          // storage 引用传递局部变量y（y 是一个 storage 引用）
        y[7];               // 返回第8个元素
        y.length = 2;       // x同样会被修改
        delete x;           // y同样会被修改

        // 错误， 不能将memory赋值给局部变量
        // y = memoryArray;  

        // 错误，不能通过引用销毁storage
        // delete y;        

        g(x);               // 引用传递， g可以改变x的内容
        h(x);               // 拷贝到memory， h无法改变x的内容
    }

    function g(uint[] storage storageArray) internal {}
    function h(uint[] memoryArray) public {}
}
```

### 总结 

#### 强制的数据位置(Forced data location)
* 外部函数(External function)的参数(不包括返回参数)强制为：calldata
* 状态变量(State variables)强制为: storage

#### 默认数据位置（Default data location）
* 函数参数及返回参数：memory
* 复杂类型的局部变量：storage

## 深入分析

storage 存储结构是在合约创建的时候就确定好了的，它取决于合约所声明状态变量。但是内容可以被（交易）调用改变。
> Solidity 称这个为状态改变，这也是合约级变量称为**状态变量**的原因。也可以更好的理解为什么状态变量都是storage存储。

memory 只能用于函数内部，memory 声明用来告知EVM在运行时创建一块（固定大小）内存区域给变量使用。
> storage 在区块链中是用key/value的形式存储，而memory则表现为字节数组


### 关于栈（stack）

EVM是一个基于栈的语言，栈实际是在内存(memory)的一个数据结构，每个栈元素占为256位，栈最大长度为1024。
值类型的局部变量是存储在栈上。

### 不同存储的消耗（gas消耗）

* storage 会永久保存合约状态变量，开销最大
* memory 仅保存临时变量，函数调用之后释放，开销很小
* stack  保存很小的局部变量，几乎免费使用，但有数量限制。

## 参考资料
[Solidity官方文档-类型](https://solidity.readthedocs.io/en/develop/types.html#data-location)

另外强烈安利一门课程给大家： [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。


<!---

[1](https://stackoverflow.com/questions/33839154/in-ethereum-solidity-what-is-the-purpose-of-the-memory-keyword)
[2](https://ethereum.stackexchange.com/questions/17964/why-are-local-variables-allocated-to-storage-instead-of-memory) -->


