---
title: book
date: 2018-02-17 10:38:49
tags:
---

Solidity
0. 初探Solidity智能合约
1. 区块链基础
2. 以太坊 及 智能合约
3. Solidity简介
4. 

调试

括号里包含英文原文

<!-- more -->

# Solidity 简介
Solidity 是一种用来用来编写智能合约的高级语言，它受C++,Python以及JavaScript的影响，并被设计运行与Ethereum虚拟机（EVM）之上。

Solidity是一门静态语言，支持继承，类库以及复杂的用户自定义类型等等，
后面我们将看到，使用Solidity很容易创建用于投票、众筹、封闭拍卖、多重签名钱包等等的合约。

目前尝试Solidity的最好方式是使用Remix（https://remix.ethereum.org/）

## 目前可用的Solidity 集成工具

### Remix
https://remix.ethereum.org/ 
基于浏览器的IDE，集成了Solidity编译器及运行环境。

### IntelliJ IDEA plugin
https://plugins.jetbrains.com/plugin/9475-intellij-solidity
在IntelliJ IDEA上使用的Solidity 插件，也适用于JetBrains的其他IDE

### Visual Studio Extension
https://marketplace.visualstudio.com/items?itemName=ConsenSys.Solidity
在Microsoft Visual Studio上使用的Solidity 插件，集成了Solidity编译器。

### Package for SublimeText — Solidity language syntax
https://packagecontrol.io/packages/Ethereum
SublimeText编辑器下支持语法高亮。


### Etheratom
Atom编辑器上使用的Solidity 插件，支持语法高亮，集成了Solidity编译器及运行环境，支持启动节点及虚拟节点

### Atom Solidity Linter
Plugin for the Atom editor that provides Solidity linting.
### Atom Solium Linter
Configurable Solidty linter for Atom using Solium as a base.
### Solium
Linter to identify and fix style and security issues in Solidity.
### Solhint
Solidity linter that provides security, style guide and best practice rules for smart contract validation.
### Visual Studio Code extension
Solidity plugin for Microsoft Visual Studio Code that includes syntax highlighting and the Solidity compiler.
### Emacs Solidity
Plugin for the Emacs editor providing syntax highlighting and compilation error reporting.
### Vim Solidity
Plugin for the Vim editor providing syntax highlighting.
### Vim Syntastic
Plugin for the Vim editor providing compile checking.


## Solidity Tools
### Dapp
Build tool, package manager, and deployment assistant for Solidity.
### Solidity REPL
Try Solidity instantly with a command-line Solidity console.
### solgraph
Visualize Solidity control flow and highlight potential security vulnerabilities.
### evmdis
EVM Disassembler that performs static analysis on the bytecode to provide a higher level of abstraction than raw EVM operations.
### Doxity
Documentation Generator for Solidity.

## 第三方的Solidity 解释器
•	solidity-parser
Solidity parser for JavaScript
•	Solidity Grammar for ANTLR 4
Solidity grammar for the ANTLR 4 parser generator


# 一个简单的智能合约
我们先看一个简单的智能合约的例子。 
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

接下来我们简单的分析一下这个智能合约
```
pragma solidity ^0.4.0;
```
这行代码用来告诉编译器如何编译这段代码，这里需要0.4.0及以上版本（第三位的版本号可以变，留出来用做bug可以修复，如0.4.1的编译器有bug，可在0.4.2修复，现有合约不用改代码），但是不能高于0.5.0（以避免兼容性问题）。


一个合约通常由一组代码（合约的函数）和数据（合约的状态）组成。
一个合约存储在以太坊区块链上，对应一个特殊地址。
```
uint storedData
```
这行代码声明了一个状态变量，变量名为storedData，类型为 uint （一个256位的无符号整数），可以理解为它像数据库里面的一个存储单元，我们可以通过调用函数查询和修改它，在这个例子中，函数 get 和 set 分别用于查询和修改变量storedData的值

> 访问状态变量，不需要像其他需要那样加前缀**this.**

这个合约还无法做很多事情（受限于以太坊的基础设施），仅仅是允许任何人储存一个数字及访问这个数字，缺少一个（可行的）方式来保护我们发布的数字。任何人都可以调用set方法设置一个不同的数字覆盖我们发布的数字。但是我们发布的数字将会留存在区块链的历史上。稍后我们会学习如何增加一个存取限制，使得只有我们才能修改这个数字。

> 所有的标识符（合约名称，函数名称以及变量名称）都只能使用ASCII 字符集你的字符，但是字符串变量里可以存储 UTF-8 编码的数据。


#  区块链基础慨念

对于程序员来说，区块链这个概念其实不难理解。因为最难懂的一些东西（挖矿，哈希，椭圆曲线加密，点对点网络等等）只是为了提供一系列的特性和保障。我们只需要接受这些特性，而不需要关心其底层的技术。就像我们并不需要了解亚马逊AWS内部工作原理也一样可以使用它。

## 交易

区块链是一个全局共享的交易数据库。这意味着参与这个网络的每一个人都可以读取其中的记录。如果想修改这个数据库中的内容，就必须创建一个得到其他所有人确认的“交易”，交易意味着要做的修改（假如我们想同时修改两个值）只能被完全的应用或者一点都没有进行。

