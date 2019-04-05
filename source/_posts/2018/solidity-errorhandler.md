---
title: 智能合约语言 Solidity 教程系列9 - 错误处理
permalink: solidity-errorhandler
date: 2018-04-07 20:35:47
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

这是Solidity教程系列文章第9篇介绍Solidity 错误处理。
Solidity系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->
## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。


## 什么是错误处理

错误处理是指在程序发生错误时的处理方式，Solidity处理错误和我们常见的语言不一样，Solidity是通过回退状态的方式来处理错误。发生异常时会撤消当前调用（及其所有子调用）所改变的状态，同时给调用者返回一个错误标识。注意**捕捉异常是不可能的**，因此没有try ... catch...。

为什么Solidity处理错误要这样设计呢？
我们可以把区块链理解为是全球共享的分布式事务性数据库。**全球共享**意味着参与这个网络的每一个人都可以读写其中的记录。如果想修改这个数据库中的内容，就必须创建一个事务，**事务**意味着要做的修改（假如我们想同时修改两个值）只能被完全的应用或者一点都没有进行。
学习过数据库的同学，应该理解事务的含义，如果你对事务一词不是很理解，建议你搜索一下“数据库事务“。
Solidity错误处理就是要保证每次调用都是事务性的。


## 如何处理

Solidity提供了两个函数assert和require来进行条件检查，如果条件不满足则抛出异常。assert函数通常用来检查（测试）内部错误，而require函数来检查输入变量或合同状态变量是否满足条件以及验证调用外部合约返回值。
另外，如果我们正确使用assert，有一个Solidity分析工具就可以帮我们分析出智能合约中的错误，帮助我们发现合约中有逻辑错误的bug。


除了可以两个函数assert和require来进行条件检查，另外还有两种方式来触发异常：

1. **revert**函数可以用来标记错误并回退当前调用
2. 使用**throw**关键字抛出异常（从0.4.13版本，throw关键字已被弃用，将来会被淘汰。）

当子调用中发生异常时，异常会自动向上“冒泡”。 不过也有一些例外：send，和底层的函数调用call, delegatecall，callcode，当发生异常时，这些函数返回false。

注意：在一个不存在的地址上调用底层的函数call，delegatecall，callcode 也会返回成功，所以我们在进行调用时，应该总是优先进行函数存在性检查。


在下面通过一个示例来说明如何使用require来检查输入条件，以及assert用于内部错误检查：

```js
pragma solidity ^0.4.0;

contract Sharer {
    function sendHalf(address addr) public payable returns (uint balance) {
        require(msg.value % 2 == 0); // 仅允许偶数
        uint balanceBeforeTransfer = this.balance;
        addr.transfer(msg.value / 2);  // 如果失败，会抛出异常，下面的代码就不是执行
        assert(this.balance == balanceBeforeTransfer - msg.value / 2);
        return this.balance;
    }
}
```

我们实际运行下，看看异常是如何发生的：

1. 首先打开[Remix](https://remix.ethereum.org)，贴入代码，点击创建合约。如下图：
![](https://img.learnblockchain.cn/2018/solidity_error1.jpg!wl)

2. 运行测试1：附加1wei (奇数)去调用sendHalf，这时会发生异常，如下图:

![](https://img.learnblockchain.cn/2018/solidity_error2.jpg!wl)

3. 运行测试2：附加2wei 去调用sendHalf，运行正常。
4. 运行测试3：附加2wei以及sendHalf参数为当前合约本身，在转账是发生异常，因为合约无法接收转账，错误提示上图类似。


## assert类型异常

在下述场景中自动产生assert类型的异常:

1. 如果越界，或负的序号值访问数组，如i >= x.length 或 i < 0时访问x[i]
2. 如果序号越界，或负的序号值时访问一个定长的bytesN。
3. 被除数为0， 如5/0 或 23 % 0。
4. 对一个二进制移动一个负的值。如:5<<i; i为-1时。
5. 整数进行可以显式转换为枚举时，如果将过大值，负值转为枚举类型则抛出异常
6. 如果调用未初始化内部[函数类型](https://learnblockchain.cn/2017/12/12/solidity_func/)的变量。
7. 如果调用**assert**的参数为false

## require类型异常

在下述场景中自动产生require类型的异常:

1. 调用**throw**
2. 如果调用**require**的参数为false
3. 如果你通过消息调用一个函数，但在调用的过程中，并没有正确结束(gas不足，没有匹配到对应的函数，或被调用的函数出现异常)。底层操作如call,send,delegatecall或callcode除外，它们不会抛出异常，但它们会通过返回false来表示失败。
4. 如果在使用new创建一个新合约时出现第3条的原因没有正常完成。
5. 如果调用外部函数调用时，被调用的对象不包含代码。
6. 如果合约没有payable修饰符的public的函数在接收以太币时（包括构造函数，和回退函数）。
7. 如果合约通过一个public的getter函数（public getter funciton）接收以太币。
8. 如果**.transfer()**执行失败

当发生require类型的异常时，Solidity会执行一个回退操作（指令0xfd）。
当发生assert类型的异常时，Solidity会执行一个无效操作（指令0xfe）。
在上述的两种情况下，EVM都会撤回所有的状态改变。是因为期望的结果没有发生，就没法继续安全执行。必须保证交易的原子性（一致性，要么全部执行，要么一点改变都没有，不能只改变一部分），所以需要撤销所有操作，让整个交易没有任何影响。

注意assert类型的异常会消耗掉所有的gas, 而require从大都会版本（Metropolis， 即目前主网所在的版本）起不会消耗gas。

## 参考文献
* [Solidity 错误处理](https://solidity.readthedocs.io/en/v0.4.21/control-structures.html#error-handling-assert-require-revert-and-exceptions)

欢迎来我的知识星球[**深入浅出区块链**](https://learnblockchain.cn/images/zsxq.png)讨论区块链技术，同时我也会为大家提供区块链技术解答，作为星友福利，星友可加入区块链技术付费交流群。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。




