---
title: 智能合约语言 Solidity 教程系列8 - Solidity API
permalink: solidity-api
date: 2018-03-14 23:04:43
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---
这是Solidity教程系列文章第8篇介绍Solidity API，它们主要表现为内置的特殊的变量及函数，存在于全局命名空间里。

Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->
## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。

Solidity API 主要表现为Solidity 内置的特殊的变量及函数，他们存在于全局命名空间里，主要分为以下几类：
1. 有关区块和交易的属性
2. ABI编码函数
3. 有关错误处理
4. 有关数学及加密功能
5. 地址相关
6. 合约相关

下面详细讲解下

## 区块和交易的属性（Block And Transaction Properties）
用来提供一些区块链当前的信息。

* blockhash(uint blockNumber) returns (bytes32)：返回给定区块号的哈希值，只支持最近256个区块，且不包含当前区块。
* block.coinbase (address): 当前块矿工的地址。
* block.difficulty (uint):当前块的难度。
* block.gaslimit (uint):当前块的gaslimit。
* block.number (uint):当前区块的块号。
* block.timestamp (uint): 当前块的Unix时间戳（从1970/1/1 00:00:00 UTC开始所经过的秒数）
* gasleft() (uint256):  获取剩余gas。
* msg.data (bytes): 完整的调用数据（calldata）。
* msg.gas (uint): 当前还剩的gas（弃用）。
* msg.sender (address): 当前调用发起人的地址。
* msg.sig (bytes4):调用数据(calldata)的前四个字节（例如为：函数标识符）。
* msg.value (uint): 这个消息所附带的以太币，单位为wei。
* now (uint): 当前块的时间戳(block.timestamp的别名)
* tx.gasprice (uint) : 交易的gas价格。
* tx.origin (address): 交易的发送者（全调用链）

注意：
msg的所有成员值，如msg.sender,msg.value的值可以因为每一次外部函数调用，或库函数调用发生变化（因为msg就是和调用相关的全局变量）。

不应该依据 block.timestamp, now 和 block.blockhash来产生一个随机数（除非你确实需要这样做），这几个值在一定程度上被矿工影响（比如在赌博合约里，不诚实的矿工可能会重试去选择一个对自己有利的hash）。

对于同一个链上连续的区块来说，当前区块的时间戳（timestamp）总是会大于上一个区块的时间戳。

为了可扩展性的原因，你只能查最近256个块，所有其它的将返回0.

## ABI编码函数

Solidity 提供了一下函数，用来直接得到ABI编码信息，这些函数有：
	* abi.encode(...) returns (bytes)：计算参数的ABI编码。
	* abi.encodePacked(...) returns (bytes)：计算参数的紧密打包编码
	* abi. encodeWithSelector(bytes4 selector, ...) returns (bytes)： 计算函数选择器和参数的ABI编码
	* abi.encodeWithSignature(string signature, ...) returns (bytes): 等价于* abi.encodeWithSelector(bytes4(keccak256(signature), ...)

通过ABI编码函数可以在不用调用函数的情况下，获得ABI编码值，下面通过一段代码来看看这些方式的使用：

```js
pragma solidity ^0.4.24;

contract testABI {
    function abiEncode() public constant returns (bytes) {
        abi.encode(1);  // 计算 1 的ABI编码
        return abi.encodeWithSignature("set(uint256)", 1); //计算函数set(uint256) 及参数1 的ABI 编码
    }
}
```


## 错误处理
* assert(bool condition)
用于判断内部错误，条件不满足时抛出异常
* require(bool condition):
用于判断输入或外部组件错误，条件不满足时抛出异常
* require(bool condition, string message)
同上，多了一个错误信息。
* revert():
终止执行并还原改变的状态
* revert(string reason)
同上，提供一个错误信息。

之前老的错误处理方式用throw 及 if ... throw，这种方式会消耗掉所有剩余的gas。目前throw 的方式已经被弃用。


## 数学及加密功能
* addmod(uint x, uint y, uint k) returns (uint):
计算(x + y) % k，加法支持任意的精度且不会在2**256处溢出，从0.5.0版本开始断言k != 0。
* mulmod(uint x, uint y, uint k) returns (uint):
计算 (x * y) % k， 乘法支持任意的精度且不会在2**256处溢出， 从0.5.0版本开始断言k != 0。
* keccak256(...) returns (bytes32):
使用以太坊的（Keccak-256）计算HASH值。紧密打包参数。
* sha256(...) returns (bytes32):
使用SHA-256计算hash值，紧密打包参数。
* sha3(...) returns (bytes32):
keccak256的别名
* ripemd160(...) returns (bytes20):
使用RIPEMD-160计算HASH值。紧密打包参数。
* ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):
通过椭圆曲线签名来恢复与公钥关联的地址，或者在错误时返回零。可用于签名数据的校验，如果返回结果是签名者的公匙地址，那么说明数据是正确的。
> ecrecover函数需要四个参数，需要被签名数据的哈希结果值，r，s，v分别来自签名结果串。
r = signature[0:64]
s = signature[64:128]
v = signature[128:130]
其中v取出来的值或者是00或01。要使用时，我们先要将其转为整型，再加上27，所以我们将得到27或28。在调用函数时v将填入27或28。

