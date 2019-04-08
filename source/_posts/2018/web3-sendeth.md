---
title: 如何使用Web3.js API 在页面中进行转账
permalink: web3-sendeth
date: 2018-09-12 17:22:34
categories: 
    - 以太坊
    - Dapp
tags:
    - Dapp入门
    - Web3.js
author: Tiny熊

---

本文介绍如何使用Web3.js API 在页面中进行转账，是我翻译的文档[Web3.js 0.2x 中文版](https://web3.learnblockchain.cn/0.2x.x/) 及 [区块链全栈-以太坊DAPP开发实战](https://ke.qq.com/course/335169) 中Demo的文章说明。

<!-- more -->

## 写在前面
阅读本文前，你应该对以太坊、智能合约、钱包的概念有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)
除此之外，你最好还了解一些HTML及JavaScript知识。

## 转账UI 页面的编写

转账UI主体的界面如图：
![](https://img.learnblockchain.cn/2018/web3_sendeth_ui.jpg!wl)

实现这个界面很简单，这里就不代码了。大家可以打开[Demo](https://web3.learnblockchain.cn/transDemo.html)，右击查看页面源码。

## 用户环境检查

既然需要使用Web3.js API 在页面中进行转账， 首先应该检查在浏览器环境有没有安装好钱包，并且钱包应该是解锁状态。

1. 先检查是否安装了MetaMask钱包：

```js
window.addEventListener('load', function() {
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
            if (web3.currentProvider.isMetaMask == true) {
                // "MetaMask可用"
            } else {
                // "非MetaMask环境"
            }
        } else {
            $("#env").html("No web3? 需要安装<a href='https://metamask.io/'>MetaMask</a>!");
        }
}

```

MetaMask推荐在window加载时，进行MetaMask的检查，当然在没有安装MetaMask时，也可以指定一个节点Provider来创建web3，可以参考[Web3.js 文档引入web3](https://web3.learnblockchain.cn/0.2x.x/#web3)

2. 检查是否钱包已经解锁：
我们在发送交易之前应该先首先检查一下当前钱包的一个状态，检查钱包是否解锁(是否输入了密码进入了MetaMask)，通常使用eth下面的getAccounts来进行检查，getAccounts是会返回账号的一个列表，如果当前账号列表里面有数据的话，说明钱包已经解锁可以获得到账号，如果账号拿到的列表是空的话，那么说明钱包没有解锁。

可以把下面的代码加到上面的监听函数中：

```js
web3.eth.getAccounts(function (err, accounts) {
            if (accounts.length == 0) {
                $("#account").html("请检查钱包是否解锁");
            } 
            });
```


## 发送交易

如果MetaMask钱包是解锁的，我们就可以来发送交易，发送交易使用[sendtransaction](https://web3.learnblockchain.cn/0.2x.x/web3.eth/#web3ethsendtransaction)这个方法。

```js
web3.eth.sendTransaction(transactionObject [, callback])
```

第二个参数是回调函数用来获得发送交易的Hash值。

第一个参数是一个交易对象，交易对象里面有几个字段：

* from : 就是从哪个账号发送金额
* to : 发动到到哪个账号
* value 是发送的金额
* gas: 设置gas limit
* gasPrice: 设置gas 价格

如果from没有的话，他就会用当前的默认账号， 如果是转账to和value是必选的两个字段。
在发送交易的时候弹出来MetaMask的一个授权的窗口，如果我们gas和gasPrice没有设置的话，就可以在MetaMask里面去设置。如果这两个gas和gas Price设置了的话，MetaMask就会使用我们设置的gas。

因此在发送交易的时候，关键是构造这样一个交易对象，JavaScrpt代码如下：

```js
//  这里使用Metamask 给的gas Limit 及 gas 价
var fromAccount = $('#fromAccount').val();
var toAccount = $('#toAccount').val();
var amount = $('#amount').val();

// 对输入的数字做一个检查
if (web3.isAddress(fromAccount) &&
            web3.isAddress(toAccount) &&
            amount != null && amount.length > 0） {
    var message = {from: fromAccount, to:toAccount, value: web3.toWei(amount, 'ether')};

    web3.eth.sendTransaction(message, (err, res) => {
        var output = "";
        if (!err) {
            output += res;
        } else {
            output = "Error";
        }
    }
}

```

补充说明：`$('#fromAccount').val()`是使用JQuery用来获取用户输入内容，其次应该在实际构造发送交易之前对输入的参数做一个判断，`web3.isAddress`用来检查字符串是不是地址。另外对于一个向普通外部地址账号的转账，消耗的gas 是固定的21000。

### 运行测试

需要注意一点的是，由于安全原因，MetaMask只支持站点方式访问的页面，即通过http:// 来访问页面，在浏览器中通过file:// + 文件地址的方式是不行的。
因此需要把编写的代码放置到web服务器的目录下，自己试验下。

线上的Demo地址为[https://web3.learnblockchain.cn/transDemo.html](https://web3.learnblockchain.cn/transDemo.html)

想好好系统学习以太坊DApp开发，这门视频课程[以太坊DAPP开发实战](https://ke.qq.com/course/335169)不容错过。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
深入浅出区块链[知识星球](https://learnblockchain.cn/images/zsxq.png)，最专业的区块链问题技术社区，欢迎加入，作为星友福利，星友还可以加入我创建优质区块链技术群，群内聚集了300多位区块链技术大牛和爱好者。


