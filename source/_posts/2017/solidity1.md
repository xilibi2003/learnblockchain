---
title: 智能合约语言 Solidity 教程系列1 - 类型介绍  
permalink: solidity1
date: 2017-12-05 15:25:59
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

现在的Solidity中文文档，要么翻译的太烂，要么太旧，决定重新翻译下。
尤其点名批评极客学院名为《Solidity官方文档中文版》的翻译，机器翻译的都比它好，大家还是别看了。


<!-- more -->

## 写在前面

Solidity是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)
Solidity教程会是一系列文章，本文是第一篇：介绍Solidity的变量类型。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

本文前半部分是参考Solidity官方文档（当前最新版本：0.4.24）进行翻译，后半部分是结合实际合约代码实例说明类型的使用（仅针对[专栏](https://xiaozhuanlan.com/blockchaincore)订阅用户）。

## 类型 
Solidity是一种静态类型语言，意味着每个变量（本地或状态变量）需要在编译时指定变量的类型（或至少可以推倒出类型）。Solidity提供了一些基本类型可以用来组合成复杂类型。

Solidity类型分为两类：
* 值类型(Value Type) - 变量在赋值或传参时，总是进行值拷贝。
* 引用类型(Reference Types)

### 值类型(Value Type)
**值类型**包含:
* 布尔类型(Booleans)
* 整型(Integers)
* 定长浮点型(Fixed Point Numbers)
* 定长字节数组(Fixed-size byte arrays)
* 有理数和整型常量(Rational and Integer Literals)
* 字符串常量（String literals）
* 十六进制常量（Hexadecimal literals）
* 枚举(Enums)
* [函数类型](https://learnblockchain.cn/2017/12/12/solidity_func/)(Function Types)
* [地址类型](https://learnblockchain.cn/2017/12/12/solidity2/)(Address)
* 地址常量(Address Literals)
> [函数类型](https://learnblockchain.cn/2017/12/12/solidity_func/)及[地址类型](https://learnblockchain.cn/2017/12/12/solidity2/)(Address)有单独的博文，请点击查看。

## 布尔类型(Booleans)
**布尔(bool)**:可能的取值为常量值**true**和**false**。

布尔类型支持的运算符有：
* ！逻辑非
* && 逻辑与
* || 逻辑或
* == 等于
* != 不等于

注意：运算符**&&**和**||**是短路运算符，如f(x)||g(y)，当f(x)为真时，则不会继续执行g(y)。

## 整型(Integers)
**int**/**uint**: 表示有符号和无符号不同位数整数。支持关键字**uint8** 到 **uint256** (以8步进)，
**uint** 和 **int** 对应的是 **uint256** 和 **int256**。

支持的运算符：

* 比较运算符： <=, < , ==, !=, >=, > (返回布尔值：true 或 false)
* 位操作符： &，|，^(异或)，~（位取反）
* 移位运算： << (左移位), >>(右移位)
* 算术操作符：+，-，一元运算-，一元运算+，*，/, %(取余数), \*\*（幂）

说明：
1. 整数除法总是截断的，但如果运算符是字面量（字面量稍后讲)，则不会截断。
2. 整数除0会抛异常。
3. 移位运算的结果的正负取决于操作符左边的数。x << y 和 x * (2\*\*y) 是相等， x >> y 和 x / (2\*\*y) 是相等的。
4. 不能进行负移位，即操作符右边的数不可以为负数，否则会抛出运行时异常。


每个整数变量，都是有限定取值范围的，如uint32 的取值分为是 0 到 2\*\*32 - 1， 如果运算之后，取值不在这个范围内，结果会被截断（溢出）。

注意：Solidity中，右移位是和除等价的，因此右移位一个负数，向下取整时会为0，而不像其他语言里为无限负小数。


## 定长浮点型（Fixed Point Numbers）

注意：定长浮点型 Solidity（发文时）还不完全支持，它可以用来声明变量，但不可以用来赋值。

**fixed**/**ufixed**: 表示有符号和无符号的固定位浮点数。关键字为**ufixedMxN** 和 **ufixedMxN**。
**M**表示这个类型要占用的位数，以8步进，可为8到256位。
**N**表示小数点的个数，可为0到80之间

支持的运算符：
* 比较运算符： <=, < , ==, !=, >=, > (返回布尔值：true 或 false)
* 算术操作符：+，-，一元运算-，一元运算+，*，/, %(取余数)
注意：它和大多数语言的float和double不一样， M 是表示整个数占用的固定位数，包含整数部分和小数部分。因此用一个小位数（M较小）来表示一个浮点数时，小数部分会几乎占用整个空间。

## 定长字节数组(Fixed-size byte arrays)
关键字有：bytes1, bytes2, bytes3, ..., bytes32。（以步长1递增）
byte代表bytes1。

支持的运算符：
* 比较符: <=, <, ==, !=, >=, > (返回bool）
* 位操作符: &, |, ^ (按位异或)，~（按位取反）, << (左移位), >> (右移位)
* 索引（下标）访问: 如果x是bytesI，当0 <= k < I ，则x[k]返回第k个字节（只读）。

移位运算和整数类似，移位运算的结果的正负取决于操作符左边的数，且不能进行负移位。
如可以-5<<1, 不可以5<<-1

成员变量：
**.length**：表示这个字节数组的长度（只读）。

> 补充小技巧: 如何在Remix中把内容传递给函数的定长字节数组参数，答案是使用16进制形式（0x1122）传递。
> 如果参数是定长字节数组的数组 bytes32[]，则在Remix中参数内容传递形式为：["0x00","0x0a"]。

## 变长（动态分配大小）字节数组（Dynamically-sized byte array）
* bytes:动态分配大小字节数组, 参见[Arrays](http://solidity.readthedocs.io/en/latest/types.html#arrays),不是值类型!
* string:动态分配大小UTF8编码的字符类型,参看[Arrays](http://solidity.readthedocs.io/en/latest/types.html#arrays)。不是值类型!

根据经验：
bytes用来存储任意长度的字节数据，string用来存储任意长度的(UTF-8编码)的字符串数据。
如果长度可以确定，尽量使用定长的如byte1到byte32中的一个，因为这样更省空间。

## 有理数和整型常量(Rational and Integer Literals)
> 也有人把Literals翻译为字面量

整型常量是有一系列0-9的数字组成，10进制表示，比如：8进制是不存在的，前置0在Solidity中是无效的。

10进制小数常量（Decimal fraction literals）带了一个**.**， 在**.**的两边至少有一个数字，有效的表示如:**1.**, **.1** 和 **1.3**.

科学符号也支持，基数可以是小数，指数必须是整数， 有效的表示如: **2e10**, **-2e10**, **2e-10**, **2.5e1**。

数字常量表达式本身支持任意精度，也就是可以不会运算溢出，或除法截断。但当它被转换成对应的非常量类型，或者将他们与非常量进行运算，则不能保证精度了。
如：(2\***800 + 1) - 2\***800的结果为1（uint8整类) ，尽管中间结果已经超过计算机字长。另外：**.5 * 8**的结果是4，尽管有非整形参与了运算。

只要操作数是整形，整型支持的运算符都适用于整型常量表达式。
如果两个操作数是小数，则不允许进行位运算，指数也不能是小数。

注意：
Solidity对每一个有理数都有一个数值常量类型。整数常量和有理数常量从属于数字常量。所有的数字常表达式的结果都属于数字常量。所以1 + 2和2 + 1都属于同样的有理数的数字常量3


警告：
整数常量除法，在早期的版本中是被截断的，但现在可以被转为有理数了，如5/2的值为 2.5

注意：
数字常量表达式，一旦其中含有常量表达式，它就会被转为一个非常量类型。下面代码中表达式的结果将会被认为是一个有理数：
```
uint128 a = 1;
uint128 b = 2.5 + a + 0.5;
```
上述代码编译不能通过，因为b会被编译器认为是小数型。


## 字符串常量

字符串常量是指由单引号，或双引号引起来的字符串 ("foo" or 'bar')。字符串并不像C语言，包含结束符，"foo"这个字符串大小仅为三个字节。和整数常量一样，字符串的长度类型可以是变长的。字符串可以隐式的转换为byte1,...byte32 如果适合，也会转为bytes或string。

字符串常量支持转义字符，比如\n，\xNN，\uNNNN。其中\xNN表示16进制值，最终转换合适的字节。而\uNNNN表示Unicode编码值，最终会转换为UTF8的序列。

## 十六进制常量（Hexadecimal literals）
十六进制常量，以关键字hex打头，后面紧跟用单或双引号包裹的字符串，内容是十六进制字符串，如hex"001122ff"。
它的值会用二进制来表示。

十六进制常量和字符串常量类似，也可以转换为字节数组。

## 枚举（Enums）
在Solidity中，枚举可以用来自定义类型。它可以显示的转换与整数进行转换，但不能进行隐式转换。显示的转换会在运行时检查数值范围，如果不匹配，将会引起异常。枚举类型应至少有一名成员。下面是一个枚举的例子：
```
pragma solidity ^0.4.0;

contract test {
    enum ActionChoices { GoLeft, GoRight, GoStraight, SitStill }
    ActionChoices choice;
    ActionChoices constant defaultChoice = ActionChoices.GoStraight;

    function setGoStraight() {
        choice = ActionChoices.GoStraight;
    }

    // Since enum types are not part of the ABI, the signature of "getChoice"
    // will automatically be changed to "getChoice() returns (uint8)"
    // for all matters external to Solidity. The integer type used is just
    // large enough to hold all enum values, i.e. if you have more values,
    // `uint16` will be used and so on.
    function getChoice() returns (ActionChoices) {
        return choice;
    }

    function getDefaultChoice() returns (uint) {
        return uint(defaultChoice);
    }
}
```

## 代码实例
通过合约代码实例说明类型的使用，请订阅[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。


另外强烈安利一门视频课程给大家： [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。

## 参考文档
[Solidity官方文档-类型](https://solidity.readthedocs.io/en/develop/types.html)


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。

<!---
下面我们用一个真实的合约代码来理解下各个类型及操作符。
```js
pragma solidity ^0.4.18;

contract testType{
    
    function add(uint x, uint y) public returns (uint z){
        z = x + y;
    }

    function divide(uint x, uint y ) public returns (uint z) {
        z = x / y;
    }

    function leftshift(int x, uint y) public returns (int z){
        z = x << y;
    }
    
    function rightshift(int x, uint y) public returns (int z){
        z = x >> y;
    }
    
    function interLiteral() public returns (uint, uint) {
        return ((2**800 + 1) - 2**800,  0.5*8);
    }
    
    function hexLiteralBytes() public returns (bytes2, bytes1, bytes1) {
        bytes2 a = hex"aabb";
        return (a, a[0], a[1]);
    }
    
}
```
### 运行
1. 打开[browser-solidity](https://ethereum.github.io/browser-solidity)，把代码拷贝到编辑器。
2. 选择环境创建合约
3. 传参数调用
4. 点Details 查看结果
上一张截图大家就明白了。
![](https://img.learnblockchain.cn/2017/b2b5529012ae930f5ae3e9a700247cbe.jpg!wl)

建议根据自己对类型的理解，修改代码，使用不同的参数进行调用以增强对类型的理解。
如：运行hexLiteralBytes()查看输出结果，十六进制常量可转化为字节数组。
![](https://img.learnblockchain.cn/2017/e28c82c8442eca12422d32b9d6563dfa.jpg!wl)

-->