用javascript表达如下:
```js
    var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'

    var hash = web3.sha3(msg)
    var sig = web3.eth.sign(address, h).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
```
订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)可以参考到完整的使用例子。
<!-- 
[例子](https://ethereum.stackexchange.com/questions/1777/workflow-on-signing-a-string-with-private-key-followed-by-signature-verificatio)： 
-->


紧密打包参数（tightly packed）意思是说参数不会补位，是直接连接在一起的，下面几个是相等的。

```
keccak256("ab", "c")
keccak256("abc")

keccak256(0x616263)  // hex
keccak256(6382179)
keccak256(97, 98, 99)   //ascii
```
如果需要填充，可以使用显式类型转换：keccak256("\x00\x12") 与keccak256(uint16(0x12))相同。

注意，常量将使用存储它们所需的最少字节数来打包，例如keccak256(0) == keccak256(uint8(0))和keccak256(0x12345678) == keccak256(uint32(0x12345678))

在私链(private blockchain)上运行sha256,ripemd160或ecrecover可能会出现Out-Of-Gas报错。因为私链实现了一种预编译合约，合约要在收到第一个消息后才会真正存在（虽然他们的合约代码是硬编码的）。而向一个不存在的合约发送消息，所以才会导致Out-Of-Gas的问题。一种解决办法（workaround）是每个在你真正使用它们之前先发送1 wei到这些合约上来完成初始化。在官方和测试链上没有这个问题。


## 地址相关

* <address>.balance (uint256):
Address的余额，以wei为单位。

* <address>.transfer(uint256 amount):
发送给定数量的ether到某个地址，以wei为单位。失败时抛出异常。

* <address>.send(uint256 amount) returns (bool):
发送给定数量的ether到某个地址，以wei为单位, 失败时返回false。

* <address>.call(...) returns (bool):
发起底层的call调用。失败时返回false。

* <address>.callcode(...) returns (bool):
发起底层的callcode调用，失败时返回false。
不鼓励使用，未来可能会移除。

* <address>.delegatecall(...) returns (bool):
发起底层的delegatecall调用，失败时返回false

更多信息参考[地址篇](https://xiaozhuanlan.com/topic/7921803456)。

**警告**：send() 执行有一些风险：如果调用栈的深度超过1024或gas耗光，交易都会失败。因此，为了保证安全，必须检查send的返回值，如果交易失败，会回退以太币。如果用transfer会更好。

## 合约相关

* this（当前合约的类型）:
表示当前合约，可以显式的转换为Address
* selfdestruct(address recipient):
销毁当前合约，并把它所有资金发送到给定的地址。
* suicide(address recipient):
selfdestruct的别名

另外，当前合约里的所有函数均可支持调用，包括当前函数本身。

强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

## 参考文档
* [Special Variables and Functions](https://solidity.readthedocs.io/en/develop/units-and-global-variables.html#units-and-globally-available-variables)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果想与我有更密切的交流可以选择加入我的[知识星球](https://learnblockchain.cn/images/zsxq.png)（星球成员可加入微信技术交流群）

