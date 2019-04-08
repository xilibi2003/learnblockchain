---
title: 智能合约语言 Solidity 教程系列13 -  函数调用
permalink: solidity-callfun
date: 2018-08-09 11:17:17
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

这是Solidity教程系列文章第13篇介绍函数调用， 本文会介绍函数使用元组返回多个值，通过命名方式进行参数调用以及如何省略函数参数名称。

Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。


## 函数调用及参数

在[函数类型](https://xiaozhuanlan.com/topic/1293405678)一节中，我们介绍过Solidity 中有两种函数调用方式：内部函数调用和外部函数调用，这一节我们进一步介绍。


## 内部函数调用（Internal Function Calls）

内部调用，不会创建一个EVM消息调用。而是直接调用当前合约的函数，也可以递归调用。
如下面这个的例子：

```js
pragma solidity ^0.4.16;

contract C {
    function g(uint a) public pure returns (uint ret) {
      return f();       // 直接调用
    }
    
    function f() internal pure returns (uint ret) {
     return g(7) + f();    // 直接调用及递归调用
    }
}
```

这些函数调用被转换为EVM内部的简单指令跳转（jumps）。 这样带来的一个好处是，当前的内存不会被回收。在一个内部调用时传递一个内存型引用效率将非常高的。当然，仅仅是同一个合约的函数之间才可通过内部的方式进行调用。


## 外部函数调用(External Function Calls)

外部调用，会创建EVM**消息调用**。
表达式this.g(8);和c.g(2)（这里的c是一个合约实例）是外部调用函数的方式，它会发起一个消息调用，而不是EVM的指令跳转。需要注意的是，在合约的构造器中，不能使用this调用函数，因为当前合约还没有创建完成。

其它合约的函数必须通过外部的方式调用。对于一个外部调用，所有函数的参数必须要拷贝到内存中。

当调用其它合约的函数时，可以通过选项**.value()**，和**.gas()**来分别指定要发送的以太币（以wei为单位）和gas值，如：

```js
pragma solidity ^0.4.0;

contract InfoFeed {
    function info() public payable returns (uint ret) { return 42; }
}

contract Consumer {
    InfoFeed feed;
    
    function setFeed(address addr) public {
      feed = InfoFeed(addr);
    }

    function callFeed() public {
      feed.info.value(10).gas(800)();  // 附加以太币及gas来调用info
    }
}
```

info()函数，必须使用payable关键字，否则不能通过value()来接收以太币。

表达式InfoFeed(addr)进行了一个显示的类型转换，表示给定的地址是合约InfoFeed类型，这里并不会执行构造器的初始化。
在进行显式的类型强制转换时需要非常小心，不要调用一个我们不知道类型的合约函数。

我们也可以使用**function setFeed(InfoFeed _feed) { feed = _feed; }**来直接进行赋值。
注意**feed.info.value(10).gas(800)**仅仅是对发送的以太币和gas值进行了设置，真正的调用是后面的括号()。
调用callFeed时，需要预先存入一定量的以太币，要不能会因余额不足报错。

> 如果我们不知道被调用的合约源代码，和它们交互会有潜在的风险，即便被调用的合约继承自一个已知的父合约（继承仅仅要求正确实现接口，而不关注实现的内容）。
因为和他们交互，相当于把自己控制权交给被调用的合约，对方几乎可以利用它做任何事。
> 此外, 被调用的合约可以改变调用合约的状态变量，在编写函数时需要注意可重入性漏洞问题（可查看安全建议）。


## 函数参数

与其他语言一样，函数可以提供参数作为输入（函数类型本身也可以作为参数）; 与Javascript和C不同的是，solidity还可以返回任意数量的参数作为输出。

### 输入参数

输入参数的声明方式与变量相同， 未使用的参数可以省略变量名称。假设我们希望合约接受一种带有两个整数参数的外部调用，可以这样写：

```js
pragma solidity ^0.4.16;

contract Simple {
    function taker(uint _a, uint _b) public pure {
        // 使用 _a  _b
    }
}
```

### 输出参数

输出参数的声明和输入参数一样，只不过它接在returns 之后，假设我们希望返回两个结果：两个给定整数的和及积，可以这样写：

```js
pragma solidity ^0.4.16;

contract Simple {
    function arithmetics(uint _a, uint _b)
        public
        pure
        returns (uint o_sum, uint o_product)
    {
        o_sum = _a + _b;
        o_product = _a * _b;
    }
}
```

可以省略输出参数的名称，也可以使用return语句指定输出值，return可以返回多个值（见下文）。
返回一个没有赋值的参数，则默认为0。

输入参数和输出参数可以在函数内表达式中使用，也可以作为被赋值的对象， 如：

```js
contract Simple {
    function taker(uint _a, uint _b) public pure returns (uint _c) {
        _a = 1;
        _b = 2;
        _c = 3;
    }
}

```


### 返回多个值


当一个函数有多个输出参数时, 可以使用元组(tuple)来返回多个值。元组(tuple)是一个数量固定，类型可以不同的元素组成的一个列表（用小括号表示），使用return (v0, v1, ..., vn) 语句，就可以返回多个值，返回值的数量需要和输出参数声明的数量一致。

```js
    function f() public pure returns (uint, bool, uint) {
        // 使用元组返回多个值
        return (7, true, 2);
    }
    
    function callf() public {
        uint x;
        bool y;
        uint z;
        // 使用元组给多个变量赋值
        (x, y , z)  = f();
    }
```

#### 补充关于元组的介绍

上面的代码中，使用了元组返回多个值及使用元组给多个变量赋值，给多个变量赋值通常也称为解构（解构的概念在函数式语言中较为常见），再来看看元组的一些用法，比如元组可以交换变量值，如：

```js
(x, y) = (y, x);
```

元组支持省略一些元素， 如：

```js
(x, y, ) = (1, 2, 4);
```

开头的元素也可以省略，如：

```js
(, y, ) = (1, 2, 4);
```


注意 (1,) 是一个一个元素的元组， (1) 只是1。


### 使用命名参数调用

函数调用的参数，可以通过指定名称的方式调用，使用花括号{} 包起来，参数顺序任意，但参数的类型和数量要与定义一致。
如：

```js
pragma solidity ^0.4.0;

contract C {
    function f(uint key, uint value) public {
        // ...
    }

    function g() public {
        f({value: 2, key: 3});  // 命名参数
    }
}
```

### 省略函数参数名称

没有使用的参数名称可以省略(一般常见于返回值)。这些参数依然在栈(stack)上存在，但不可访问。

```js
pragma solidity ^0.4.16;

contract C {
    // omitted name for parameter
    function func(uint k, uint) public pure returns(uint) {
        return k;
    }
}
```

强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果想与我有更密切的交流可以选择加入我的[知识星球](https://learnblockchain.cn/images/zsxq.png)（星球成员可加入微信技术交流群）


