---
title: Solidity 教程系列11 - 视图函数、虚函数讲解
permalink: solidity-functions
date: 2018-05-17 22:16:29
categories: 
    - 以太坊
    - 智能合约
    - Solidity
tags:
    - Solidity
    - 智能合约

author: Tiny熊
---

Solidity 教程系列第11篇 - Solidity 视图函数、虚函数讲解。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。

## 视图函数（View Functions）
一个函数如果它不修改状态变量，应该声明为**view**函数，不过下面几种情况认为是修改了状态：

1. 写状态变量
2. 触发事件（events）
3. 创建其他的合约
4. call调用附加了以太币
5. 调用了任何没有**view**或**pure**修饰的函数
6. 使用了低级别的调用（low-level calls）
7. 使用了包含特定操作符的内联汇编

看一个例子：

```js
pragma solidity ^0.4.16;

contract C {
    uint public data = 0;

    function f(uint a, uint b) public view returns (uint) {
        return a * (b + 42) + now;
    }

    // 错误做法，虽然可以编译通过
    function df(uint a) public view  {
        data = a;
    }
}

```

有几个地方需要注意一下：
1. 声明为**view** 和声明为**constant**是等价的，constant是view的别名，constant在计划Solidity 0.5.0版本之后会弃用（constant这个词有歧义，view 也更能表达返回值可视）。
2. 访问函数都被标记为view。

当前编译器并未强制要求声明为view，但建议大家对于不会修改状态的函数的标记为view。

## 纯函数（Pure Functions）

函数可以声明为**view**，表示它即不读取状态，也不修改状态，除了上一节介绍的几种修改状态的情况，以下几种情况被认为是读取了状态：
1. 读状态变量
2. 访问了 **this.balance** 或 **\<address>.balance**
3. 访问了**block**, **tx**, **msg** 的成员 (msg.sig 和 msg.data除外).
4. 调用了任何没有**pure**修饰的函数
5. 使用了包含特定操作符的内联汇编

看一个例子：

```js
pragma solidity ^0.4.16;

contract C {
    function f(uint a, uint b) public pure returns (uint) {
        return a * (b + 42);
    }
}
```

尽管view 和 pure 修饰符编译器并未强制要求使用，view 和 pure 修饰也不会带来gas 消耗的改变，但是更好的编码习惯让我们跟容易发现智能合约中的错误。


强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

## 参考文献
[官方文档-函数](https://solidity.readthedocs.io/en/develop/contracts.html#functions)

欢迎来[知识星球](https://learnblockchain.cn/images/zsxq.png)提问，星球内已经聚集了300多位区块链技术爱好者。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

