---
title: 智能合约语言 Solidity 教程系列2 - 地址类型介绍  
permalink: solidity2
date: 2017-12-12 15:25:59
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity
    - 智能合约
author: Tiny熊
---

Solidity教程系列第二篇 - Solidity地址类型介绍. 
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。
<!-- more -->

## 写在前面

Solidity是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

本文前半部分是参考Solidity官方文档（当前最新版本：0.4.20）进行翻译，后半部分是结合实际合约代码实例说明类型的使用（仅针对[专栏](https://xiaozhuanlan.com/blockchaincore)订阅用户）。

## 地址类型（Address）

地址类型**address**是一个值类型，

**地址**： 20字节（一个以太坊地址的长度），地址类型也有成员，地址是所有合约的基础
支持的运算符：
* <=, <, ==, !=, >= 和 >
> 注意：从0.5.0开始，合约不再继承自地址类型，但仍然可以显式转换为地址。

### 地址类型的成员
* balance 属性及transfer() 函数 
  这里是地址类型相关成员的[快速索引](https://solidity.readthedocs.io/en/develop/units-and-global-variables.html#address-related)
    balance用来查询账户余额，transfer()用来发送以太币（以wei为单位）。
    如：
    ```
    address x = 0x123;
    address myAddress = this;
    if (x.balance < 10 && myAddress.balance >= 10) x.transfer(10);
    ```
   **注解**：如果x是合约地址，合约的回退函数（fallback 函数）会随**transfer**调用一起执行（这个是EVM特性），如果因gas耗光或其他原因失败，转移交易会还原并且合约会抛异常停止。
   > 关于回退函数（fallback 函数），简单来说它是合约中无函数名函数，下面代码事例中，进进一步讲解回退函数（fallback） 的使用。


* send() 函数
    send 与transfer对应，但更底层。如果执行失败，transfer不会因异常停止，而send会返回false。
    > **警告**：send() 执行有一些风险：如果调用栈的深度超过1024或gas耗光，交易都会失败。因此，为了保证安全，必须检查send的返回值，如果交易失败，会回退以太币。如果用transfer会更好。

* call(), callcode() 和 delegatecall() 函数
    为了和非ABI协议的合约进行交互，可以使用call() 函数, 它用来向另一个合约发送原始数据，支持任何类型任意数量的参数，每个参数会按规则(ABI协议)打包成32字节并一一拼接到一起。一个例外是：如果第一个参数恰好4个字节，在这种情况下，会被认为根据ABI协议定义的函数器指定的函数签名而直接使用。如果仅想发送消息体，需要避免第一个参数是4个字节。如下面的例子：
    ```
    address nameReg = 0x72ba7d8e73fe8eb666ea66babc8116a41bfb10e2;
    nameReg.call("register", "MyName");
    nameReg.call(bytes4(keccak256("fun(uint256)")), a);
    ```

    **call**函数返回一个bool值，以表明执行成功与否。正常结束返回true，异常终止返回false。但无法获取到结果数据，因为需要提前知道返回的数据的编码和数据大小（因不知道对方使用的协议格式，所以也不会知道返回的结果如何解析）。
    还可以提供**.gas()**修饰器进行调用：
    ```
    namReg.call.gas(1000000)("register", "MyName");
    ```

    类似还可以提供附带以太币：
    ```
    nameReg.call.value(1 ether)("register", "MyName");
    ```

    修饰器可以混合使用，修饰器调用顺序无所谓。
    ```
    nameReg.call.gas(1000000).value(1 ether)("register", "MyName");
    ```

    > 注解：目前还不能在重载函数上使用gas或value修饰符，A workaround is to introduce a special case for gas and value and just re-check whether they are present at the point of overload resolution.（这句我怕翻译的不准确，引用原文）

    同样我们也可以使用delegatecall()，它与call方法的区别在于，仅仅是代码会执行，而其它方面，如（存储，余额等）都是用的当前的合约的数据。delegatecall()方法的目的是用来执行另一个合约中的库代码。所以开发者需要保证两个合约中的存储变量能兼容，来保证delegatecall()能顺利执行。在homestead阶段之前，仅有一个受限的callcode()方法可用，但callcode未提供对msg.sender，msg.value的访问权限。

    上面的这三个方法call()，delegatecall()，callcode()都是底层的消息传递调用，最好仅在万不得已才进行使用，因为他们破坏了Solidity的类型安全。
    .gas() 在call(), callcode() 和 delegatecall() 函数下都可以使用， delegatecall()不支持.value()
    
    > 注解：所有合约都继承了address的成员，因此可以使用this.balance查询余额。
    > callcode不鼓励使用，以后会移除。

    > 警告：上述的函数都是底层的函数，使用时要异常小心。当调用一个未知的，可能是恶意的合约时，当你把控制权交给它，它可能回调回你的合约，所以要准备好在调用返回时，应对你的状态变量可能被恶意篡改的情况。


## 地址常量（Address Literals） 
一个能通过地址合法性检查（address checksum test）十六进制常量就会被认为是地址，如0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF。而不能通过地址合法性检查的39到41位长的十六进制常量，会提示一个警告，被视为普通的有理数常量。

> 地址合法性检查定义在[EIP-55](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md)

##  合约事例讲解

### 合约事例代码

```js
pragma solidity ^0.4.0;

contract AddrTest{
    event logdata(bytes data);
    function() payable {
        logdata(msg.data);
    }
    
    function getBalance() returns (uint) {
        return this.balance;
    }

    uint score = 0;
    function setScore(uint s) public {
        score = s;
    }
    
    function getScore() returns ( uint){
        return score;
    }
}

contract CallTest{
    function deposit() payable {
    }
    
    event logSendEvent(address to, uint value);
    function transferEther(address towho) payable {
        towho.transfer(10);
        logSendEvent(towho, 10);
    }
    
    function callNoFunc(address addr) returns (bool){
        return addr.call("tinyxiong", 1234);
    }
  
    function callfunc(address addr) returns (bool){
        bytes4 methodId = bytes4(keccak256("setScore(uint256)"));
        return addr.call(methodId, 100);
    }  
    
    function getBalance() returns (uint) {
        return this.balance;
    }  
}
```
### 代码运行及讲解
代码运行及讲解，请订阅[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。

强烈安利一门视频课程给大家： [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。

## 参考文档
[Solidity官方文档-类型](https://solidity.readthedocs.io/en/develop/types.html)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。


<!---
和[类型介绍](https://xiaozhuanlan.com/topic/7518269403)篇一样，打开[Remix - Solidity IDE](https://ethereum.github.io/browser-solidity),帖入代码，依次创建合约AddrTest及CallTest，如图：
![](https://img.learnblockchain.cn/2017/testaddr.jpg!wl)

创建合约后，可以看到，AddrTest合约内没有命令的函数，显示fallback。

AddrTest合约主要是用来说明转入以太币及调用函数式回退函数的调用情况，CallTest合约是作为AddrTest合约的调用者。
CallTest合约的函数说明：
* transferEther(address towho):  用来给指定合约地址转账（如果一个函数需要进行货币操作，必须要带上payable关键字），转账时填入AddrTest的地址（加双引号）作为参数
* deposit(): 函数上增加payable标识，可接收ether，并会把ether存在当前合约，（transferEther转账前需要先存款）。
* callfunc() : 调用函数，使用指定的是函数签名。
* callNoFunc(): 调用不存在的函数，这时被调用的合约的fallback函数会执行。

关于fallback函数用法可进一步参考这一篇:[Ethereum-Development-Best-Practices][1]及[问答](https://ethereum.stackexchange.com/questions/7570/whats-a-fallback-function-when-using-address-send)
下面截图演示下，存款和转账，其他的调用请读者动手练习。
存款操作如图：
![](https://img.learnblockchain.cn/2017/testaddr1.jpg!wl)
完成后，可以在左下角区域查看日志Details->value。
然后进行转账，如图：
![](https://img.learnblockchain.cn/2017/testaddr2.jpg!wl)

完成后，可以在左下角区域查看日志Details->logs数据，可以看到fallback函数被调用。
还可以调用AddrTest的getBalance查看余额数据。

[1]: https://github.com/ConsenSys/Ethereum-Development-Best-Practices/wiki/Fallback-functions-and-the-fundamental-limitations-of-using-send()-in-Ethereum-&-Solidity
-->


