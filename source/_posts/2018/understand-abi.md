---
title: 如何理解以太坊ABI - 应用程序二进制接口
permalink: understand-abi
date: 2018-08-09 17:08:39
categories: 
    - 以太坊
tags:
    - ABI
author: Tiny熊
---

很多同学不是很明白以太坊ABI是什么，他的作用是什么，读完本文就明白了。

<!-- more -->

## 写在前面

阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)，也可以观看我们的视频：[零基础搞懂区块链](https://ke.qq.com/course/318230
)和[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528), 可以系统全面学习理解以太坊、智能合约。

## ABI 是什么

ABI 全称是 Application Binary Interface，翻译过来就是：应用程序二进制接口，简单来说就是 以太坊的调用合约时的接口说明。还不是很理解，没关系。

## 调用合约函数发生了什么

从外部施加给以太坊的行为都称之为向以太坊网络提交了一个交易， 调用合约函数其实是向合约地址（账户）提交了一个交易，这个交易有一个附加数据，这个附加的数据就是ABI的编码数据。
![](https://img.learnblockchain.cn/2018/abi1.jpg!wl)

> 比特币的交易也可以附加数据，以太坊革命性的地方就是能把附加数据转化为都函数的执行。

因此要想和合约交互，就离不开ABI数据。

### 演示调用函数

以下面以个最简单的合约为例，我们看看用参数 1 调用`set(uint x)`，这个交易附带的数据是什么。

```js
pragma solidity ^0.4.0;

contract SimpleStorage {
    
    uint storedData;
    
    function set(uint x) public {
        storedData = x;
    }

    function get() public constant returns (uint) {
        return storedData;
    }
}
```

当然第一步需要先把合约部署到以太坊网络（其实部署也是一个）上，然后用 “1” 作为参数调用set，如下图:
![](https://img.learnblockchain.cn/2018/abi2.jpg!wl)

然后我们打开etherscan查看[交易详情数据](https://ropsten.etherscan.io/tx/0xd773a6909808f99c5a26c0c890af8b0bb6d784f29a3af55e04fa35d44d7716e2), 可以看到其附加数据如下图：
![](https://img.learnblockchain.cn/2018/abi3.jpg!wl)

这个数据就是ABI的编码数据：
```
0x60fe47b10000000000000000000000000000000000000000000000000000000000000001
```

## ABI 编码分析

我把上面交易的附加数据拷贝出来分析一下，这个数据可以分成两个子部分：

* 函数选择器(4字节)
0x60fe47b1

* 第一个参数(32字节)
00000000000000000000000000000000000000000000000000000000000000001

函数选择器值 实际是对函数签名字符串进行sha3（keccak256）哈希运算之后，取前4个字节，用代码表示就是：

```js
    bytes4(sha3(“set(uint256)”)) == 0x60fe47b1
```

参数部分则是使用对应的16进制数。

现在就好理解 附加数据怎么转化为对应的函数调用。

##  ABI 编码函数

那么怎么获得函数对应的ABI 数据呢， 有两种方法：

### Solidity ABI 编码函数
一个是 solidity 提供了ABI的相关[API](https://learnblockchain.cn/2018/03/14/solidity-api/)， 用来直接得到ABI编码信息，这些函数有：

* abi.encode(...) returns (bytes)：计算参数的ABI编码。
* abi.encodePacked(...) returns (bytes)：计算参数的紧密打包编码
* abi. encodeWithSelector(bytes4 selector, ...) returns (bytes)： 计算函数选择器和参数的ABI编码
* abi.encodeWithSignature(string signature, ...) returns (bytes): 等价于* abi.encodeWithSelector(bytes4(keccak256(signature), ...)

通过ABI编码函数可以在不用调用函数的情况下，获得ABI编码值，下面通过一段代码来看看这些方法的使用：

```js
pragma solidity ^0.4.24;

contract testABI {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function abiEncode() public constant returns (bytes) {
        abi.encode(1);  // 计算1的ABI编码
        return abi.encodeWithSignature("set(uint256)", 1); //计算函数set(uint256) 及参数1 的ABI 编码
    }
}
```

大家可以运行运行下`abiEncode`函数，它的输出其实就是前面调用的附加数据。

### Web3 ABI 编码函数

另一个web3提供相应的API，例如使用web3计算函数选择器的方式如下：

```js
web3.eth.abi.encodeFunctionSignature('myMethod(uint256,string)');
```

其完整的文档在[这里](http://web3js.readthedocs.io/en/1.0/web3-eth-abi.html)，这里不一一演示。

另外安利两门视频课程给大家：
*  [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) - Solidity 语言面面俱到
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发

欢迎来[知识星球](https://learnblockchain.cn/images/zsxq.png)提问，星球内已经聚集了300多位区块链技术爱好者。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

