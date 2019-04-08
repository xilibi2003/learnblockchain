---
title: 详解 Solidity 事件Event - 完全搞懂事件的使用
permalink: solidity-event
date: 2018-05-09 20:37:03

categories: 
    - 以太坊
    - 智能合约
tags:
    - Solidity
    - Event
    - web3
    - 智能合约

author: Tiny熊

---

很多同学对Solidity 中的Event有疑问，这篇文章就来详细的看看Solidity 中Event到底有什么用？

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)，另外
本文在监听合约事件是对上一篇[Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/)进行补充，如果阅读了上一篇可以更好的理解本文。


## 什么是事件Evnet

事件是以太坊虚拟机(EVM)日志基础设施提供的一个便利接口。当被发送事件（调用）时，会触发参数存储到交易的日志中（一种区块链上的特殊数据结构）。这些日志与合约的地址关联，并记录到区块链中.
来捋这个关系：区块链是打包一系列交易的区块组成的链条，每一个交易“收据”会包含0到多个日志记录，日志代表着智能合约所触发的事件。

**在DAPP的应用中，如果监听了某事件，当事件发生时，会进行回调。**
不过要注意：日志和事件在合约内是无法被访问的，即使是创建日志的合约。

在Solidity 代码中，使用event 关键字来定义一个事件，如：

```js
event EventName(address bidder, uint amount); 
```

这个用法和定义函数式一样的，并且事件在合约中同样可以被继承。触发一个事件使用emit(说明，之前的版本里并不需要使用emit)，如：


```js
emit EventName(msg.sender, msg.value); 
```

触发事件可以在任何函数中调用，如：

```js
function testEvent() public {

    // 触发一个事件
     emit EventName(msg.sender, msg.value); 
}
```


## 监听事件

通过上面的介绍，可能大家还是不清楚事件有什么作用，如果你跟过[Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/)这篇文章，你会发现点击"Updata Info"按钮之后，虽然调用智能合约成功，但是当前的界面并没有得到更新。
使用事件监听，就可以很好的解决这个问题，让看看如何实现。

### 修改合约，定义事件及触发事件
先回顾一下合约代码：

```js
pragma solidity ^0.4.21;

contract InfoContract {
    
   string fName;
   uint age;
   
   function setInfo(string _fName, uint _age) public {
       fName = _fName;
       age = _age;
   }
   
   function getInfo() public constant returns (string, uint) {
       return (fName, age);
   }   
}
```

首先，需要定义一个事件：

```js
 event Instructor(
       string name,
       uint age
    );
```

这个事件中，会接受两个参数：name 和  age , 也就是需要跟踪的两个信息。

然后，需要在setInfo函数中，触发Instructor事件，如：

```js
   function setInfo(string _fName, uint _age) public {
       fName = _fName;
       age = _age;
       emit Instructor(_fName, _age);
   }
```

在[Web3与智能合约交互实战](https://learnblockchain.cn/2018/04/15/web3-html/), 点击"Updata Info"按钮之后，会调用setInfo函数，函数时触发Instructor事件。

### 使用Web3监听事件，刷新UI

现在需要使用Web3监听事件，刷新UI。
先回顾下之前的使用Web3和智能合约交互的代码：

```js
<script>
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    }

    web3.eth.defaultAccount = web3.eth.accounts[0];

    var infoContract = web3.eth.contract(ABI INFO);

    var info = infoContract.at('CONTRACT ADDRESS');

    info.getInfo(function(error, result){
        if(!error)
            {
                $("#info").html(result[0]+' ('+result[1]+' years old)');
                console.log(result);
            }
        else
            console.error(error);
    });

    $("#button").click(function() {
        info.setInfo($("#name").val(), $("#age").val());
    });

</script>
```

现在可以不需要 info.getInfo()来获取信息，而改用监听事件获取信息，先定义一个变量引用事件：

```js
var instructorEvent = info.Instructor();
```

然后使用**.watch()**方法来添加一个回调函数：

```js
instructorEvent.watch(function(error, result) {
        if (!error)
            {
                $("#info").html(result.args.name + ' (' + result.args.age + ' years old)');
            } else {
                console.log(error);
            }
    });
```

代码更新之后，可以在浏览器查看效果，这是点击"Updata Info"按钮之后，会及时更新界面，如图：
![](https://img.learnblockchain.cn/2018/solidity_event.jpg!wl)

完整的代码请订阅小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。


## 事件高级用法-过滤器

有时我们会有这样的需求：获取当前所有姓名及年龄记录，或者是，要过滤出年龄28岁的记录，应该如何做呢？
以及另外一个常见的场景：想要获取到代币合约中所有的转账记录，也同样需要使用事件过滤器功能，这部分内容请大家订阅小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)阅读。

另外强烈安利两门视频课程给大家：
*  [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) - Solidity 语言面面俱到
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发

## 参考文章

https://coursetro.com/posts/code/100/Solidity-Events-Tutorial---Using-Web3.js-to-Listen-for-Smart-Contract-Events
https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-events

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果你想和我有密切的联系，欢迎加入知识星球[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)，我会在星球为大家解答技术问题，作为星友福利，星友可加入我创建的区块链技术群，群内已经聚集了300多位区块链技术牛人和爱好者。


<!-- 
有时我们会有这样的需求：获取当前所有姓名及年龄记录，应该如何做呢？
实际上事件支持过滤器，可以从所有的区块中过滤出符合要求的事件，如：

```js
var instructorEvent = info.Instructor({}, {fromBlock: 0, toBlock: 'latest'});
```

或者是，要过滤出年龄28岁的记录，可以这样：

```js
var instructorEvent = info.Instructor({ 'age': 28});
```

比如，我们要获取到代币合约中，所有的转账记录， 就可以使用：

```js
var transferEvent = token.Transfer({}, {fromBlock: 0, toBlock: 'latest'})
var transferEvent.watch(function(error, result){
    // handle result.args.from  result.args.to
});
```
 -->