此外，当你的事务被应用到这个数据库的时候，其他事务不能修改该数据库。

举个例子，想象一张表，里面列出了某个电子货币所有账号的余额。当从一个账户到另外一个账户的转账请求发生时，这个数据库的事务特性确保从一个账户中减掉的金额会被加到另一个账户上。如果因为某种原因，往目标账户上增加金额无法进行，那么源账户的金额也不会发生任何变化。

此外，一个事务会被发送者（创建者）进行密码学签名。这项措施非常直观的为数据库的特定修改增加了访问保护。在电子货币的例子中，一个简单的检查就可以确保只有持有账户密钥的人，才能从该账户向外转账。

## 区块


# 以太坊

以太坊是一个开放的区块链应用平台，它允许任何人在平台中建立和使用通过区块链技术运行的去中心化应用。

相对于比特币，以太坊的最大特点是支持智能合约的运行，允许用户自己来创建应用。


## 以太坊虚拟机
以太坊虚拟机（EVM： The Ethereum Virtual Machine）是以太坊中智能合约的运行环境。知道JVM的同学很好理解，EVM就是一个程序运行的容器。

它是一个被沙箱封装起来、完全隔离的运行环境。运行在EVM内部的代码不能接触到网络、文件系统或其它进程，即使是智能合约与其它智能合约也只能有有限的交互。

## 账户
以太坊中有两类账户，它们有同样的地址空间。
### 外部账户（EOA）
  该类账户被公钥-私钥对控制（由人类控制），没有关联任何代码。
### 合约账户
   该类账户被存储在账户中的代码控制。

外部账户的地址是由公钥决定的，
合约账户的地址是在创建该合约时确定的（这个地址由合约创建者的地址和该地址发出过的交易数量nonce计算得到）

> 以太坊中有两种nonce ， 一种是账号nonce - 表示一个账号的交易数量。一种是工作量证明nonce 一个用于计算满足工作量证明证明的随机数。


合约账户存储了代码，外部账户则没有，除了这点以外，这两类账户对于EVM来说是一样的。
但是理解外部拥有账户和合约账户的基本区别依然是很重要的。一个外部拥有账户可以通过创建和用自己的私钥来对交易进行签名，来发送消息给另一个外部拥有账户或合约账户。在两个外部拥有账户之间传送的消息只是一个简单的价值转移。但是从外部拥有账户到合约账户的消息会激活合约账户的代码，允许它执行各种动作。（比如转移代币，写入内部存储，挖出一个新代币，执行一些运算，创建一个新的合约等等）。
不像外部拥有账户，合约账户不可以自己发起一个交易。相反，合约账户只有在接收到一个交易之后(从一个外部拥有账户或另一个合约账户处)，为了响应此交易而触发一个交易。
因此，在以太坊上任何的动作，总是被外部拥有账户触发的交易所发动的。

## 账户状态

账户状态有四个组成部分，不论账户类型是什么，都存在这四个组成部分：

nonce：如果账户是一个外部拥有账户，nonce代表从此账户地址发送的交易序号。如果账户是一个合约账户，nonce代表此账户创建的合约序号
balance： 此地址拥有以太币余额数量。单位是Wei，1Ether=10^18Wei，当向它发送带有以太币的交易时，其被改变。
storageRoot： Merkle Patricia树的根节点Hash值。Merkle树会将此账户存储内容的Hash值进行编码，默认是空值。
codeHash：此账户EVM代码的hash值。对于合约账户，就是被Hash的代码并作为codeHash保存。对于外部拥有账户，codeHash域是一个空字符串的Hash值

