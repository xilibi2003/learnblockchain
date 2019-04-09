---
title: 以太坊 - 深入浅出虚拟机
permalink: easy-evm
un_reward: true
date: 2019-04-09 20:53:52
categories: 以太坊
tags: 虚拟机
author: Star Li
---

创业有三种状态：投机，寻租以及自恋。屌丝程序员发现区块链是快速改变自己阶级命运的神器，一股脑冲进去，这是投机。早期的创业者，初初接触商业，寻求各种社会资源，各种“优惠”，努力实现“旱涝保收”的状态，这是寻租。稳定盈利的创业者会自恋，认为自己无所不能。创业过程会在这三种状态之间徘徊。在每个状态都要理智控制自己的情绪和理智。创业，最美妙的心理历程是以自己可控方式进入自恋的状态，做自己想做的事情，反推现状，寻找破局。

<!-- more -->

## 以太坊虚拟机

以太坊虚拟机，简称EVM，是用来执行以太坊上的交易的。业务流程如下图：
![](https://img.learnblockchain.cn/2019/15548145070948.jpg)

输入一笔交易，内部会转换成一个Message对象，传入EVM执行。

如果是一笔普通转账交易，那么直接修改`StateDB`中对应的账户余额即可。如果是智能合约的创建或者调用，则通过EVM中的解释器加载和执行字节码，执行过程中可能会查询或者修改StateDB。


## 固定油费（Intrinsic Gas）

每笔交易过来，不管三七二十一先需要收取一笔固定油费，计算方法如下：
![交易油费计算](https://img.learnblockchain.cn/2019/15548145839008.jpg)


如果你的交易不带额外数据（Payload），比如普通转账，那么需要收取21000的油费。

如果你的交易携带额外数据，那么这部分数据也是需要收费的，具体来说是按字节收费：字节为0的收4块，字节不为0收68块，所以你会看到很多做合约优化的，目的就是减少数据中不为0的字节数量，从而降低油费gas消耗。


## 生成Contract对象

交易会被转换成一个Message对象传入EVM，而EVM则会根据Message生成一个Contract对象以便后续执行：

![交易生成对象](https://img.learnblockchain.cn/2019/15548149590538.jpg)

可以看到，Contract中会根据合约地址，从`StateDB`中加载对应的代码，后面就可以送入解释器执行了。

另外，执行合约能够消耗的油费有一个上限，就是节点配置的每个区块能够容纳的`GasLimit`。

## 送入解释器执行

代码跟输入都有了，就可以送入解释器执行了。EVM是基于栈的虚拟机，解释器中需要操作四大组件：

* PC：类似于CPU中的PC寄存器，指向当前执行的指令
* Stack：执行堆栈，位宽为256 bits，最大深度为1024
* Memory：内存空间
* Gas：油费池，耗光邮费则交易执行失败

![解释器四大组件](https://img.learnblockchain.cn/2019/15548151682923.jpg)

具体**解释执行的流程**参见下图：

![解释器执行流程](https://img.learnblockchain.cn/2019/15548151793832.jpg)

EVM的每条指令称为一个OpCode，占用一个字节，所以指令集最多不超过256，具体描述参见：https://ethervm.io 。比如下图就是一个示例（PUSH1=0x60, MSTORE=0x52）：

![OpCode指令](https://img.learnblockchain.cn/2019/15548153378078.jpg)

首先PC会从合约代码中读取一个OpCode，然后从一个JumpTable中检索出对应的operation，也就是与其相关联的函数集合。接下来会计算该操作需要消耗的油费，如果油费耗光则执行失败，返回ErrOutOfGas错误。如果油费充足，则调用execute()执行该指令，根据指令类型的不同，会分别对Stack、Memory或者StateDB进行读写操作。

## 调用合约函数

前面分析完了EVM解释执行的主要流程，可能有些同学会问：那么EVM怎么知道交易想调用的是合约里的哪个函数呢？别急，前面提到跟合约代码一起送到解释器里的还有一个Input，而这个Input数据是由交易提供的。

![](https://img.learnblockchain.cn/2019/15548155517748.jpg)

Input数据通常分为两个部分：

* 前面4个字节被称为“4-byte signature”，是某个函数签名的Keccak哈希值的前4个字节，作为该函数的唯一标识。（可以在该网站[查询目前所有的函数签名](https://www.4byte.directory)）

* 后面跟的就是调用该函数需要提供的参数了，长度不定。

举个例子：我在部署完A合约后，调用add(1)对应的Input数据是
```
0x87db03b70000000000000000000000000000000000000000000000000000000000000001
```

而在我们编译智能合约的时候，编译器会自动在生成的字节码的最前面增加一段函数选择逻辑：

首先通过`CALLDATALOAD`指令将“4-byte signature”压入堆栈中，然后依次跟该合约中包含的函数进行比对，如果匹配则调用JUMPI指令跳入该段代码继续执行。

这么讲可能有点抽象，我们可以看一看上图中的合约对应的反汇编代码就一目了然了：

![函数signature](https://img.learnblockchain.cn/2019/15548157930961.jpg)

![反汇编代码](https://img.learnblockchain.cn/2019/15548158001820.jpg)

这里提到了`CALLDATALOAD`，就顺便讲一下数据加载相关的指令，一共有4种：

* CALLDATALOAD：把输入数据加载到Stack中
* CALLDATACOPY：把输入数据加载到Memory中
* CODECOPY：把当前合约代码拷贝到Memory中
* EXTCODECOPY：把外部合约代码拷贝到Memory中

最后一个EXTCODECOPY不太常用，一般是为了审计第三方合约的字节码是否符合规范，消耗的gas一般也比较多。这些指令对应的操作如下图所示：

![](https://img.learnblockchain.cn/2019/15548158875900.jpg)

## 合约调用合约

合约内部调用另外一个合约，有4种调用方式：

* CALL
* CALLCODE
* DELEGATECALL
* STATICALL

后面会专门写篇文章比较它们的异同，这里先以最简单的CALL为例，调用流程如下图所示：

![CALL调用流程](https://img.learnblockchain.cn/2019/15548159348670.jpg)

可以看到，调用者把调用参数存储在内存中，然后执行CALL指令。

CALL指令执行时会创建新的Contract对象，并以内存中的调用参数作为其Input。

解释器会为新合约的执行创建新的`Stack`和`Memory`，从而不会破环原合约的执行环境。

新合约执行完成后，通过RETURN指令把执行结果写入之前指定的内存地址，然后原合约继续向后执行。


## 创建合约

前面都是讨论的合约调用，那么创建合约的流程时怎么样的呢？

如果某一笔交易的to地址为nil，则表明该交易是用于创建智能合约的。

首先需要创建合约地址，采用下面的计算公式：`Keccak(RLP(call_addr, nonce))[:12]`。也就是说，对交易发起人的地址和nonce进行RLP编码，再算出Keccak哈希值，取后20个字节作为该合约的地址。

下一步就是根据合约地址创建对应的`stateObject`，然后存储交易中包含的合约代码。该合约的所有状态变化会存储在一个`storage trie`中，最终以`Key-Value`的形式存储到StateDB中。代码一经存储则无法改变，而`storage trie`中的内容则是可以通过调用合约进行修改的，比如通过SSTORE指令。

![生成合约地址](https://img.learnblockchain.cn/2019/15548162475872.jpg)


## 油费计算

最后啰嗦一下油费的计算，计算公式基本上是根据[以太坊黄皮书](http://gavwood.com/paper.pdf)中的定义。
![以太坊黄皮书 gas](https://img.learnblockchain.cn/2019/15548163052935.jpg)

当然你可以直接read the fucking code，代码位于core/vm/gas.go和core/vm/gas_table.go中。


## 合约的四种调用方式

在中大型的项目中，我们不可能在一个智能合约中实现所有的功能，而且这样也不利于分工合作。一般情况下，我们会把代码按功能划分到不同的库或者合约中，然后提供接口互相调用。

在`Solidity`中，如果只是为了代码复用，我们会把公共代码抽出来，部署到一个library中，后面就可以像调用C库、Java库一样使用了。但是library中不允许定义任何storage类型的变量，这就意味着library不能修改合约的状态。如果需要修改合约状态，我们需要部署一个新的合约，这就涉及到合约调用合约的情况。

合约调用合约有下面4种方式：

* CALL
* CALLCODE
* DELEGATECALL
* STATICCALL

### CALL vs. CALLCODE

CALL和CALLCODE的区别在于：代码执行的上下文环境不同。

具体来说，CALL修改的是**被调用者**的storage，而CALLCODE修改的是**调用者**的storage。

![](https://img.learnblockchain.cn/2019/15548164197499.jpg)


我们写个合约验证一下我们的理解：

```javascript
pragma solidity ^0.4.25;

contract A {
  int public x;
   
  function inc_call(address _contractAddress) public {
      _contractAddress.call(bytes4(keccak256("inc()")));
  }
  function inc_callcode(address _contractAddress) public {
      _contractAddress.callcode(bytes4(keccak256("inc()")));
  }
}

contract B {
  int public x;
   
  function inc() public {
      x++;
  }
}
```

我们先调用一下`inc_call()`，然后查询合约A和B中x的值有什么变化：

![](https://img.learnblockchain.cn/2019/15548164969951.jpg)

可以发现，合约B中的x被修改了，而合约A中的x还等于0。

我们再调用一下`inc_callcode()`试试：

![](https://img.learnblockchain.cn/2019/15548165059270.jpg)

可以发现，这次修改的是合约A中x，合约B中的x保持不变。

### CALLCODE vs. DELEGATECALL

实际上，可以认为DELEGATECALL是CALLCODE的一个bugfix版本，官方已经不建议使用CALLCODE了。

CALLCODE和DELEGATECALL的区别在于：`msg.sender`不同。

具体来说，DELEGATECALL会一直使用原始调用者的地址，而CALLCODE不会。

![CALLCODE和DELEGATECALL区别](https://img.learnblockchain.cn/2019/15548165586862.jpg)

我们还是写一段代码来验证我们的理解：

```
pragma solidity ^0.4.25;

contract A {
  int public x;
   
  function inc_callcode(address _contractAddress) public {
      _contractAddress.callcode(bytes4(keccak256("inc()")));
  }
  function inc_delegatecall(address _contractAddress) public {
      _contractAddress.delegatecall(bytes4(keccak256("inc()")));
  }
}

contract B {
  int public x;
   
  event senderAddr(address);
  function inc() public {
      x++;
      emit senderAddr(msg.sender);
  }
}
```

我们首先调用一下inc_callcode()，观察一下log输出：

![](https://img.learnblockchain.cn/2019/15548165876226.jpg)

可以发现，msg.sender指向合约A的地址，而非交易发起者的地址。

我们再调用一下inc_delegatecall()，观察一下log输出：

![](https://img.learnblockchain.cn/2019/15548165964198.jpg)

可以发现，msg.sender指向的是交易的发起者。

### STATICCALL

STATICCALL放在这里似乎有滥竽充数之嫌，因为目前Solidity中并没有一个low level API可以直接调用它，仅仅是计划将来在编译器层面把调用view和pure类型的函数编译成STATICCALL指令。

view类型的函数表明其不能修改状态变量，而pure类型的函数则更加严格，连读取状态变量都不允许。

目前是在编译阶段来检查这一点的，如果不符合规定则会出现编译错误。如果将来换成STATICCALL指令，就可以完全在运行时阶段来保证这一点了，你可能会看到一个执行失败的交易。

话不多说，我们就先看看STATICCALL的实现代码吧：

![](https://img.learnblockchain.cn/2019/15548166792555.jpg)

可以看到，解释器增加了一个readOnly属性，STATICCALL会把该属性置为true，如果出现状态变量的写操作，则会返回一个errWriteProtection错误。

总结：以太坊虚拟机用来执行以太坊上的交易，更改以太坊状态。交易分两种：普通交易和智能合约交易。在执行交易时需要支付油费。智能合约之间的调用有四种方式。

作者Star Li，他的公众号[星想法](https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzU5MzMxNTk2Nw==&scene=124#wechat_redirect)有很多原创高质量文章，欢迎大家关注。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，学区块链都在这里，打造最好的区块链技术博客。