## 以太坊全局共享状态
以太坊的全局共享状态是由所有账户状态组成，它由账户地址和账户状态组成的映射存储在区块的状态树中，如图。
![](https://i.stack.imgur.com/QpcFh.png)

https://ethereum.stackexchange.com/questions/15288/ethereum-merkle-tree-explanation
https://ethereum.stackexchange.com/questions/359/where-is-the-state-data-stored

> 以太坊最新的区块总是保存了全局共享状态，但每个区块仅仅修改部分状态。

## 交易
一笔交易是从一个账户发送到另一个账户（可以是相同的账户或者零账户）的消息。交易可以包含二进制数据（负载payload）和以太币（Ether）。

如果目标账户包含代码，该代码会执行，payload就是输入数据。

如果目标账户是零账户（账户地址是0），交易将创建一个**新合约**。这个合约地址将由创建者的地址和该地址发出过的交易数量（nonce）计算得到。这个交易（创建合约交易）的payload被当作EVM字节码执行。执行的输出做为合约代码被永久存储。这意味着，为了创建一个合约，你不需要向合约发送真正的合约代码，而是发送能够返回真正代码的代码。

## 费用Gas
天下没有免费的午餐，以太坊上的每笔交易都会被收取一定费用，这个费用称为Gas，gas的目的是限制执行交易所需的工作量，同时为执行支付费用。当EVM执行交易时，gas将按照特定规则被逐渐消耗。

思考一下费用的作用？
施加费用可以防止用户超负荷使用网络，以太坊是一个[图灵完备](https://en.wikipedia.org/wiki/Turing_machine)的系统，它允许有循环，并使以太坊受到**[停机问题](https://en.wikipedia.org/wiki/Halting_problem)**的影响，这个问题让你无法确定程序是否无限制的运行。如果没有费用的话，恶意的执行者通过执行一个包含无限循环的交易就可以很容易的让网络瘫痪而不会产生任何反响。因此，费用保护网络不受蓄意攻击。


**gas price**（以太币计）是由交易创建者设置的，发送者账户需要预付的交易费用为gas price * gas。 如果交易完成还有gas剩余，这些gas将被返还给发送者账户。

无论执行到什么位置，一旦gas被耗尽（比如降为负值），将会触发一个out-of-gas异常。当前调用帧所做的所有状态修改都将被还原。
> 交易可以认为是一个原子操作，要么所有操作全部成功，要么操作失败则所有的执行都将会被还原，不能出现中间状态。

另外，Gas不仅仅是用来支付计算的费用，也用来支付存储的费用。


## 存储Storage, 内存Memory 和栈Stack 

每个账户有一块持久化存储区域被称为**storage**。其以key-value的形式存储，key和value的长度均为256位。
在合约里，不能遍历账户的存储。storage的读操作开销较大，修改操作开销更大。一个合约只能对它自己的storage进行读写。

第二个存储区被称为**内存memory**。合约执行每次消息调用时，都有一块新的，被清除过的内存memory。内存是线性的，可以以字节为粒度寻址。其读粒度为32个字节（256位），写可以是1字节或32字节。内存的增长是以32字节（word）为单位，内存的开销随着其增长而变大（平方级别）。

EVM不是基于寄存器，而是基于栈的虚拟机。因此所有的计算都在一个被称为**栈stack**的区域执行。栈最大有1024个元素，每个元素256位。每次只能访问栈顶的元素。栈上的元素也可以放到存储或者内存中。

## 指令集
EVM的指令集被刻意保持在最小规模，以尽可能避免错误的实现而可能导致共识问题。所有的指令都是针对32个字节（256位）这个基本的数据类型的操作。
指令集包含常用的算术运算，位运算，逻辑运算，比较运算，以及条件和无条件跳转等。此外，合约可以访问当前区块的相关属性，比如它的编号和时间戳。

## 消息调用
合约可以通过消息调用的方式来调用其它合约或者发送以太币到非合约账户。消息调用和交易非常类似，它们都有一个源，一个目标，数据负载，以太币，gas和返回数据。事实上每个交易都可以被认为是一个顶层消息调用，这个消息调用会依次产生更多的消息调用。

一个合约可以决定剩余gas的分配。比如内部消息调用时使用多少gas，或者期望保留多少gas。如果在内部消息调用时发生了out-of-gas异常（或者其他异常），合约将会得到通知，一个错误码被压在栈上。这种情况只是内部消息调用的gas耗尽。在solidity中，这种情况下发起调用的合约默认会触发一个人工异常，以把这个异常“冒泡”到调用栈。

就像之前说过的，被调用的合约（发起调用的合约也一样）会拥有崭新的内存以及能够访问调用的payload的被称为calldata的区域。调用执行结束后，返回数据将被存放在调用者预先分配好的一块内存中。

调用层数被限制为1024，因此对于更加复杂的操作，我们应该使用循环而不是递归。

## 调用和库
存在一种特殊类型的消息调用，被称为**delegatecall**，它跟消息调用几乎完全一样，不同的是它加载目标地址的代码到发起调用的合约上下文中来执行。

这意味着一个合约可以在运行时从另外一个地址动态加载代码。存储，当前地址和余额都指向发起调用的合约，只有代码是从被调用地址获取的。

这使得Solidity可以实现”库“。可复用的库代码可以应用在一个合约的存储上，可以用来实现复杂的数据结构。

## 日志
以太坊允许日志可以跟踪各种交易和信息，日志是用一种特殊的可索引的数据结构来存储的。一个合约可以通过定义“事件”来显示的生成日志（Solidity用日志来实现事件）。合约创建之后就无法访问日志数据，但是这些日志数据可以从区块链外高效的访问。
日志数据被存储在布隆过滤器（[Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)) 中，因此可以高效并安全的搜索日志。

## 创建
合约甚至可以通过一个特殊的指令来创建其他合约（不是简单的向零地址发起调用）。创建合约的调用跟普通的消息调用的区别在于，payload数据执行的结果被当作代码，调用者/创建者在栈上得到新合约的地址。

## 自毁
只有在某个地址上的合约执行自毁**selfdestruct**操作时，合约代码才会从区块链上移除。合约地址上剩余的以太币会发送给指定的目标，然后其存储和代码被移除。

> 注意，即使一个合约的代码不包含自毁指令，依然可以通过**delegatecall** 或**callcode**来执行这个操作。


# 安装 Solidity 编译器

## Remix
在学习Solidity的时候，推荐大家使用Remix，这是一个基于浏览器的在线Solidity IDE，地址为：https://remix.ethereum.org/
如果想离线使用，可以从https://github.com/ethereum/browser-solidity/tree/gh-pages克隆一个。

如果我们需要编写比较大的合约或是需要更多的编译选项，使用命令行编译器是比较好的选择。

## solcjs

solcjs 是一个Solidity编译器，可以使用npm来安装
```
npm install -g solc
```


# Solidity 文件结构

## 版本申明
Solidity的源文件需要进行一个版本声明，告知编译器此源文件所支持的编译器版本，当出现不兼容的新的编译器版本时，它会拒绝编译老的源文件。
常常阅读版本更新日志是一个好习惯，尤其当大版本发布时。
版本申明方式如下：
```
pragma solidity ^0.4.0；
```

这样一个源文件不兼容0.4.0之前的版本，以及不兼容0.5.0之后的版本（^符号用来控制版本号的第2部分）。
通常版本号第3部分的升级仅仅一些小变化（不会有任何兼容性问题），所有通常使用这种方式，而不是指定特定的版本，这样当编译器有bug修复时，不需要更改代码。

如果要使用更复杂的版本声明，其声明表达式和npm保持了一致，可以参考：https://docs.npmjs.com/misc/semver


## 引入其他源文件

Solidity 支持import语句，非常类似于JavaScript（ES6）,虽然Solidity没有“缺省导出”的概念。
1. 全局引入
引入形式如下：
```js
import "filename";
```
将会从"filename"导入所有的全局符号（包括filename从其他文件导入的），导入到当前的全局作用域。

2. 自定义命名空间引入
引入形式如下：
```js
import * as symbolName from "filename";
```
创建了一个全局的命名空间 symbolName，成员来自filename的全局符号。
有一种非es6兼容的简写语法与其等价：
```js
import "filename" as symbolName;
```

3. 分别定义引入
引入形式如下：
```js
import {symbol1 as alias, symbol2} from "filename";
```
将创建一个新的全局变量别名：alias 和 symbol2， 它们将分别从filename引入symbol1 和 symbol2。


### 路径
引入文件路径时要注意，文件名总是用/作为目录分割符，.表示当前的目录，.. 表示父目录，非.打头的路径会被认为是绝对路径。
要引用同目录下的文件使用
```js
import "./x" as x
```
而不是
```
import "x" as x;
```
它会引入一个全局的include目录下的x文件。

路径的解析依赖于编译器，通常来说目录层级结构并不一定与我们本地的文件一一对应，它也有可能是通过ipfs,http，或git建立的一个网络上的虚拟目录。

### 编译器解析引用文件机制
各编译器提供了文件前缀映射机制。
1. 可以将一个域名下的文件映射到本地，从而从本地的某个文件中读取
2. 如果多个映射到相同前缀，取最长路径（key）
3. 有一个”fallback-remapping”机制，空串会映射到“/usr/local/include/solidify”
4. 映射可根据上下文不同提供对同一实现的不同版本的支持

### solc
solc 是一个命令行编译器，通过命令行参数** context:prefix=target**来提供命名空间映射支持。
其中context:和target是可选的（target默认为prefix），所有context目录下的以prefix开头的会被替换为target。

例如，我们克隆了**github.com/ethereum/dapp-bin/**到本地**/usr/local/dapp-bin**目录，并使用了下述方式使用文件
```
import "github.com/ethereum/dapp-bin/library/iterable_mapping.sol" as it_mapping;
```

就可以以下命令编译这个源文件：
```
solc github.com/ethereum/dapp-bin/=/usr/local/dapp-bin/ source.sol
```

一个更复杂的例子，如果我们使用一个更旧版本的dapp-bin，旧版本在/url/local/dapp-bin_old，那么，可以使用下述命令编译：
```
solc module1:github.com/ethereum/dapp-bin/=/usr/local/dapp-bin/ \
     module2:github.com/ethereum/dapp-bin/=/usr/local/dapp-bin_old/ \
     source.sol
```
注意solc仅仅允许从特定的目录下引入文件，他们必须是一个显式定义的，包含目录或子目录的源文件， 或者是重映射目标的目录（子目录）。如果你想引入直接的绝对路径，那么可以将命名空间重映射为**=\**

如果有多个重映射指向了同一个文件，那么取最长的那个文件。

### Remix
Remix编译器默认会自动映射到github上，同样会自动从网络上检索文件，可以使用以下方式import：
```
import "github.com/ethereum/dapp-bin/library/iterable_mapping.sol" as it_mapping;
```

## 代码注释
有两种注释方式，单行注释使用//，多行注释使用/*…*/

示例:

```
// this is a single-line comment
/*
this is a
mulit-line comment
*/
```
此外还有一种称为**文档注释**（natspec comment），使用/// 或/** ... */, 通常用于函数或语句上方，在注释中可以使用Doxygen风格的标签（tags）来说明函数作用、参数验证的注解，同时支持文档的生成。

示例：
```
pragma solidity ^0.4.0;

/** @title Shape calculator. */
contract shapeCalculator {
    /** @dev Calculates a rectangle's surface and perimeter.
      * @param w Width of the rectangle.
      * @param h Height of the rectangle.
      * @return s The calculated surface.
      * @return p The calculated perimeter.
      */
    function rectangle(uint w, uint h) returns (uint s, uint p) {
        s = w * h;
        p = 2 * (w + h);
    }
}
```

# 合约结构

Solidity的合约和面向对象语言中的类的定义很相似，每个合约可以包含 状态变量，函数，函数修饰符，事件，结构类型 和枚举类型。另外，合约也支持继承。

## 状态变量（State Variables）
状态变量会永久存储在合约的存储空间里。
```
pragma solidity ^0.4.0;

contract SimpleStorage {
    uint storedData;   // 这是一个状态变量
    // ...
}
```

## 函数（Functions）
函数是合约中可执行代码单元 
```
pragma solidity ^0.4.0;

contract SimpleAuction {
    function bid() public payable { //  这是一个函数
        // ...
    }
}
```
关于函数的可见性及访问控制参考第X章。


## 函数修饰器（Function Modifiers）
函数修饰器可以以声明的方式中补充函数的语义， 函数修饰器参考第X章。
```
pragma solidity ^0.4.11;

contract Purchase {
    address public seller;

    modifier onlySeller() { //  声明了一个修饰器
        require(msg.sender == seller);
        _;
    }

    function abort() public onlySeller { // 修饰器的使用
        // ...
    }
}
```

## 事件 （Events）
事件是以太坊虚拟机(EVM)日志基础设施提供的一个便利接口。用于获取当前发生的事件。
```
pragma solidity ^0.4.0;

contract SimpleAuction {
    event HighestBidIncreased(address bidder, uint amount); // 定义事件

    function bid() public payable {
        // ...
        HighestBidIncreased(msg.sender, msg.value); // 触发事件
    }
}
```
事件将在第X章详细讲解
https://jakubstefanski.com/post/2017/10/ethereum-event-logs/

## 结构类型(Struct Types)
结构类型是一组用户定义的变量组合在一起形成的类型，结构类型将在第X章详细讲解
```
pragma solidity ^0.4.0;

contract Ballot {
    struct Voter {      // 结构类型
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
}
```

## 枚举类型(Enum Types)
枚举类型是用户创建的包含几个特定值的集合的自定义类型

```
pragma solidity ^0.4.0;

contract Purchase {
    enum State { Created, Locked, Inactive } // Enum
}
```

# 类型



# 单位


# 特殊的变量及函数
Solidity API 主要表现为Solidity 内置的特殊的变量及函数，他们存在于全局命名空间里，主要分为以下几类：
1. 有关区块和交易的属性
2. 有关错误处理
3. 有关数学及加密功能
4. 地址相关
5. 合约相关



有一些特殊的变量和函数存在于全局命名空间里，用来提供一些区块链当前的信息。
## 区块和交易的属性（Block And Transaction Properties）
* block.blockhash(uint blockNumber) returns (bytes32)：返回给定区块号的哈希值，只支持最近256个区块，且不包含当前区块。
* block.coinbase (address): 当前块矿工的地址。
* block.difficulty (uint):当前块的难度。
* block.gaslimit (uint):当前块的gaslimit。
* block.number (uint):当前区块的块号。
* block.timestamp (uint): 当前块的Unix时间戳（从1970/1/1 00:00:00 UTC开始所经过的秒数）
* msg.data (bytes): 完整的调用数据（calldata）。
* msg.gas (uint): 当前还剩的gas。
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

## 错误处理
* assert(bool condition)

用于判断内部错误，条件不满足时抛出异常
* require(bool condition):
用于判断输入或外部组件错误，条件不满足时抛出异常

* revert():
终止执行并还原改变的状态

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
通过椭圆曲线签名来恢复与公钥关联的地址，或者在错误时返回零。
用于签名数据的校验，如果返回结果是签名者的公匙地址，那么说明数据是正确的。
。
> ecrecover函数需要四个参数，需要被签名数据的哈希结果值，r，s，v分别来自签名结果串。
> r = signature[0:64]
> s = signature[64:128]
> v = signature[128:130]
> 其中v取出来的值或者是00或01。要使用时，我们先要将其转为整型，再加上27，所以我们将得到27或28。在调用函数时v将填入27或28。
用javascript表达如下,这里是一个[例子](https://ethereum.stackexchange.com/questions/1777/workflow-on-signing-a-string-with-private-key-followed-by-signature-verificatio)： 
```js
    var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'

    var hash = web3.sha3(msg)
    var sig = web3.eth.sign(address, h).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
```




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

在私链(private blockchain)上运行sha256,ripemd160或ecrecover可能会出现Out-Of-Gas报错。因为它们实现了一种预编译合约，合约要在收到第一个消息后才会真正存在（虽然他们的合约代码是硬编码的）。向一个不存在的合约发送消息，非常昂贵，所以才会导致Out-Of-Gas的问题。一种解决办法（workaround）是每个在你真正使用它们之前先发送1 wei到这些合约上来完成初始化。在官方和测试链上没有这个问题。


## 地址相关

* <address>.balance (uint256):
Address的余额，以wei为单位。

* <address>.transfer(uint256 amount):
发送给定数量的ether到某个地址，以wei为单位。失败时抛出异常。

<address>.send(uint256 amount) returns (bool):
发送给定数量的ether到某个地址，以wei为单位, 失败时返回false。

<address>.call(...) returns (bool):
发起底层的call调用。失败时返回false。

<address>.callcode(...) returns (bool):
发起底层的callcode调用，失败时返回false。
不鼓励使用，未来可能会移除。

<address>.delegatecall(...) returns (bool):
发起底层的delegatecall调用，失败时返回false

更多信息参考地址章节。

**警告**：send() 执行有一些风险：如果调用栈的深度超过1024或gas耗光，交易都会失败。因此，为了保证安全，必须检查send的返回值，如果交易失败，会回退以太币。如果用transfer会更好。

## 合约相关

* this（当前合约的类型）:
表示当前合约，可以显式的转换为Address
* selfdestruct(address recipient):
销毁当前合约，并把它所有资金发送到给定的地址。
* suicide(address recipient):
selfdestruct的别名

另外，当前合约里的所有函数均可支持调用，包括当前函数本身。


# 表达式和控制结构

## 输入参数和输出参数
与Javascript一样，函数可以提供参数作为输入; 与Javascript和C不同的是，solidity还可以返回任意数量的参数作为输出。
### 输入参数

输入参数的声明方式与变量相同， 未使用的参数可以省略变量名称。假设我们希望合约接受一种带有两个整数参数的外部调用，可以这样写：

```js
pragma solidity ^0.4.16;

contract Simple {
    function taker(uint _a, uint _b) public pure {
        // 使用 _a  _b.
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

可以省略输出参数的名称，也可以使用return语句指定输出值，return可以返回多个值（见下节）。
返回一个没有赋值的参数，则默认为0。

输入参数和输出参数可以在函数内表达式中使用，也可以作为被赋值的对象（写在=的左边）。

## 控制结构

除了switch和goto以外，JavaScript中的大多数控制语句Solidity都支持，例如：
if, else, while, do, for, break, continue, return, ? : 语义均和C / JavaScript中一样。

条件语句中的括号不能省略，但在单条语句前后的花括号{}可以省略。

注意,在Solidity中没有象C和JavaScrip那样 ，从非布尔类型到布尔类型的转换, 所以if(1){…}在Solidity中是不合法的。

### 返回多个值
当一个函数有多个输出参数时, 可以使用return (v0, v1, ..., vn) 语句，返回值的数量需要和输出参数声明的数量一致。

## 函数调用
### 内部函数调用（Internal Function Calls）
当前合约的功能可以直接调用（“internally”），也可以递归调用，如下面这个无意义的例子：
```
pragma solidity ^0.4.16;

contract C {
    function g(uint a) public pure returns (uint ret) { return f(); }
    function f() internal pure returns (uint ret) { return g(7) + f(); }
}
```
这些函数调用被转换为EVM内部的简单指令跳转（jumps）。 这样带来的一个好处是，当前的内存不会被回收。在一个内部调用时传递一个内存型引用效率将非常高的。当然，仅仅是同一个合约的函数之间才可通过内部的方式进行调用。

### 外部函数调用(External Function Calls)
表达式this.g(8);和c.g(2)（这里的c是一个合约实例）是外部调用函数的方式，它是一个消息调用，而不是EVM的指令跳转。需要注意的是，在合约的构造器中，不能使用this调用函数，因为当前合约还没有创建完成。

其它合约的函数必须通过外部的方式调用。对于一个外部调用，所有函数的参数必须要拷贝到内存中。

当调用其它合约的函数时，可以通过选项.value()，和.gas()来分别指定要发送的以太币（以wei为单位）和gas值，如：

```js
pragma solidity ^0.4.0;

contract InfoFeed {
    function info() public payable returns (uint ret) { return 42; }
}

contract Consumer {
    InfoFeed feed;
    function setFeed(address addr) public { feed = InfoFeed(addr); }
    function callFeed() public { feed.info.value(10).gas(800)(); }
}
```

info()函数，必须使用payable关键字，否则不能通过value()来接收以太币。

表达式InfoFeed(addr)进行了一个显示的类型转换，表示给定的地址是合约InfoFeed类型，这里并不会执行构造器的初始化。
在进行显示的类型强制转换是需要非常小心，不要调用一个我们不知道类型的合约函数。

我们也可以使用**function setFeed(InfoFeed _feed) { feed = _feed; }**来直接进行赋值。
注意**feed.info.value(10).gas(800)**仅仅是对发送的以太币和gas值进行了设置，真正的调用是后面的括号()。
调用callFeed时，需要预先存入一定量的以太币，要不能会因余额不足报错。

> 如果我们不知道被调用的合约源代码，和它们交互会有潜在的风险，即便被调用的合约继承自一个已知的父合约（继承仅仅要求正确实现接口，而不关注实现的内容）。
因为和他们交互，相当于把自己控制权交给被调用的合约，对方几乎可以利用它做任何事。
> 此外, 被调用的合约可以改变调用合约的状态变量(state variable)，在编写函数时需要注意可重入性漏洞问题。

### 使用命名参数调用
函数调用的参数，可以通过指定名称的方式调用，使用花括号{} 包起来，参数顺序任意，但参数的类型和数量要与定义一致。
如：
```
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
```
pragma solidity ^0.4.16;

contract C {
    // omitted name for parameter
    function func(uint k, uint) public pure returns(uint) {
        return k;
    }
}
```


## 使用new创建合约
合约内可以通过new关键字来创建一个新合约，被创建的合约的代码必须是已知明确的，所以不能递归创建合约。

```
pragma solidity ^0.4.0;

contract D {
    uint x;
    function D(uint a) public payable {
        x = a;
    }
}

contract C {
    D d = new D(4);         // 将作为C构造的一部分被执行

    function createD(uint arg) public {
        D newD = new D(arg);
    }

    function createAndEndowD(uint arg, uint amount) public payable {
        // 在创建合约时发送以太币
        D newD = (new D).value(amount)(arg);
    }
}
```

可以在创建合约中，发送ether，但不能限制gas。如果创建因为out-of-stack、无足够的余额或其它任何问题，会抛出一个异常。

## 表达式的执行顺序（Order of Evaluation of Expressions）

表达式的求值顺序并不是确定的（正式的表达是，表达式树一个节点的某个节点在求值时的顺序是不确定的，但是它肯定会比节点本身先执行)。仅仅语句(statements)按顺序执行和布尔表达式的短路运算是可以保证。查看运算符的执行顺序章节了解更多。

## 赋值(Assignment)

### 解构及返回多个值(Destructing Assignments and Returning Multip Values)

Solidity内置支持元组(tuple)，它是一个数量固定，类型可以不同的元素组成的一个列表。使用元组可以用来返回多个值，也可用于同时赋值给多个变量(即为解构)。

> 解构的概念在函数式语言中较为常见

我们看看一下的例子：

```js
pragma solidity ^0.4.16;

contract C {
    uint[] data;

    function f() public pure returns (uint, bool, uint) {
        return (7, true, 2);
    }

    function g() public {
        // 声明可赋值
        var (x, b, y) = f();
        // 赋值已声明过的变量
        (x, y) = (2, 7);
        // 交换变量值，只适用于值类型变量
        (x, y) = (y, x);

        // 支持省略一些元素， 如果元组是以空元素为结尾，其余部分可以省略
        (data.length,) = f();       // 设置长度为7
        // 开头也可以省略
        (,data[3]) = f(); // 设置 data[3]为2
        (x,) = (1,);   // 设置x为1

        // 注意 (1,) 是一个一个元素的元组， (1) 只是1。
    }
}
```

## 数组和自定义结构体的复杂性(Complication for Arrays and Struts)

对于非值类型，比如数组和结构体，赋值的语法有一些复杂。
赋值给一个状态变量总是创建一个完全独立的拷贝。
赋值给一个局部变量，对于基本类型（如那2字节以内的静态类型）会创建一份完全独立拷贝，对于数据结构或者数组(包括bytes和string)类型，局部变量则只是持有原始状态变量的一个引用。
对这个局部变量再次赋值，并不会修改这个状态变量，只是修改了引用。但修改这个本地引用变量的成员值，会改变状态变量的值。

## 作用范围和声明(Scoping And Decarations)

A variable declared anywhere within a function will be in scope for the entire function, regardless of where it is declared. This happens because Solidity inherits its scoping rules from JavaScript. This is in contrast to many languages where variables are only scoped where they are declared until the end of the semantic block. As a result, the following code is illegal and cause the compiler to throw an error, Identifier already declared:

变量在声明后会用字节表示全0值作为默认值。也就是所有类型的默认值是典型的零态(zero-state)。举例来说，默认的bool的值为false,uint和int的默认值为0。

对从byte1到byte32定长的字节数组，每个元素都被初始化为对应类型的初始值（一个字节的是一个字节长的全0值，多个字节长的是多个字节长的全零值）。对于变长的数组bytes和string，默认值则为空数组和空字符串。

函数内定义的变量， 其作用域是整个函数，不管它定义的位置。因为Solidity使用了javascript的变量作用域的规则。与常规语言语法从定义处开始，到当前块结束为止不同。因此，下述代码编译时会抛出一个异常**Identifier already declared**。

```js
// This will not compile

pragma solidity ^0.4.16;

contract ScopingErrors {
    function scoping() public {
        uint i = 0;

        while (i++ < 1) {
            uint same1 = 0;
        }

        while (i++ < 2) {
            uint same1 = 0;  // 出错
        }
    }

    function minimalScoping() public {
        {
            uint same2 = 0;
        }

        {
            uint same2 = 0;  //出错
        }
    }

    function forLoopScoping() public {
        for (uint same3 = 0; same3 < 1; same3++) {
        }

        for (uint same3 = 0; same3 < 1; same3++) {// 出错
        }
    }
}
```

此外，如果一个变量被声明了，它会在函数开始前被初始化为默认值。所以下述例子是合法的。


```js
pragma solidity ^0.4.0;

contract C {
    function foo() public pure returns (uint) {
        // baz 默认初始化为 0
        uint bar = 5;
        if (true) {
            bar += baz;
        } else {
            uint baz = 10;    // 不会执行
        }
        return bar;  // returns 5
    }
}
```

## 错误处理
Solidity是通过回退状态的方式来处理错误。发生异常时会撤消当前调用（及其所有子调用）所改变的状态，同时给调用者返回一个错误标识。
可以使用函数assert和require来进行条件检查，如果条件不满足则抛出异常。 assert函数通常用来检查（测试）内部错误，而require函数来检查输入变量或合同状态变量是否满足条件以及验证调用外部合约返回值。

如果我们正确使用assert，分析工具就可以帮我们分析出智能合约中的错误。
这时说明合约中有逻辑错误的bug。

还有两种其他的方式来触发异常：
1. **revert**函数可以用来标记错误并回退当前调用
2. 使用**throw**关键字抛出异常（从0.4.13版本，throw关键字已被弃用，将来会被淘汰。）

当子调用中发生异常时，异常会自动向上“冒泡”。 不过也有一些例外：send，和底层的函数调用call,delegatecall，callcode，当发生异常时，这些函数返回false。

注意：在一个不存在的地址上调用底层的函数call,delegatecall，callcode 也会返回成功，应该总是优先进行存在性检查。

**捕捉异常是不可能的**

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
在下述场景中自动产生assert类型的异常:
1. 如果越界，或负的序号值访问数组，如i >= x.length 或 i < 0时访问x[i]
2. 如果序号越界，或负的序号值时访问一个定长的bytesN。
3. 被除数为0， 如5/0 或 23 % 0。
4. 对一个二进制移动一个负的值。如:5<<i; i为-1时。
5. 整数进行可以显式转换为枚举时，如果将过大值，负值转为枚举类型则抛出异常
6. 如果调用内部函数类型的零初始化变量(If you call a zero-initialized variable of internal function type)。
7. 如果调用**assert**的参数为false

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

注意assert类型的异常会消耗掉所有的gas, 而require从大都会版本起不会消耗gas.

# 合约
Solidity中合约和面向对象语言中的类差不多。合约包含状态变量（数据保存在链上）及函数。
调用另一个合约实例的函数时，会执行一个EVM函数调用，这个操作会切换执行时的上下文，这时上一个合约的状态变量就无法访问。

## 创建合约
合约可以通过发起交易来创建（通过web3）或是通过solidity创建。

在以太坊上动态的创建合约可以使用JavaScript API web3.js，使用web3.eth.Contract来创建合约。
当合约创建时，合约的构造函数（函数名与合约同名）会被调用，用于初始化。构造器函数是可选的，但仅能有一个构造函数，因此构造函数不支持重载。

如果一个合约想创建另一个合约，必须要提前知道源码，因此不支持嵌套创建。

下面是使用Web3.js API来创建合约的代码:
```js
var source = "contract A { function A(uint a) {} }";
// 下面的代码可以使用编译器:如remix 生成

var a = 10;
var aContract = web3.eth.contract([{"inputs":[{"name":"a","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var a = aContract.new(
   a,
   {
     from: web3.eth.accounts[0], 
     data: '0x60606040523415600e57600080fd5b604051602080606c833981016040528080519060200190919050505060358060376000396000f3006060604052600080fd00a165627a7a723058207bb3515740fd13f73ddf67e9a7be34568648fff52fc7e50a3fd7af0df72d34730029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })

```
使用solidity创建合约代码如下：
```js
pragma solidity ^0.4.16;

contract OwnedToken {
    // TokenCreator 是一个合约类型，在下面定义
    // 应用它是安全的，只要没有拥它去创建合约
    TokenCreator creator;
    address owner;
    bytes32 name;

    // This is the constructor which registers the
    // creator and the assigned name.
    function OwnedToken(bytes32 _name) public {
        // State variables are accessed via their name
        // and not via e.g. this.owner. This also applies
        // to functions and especially in the constructors,
        // you can only call them like that ("internally"),
        // because the contract itself does not exist yet.
        owner = msg.sender;
        // We do an explicit type conversion from `address`
        // to `TokenCreator` and assume that the type of
        // the calling contract is TokenCreator, there is
        // no real way to check that.
        creator = TokenCreator(msg.sender);
        name = _name;
    }

    function changeName(bytes32 newName) public {
        // 只有创建这能改名
        if (msg.sender == address(creator))
            name = newName;
    }

    function transfer(address newOwner) public {
        // Only the current owner can transfer the token.
        if (msg.sender != owner) return;
        // We also want to ask the creator if the transfer
        // is fine. Note that this calls a function of the
        // contract defined below. If the call fails (e.g.
        // due to out-of-gas), the execution here stops
        // immediately.
        if (creator.isTokenTransferOK(owner, newOwner))
            owner = newOwner;
    }
}

// 用来创建合约
contract TokenCreator {
    function createToken(bytes32 name)
       public
       returns (OwnedToken tokenAddress)
    {
        // 创建token合约，返回合约地址
        // From the JavaScript side, the return type is simply
        // `address`, as this is the closest type available in
        // the ABI.
        return new OwnedToken(name);
    }

    function changeName(OwnedToken tokenAddress, bytes32 name)  public {
        tokenAddress.changeName(name);
    }

    function isTokenTransferOK(address currentOwner, address newOwner) public
        view
        returns (bool ok)
    {
        // Check some arbitrary condition.
        address tokenAddress = msg.sender;
        return (keccak256(newOwner) & 0xff) == (bytes20(tokenAddress) & 0xff);
    }
}
```



http://blog.csdn.net/diandianxiyu_geek/article/details/77964409

http://www.tryblockchain.org/Solidity-Exceptions-%E5%BC%82%E5%B8%B8.html




















https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df50636* 9