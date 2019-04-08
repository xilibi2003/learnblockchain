---
title: Web3与智能合约交互实战
permalink: web3-html
date: 2018-04-15 21:24:16
categories: 
    - 以太坊
tags:
    - 以太坊
    - Web3
    - 智能合约

author: 盖盖
---

Web3与智能合约交互实战

<!-- more -->

## 写在前面
在最初学习以太坊的时候，很多人都是自己创建以太坊节点后，使用geth与之交互。这种使用命令行交互的方法虽然让很多程序员感到兴奋（黑客帝国的既视感？），但不可能指望普通用户通过命令行使用Dapp。因此，我们需要一种友好的方式（比如一个web页面）来与智能合约交互，于是问题的答案就是``web3.js``。

## Web3.js
[Web3.js](https://web3js.readthedocs.io/en/1.0/)是以太坊官方的Javascript API，可以帮助智能合约开发者使用HTTP或者IPC与本地的或者远程的以太坊节点交互。实际上就是一个库的集合，主要包括下面几个库：

* ``web3-eth``用来与以太坊区块链和智能合约交互
* ``web3-shh``用来控制whisper协议与p2p通信以及广播
* ``web3-bzz``用来与swarm协议交互
* ``web3-utils``包含了一些Dapp开发有用的功能

Web3与geth通信使用的是 [JSON-RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC) ，这是一种轻量级的RPC（Remote Procedure Call）协议，整个通信的模型可以抽象为下图。

![Web3 Communication Model](https://img.learnblockchain.cn/2018/Communication_Model.jpg!wl)

## 搭建测试链
在开发初期，我们并没有必要使用真实的公链，为了开发效率，一般选择在本地搭建测试链。在本文我们选择的[Ganache](http://truffleframework.com/ganache/)（在此之前使用的是testrpc，Ganache属于它的升级版），一个图形化测试软件（也有命令行版本），可以一键在本地搭建以太坊区块链测试环境，并且将区块链的状态通过图形界面显示出来，Ganache的运行界面如下图所示。

![Ganache](https://img.learnblockchain.cn/2018/Ganache.png!wl)

从图中可以看到Ganache会默认创建10个账户，监听地址是``http://127.0.0.1:7545``，可以实时看到``Current Block``、``Gas Price``、``Gas Limit``等信息。

## 创建智能合约
目前以太坊官方全力支持的智能合约开发环境是[Remix IDE](https://remix.ethereum.org)，我们在合约编辑页面编写如下代码：

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

代码很简单，就是简单的给``name``和``age``变量赋值与读取，接下来切换到 run 的 tab 下，将``Environment``切换成``Web3 Provider``，并输入我们的测试链的地址``http://127.0.0.1:7545``，这里对这三个选项做一简单说明：

* ``Javascript VM``：简单的Javascript虚拟机环境，纯粹练习智能合约编写的时候可以选择
* ``Injected Web3``：连接到嵌入到页面的Web3，比如连接到MetaMask
* ``Web3 Provider``：连接到自定义的节点，如私有的测试网络。

如果连接成功，那么在下面的``Account``的选项会默认选择 Ganache 创建的第一个账户地址。接下来我们点击``Create``就会将我们的智能合约部署到我们的测试网中。接下来 Remix 的页面不要关闭，在后面编写前端代码时还要用到合约的地址以及``ABI``信息。

## 安装Web3
在这之前，先在终端创建我们的项目：

```bash
> mkdir info
> cd info
```

接下来使用 node.js 的包管理工具 npm 初始化项目，创建``package.json`` 文件，其中保存了项目需要的相关依赖环境。

```
> npm init
```

一路按回车直到项目创建完成。最后，运行下面命令安装web.js：

```
> npm install web3
```

>	*注意：* 在实际安装过程中我发现web3在安装完成后并没有 ``/node_modules/web3/dist/we3.min.js`` 文件，这个问题在 [issue#1041](https://github.com/ethereum/web3.js/issues/1041)中有体现，但官方好像一直没解决。不过可以在这里[下载](https://codeload.github.com/ethereum/web3.js/zip/develop)所需的文件，解压后将``dist``文件夹的内容拷贝到 ``/node_modules/web3``路径下。

## 创建 UI
在项目目录下创建``index.html``，在这里我们将创建基础的 UI，功能包括``name``和``age``的输入框，以及一个按钮，这些将通过 jQuery 实现：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
permalink: web3-html

    <link rel="stylesheet" type="text/css" href="main.css">

    <script src="./node_modules/web3/dist/web3.min.js"></script>

</head>
<body>
    <div class="container">

        <h1>Info Contract</h1>

        <h2 id="info"></h2>

        <label for="name" class="col-lg-2 control-label">Name</label>
        <input id="name" type="text">

        <label for="name" class="col-lg-2 control-label">Age</label>
        <input id="age" type="text">

        <button id="button">Update Info</button>


    </div>

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>

    <script>
       // Our future code here..
    </script>

</body>
</html>
```

接下来需要编写``main.css``文件设定基本的样式：

```css
body {
    background-color:#F0F0F0;
    padding: 2em;
    font-family: 'Raleway','Source Sans Pro', 'Arial';
}
.container {
    width: 50%;
    margin: 0 auto;
}
label {
    display:block;
    margin-bottom:10px;
}
input {
    padding:10px;
    width: 50%;
    margin-bottom: 1em;
}
button {
    margin: 2em 0;
    padding: 1em 4em;
    display:block;
}

#info {
    padding:1em;
    background-color:#fff;
    margin: 1em 0;
}
```

##使用Web3与智能合约交互
UI 创建好之后，在``<script>``标签中间编写``web.js``的代码与智能合约交互。首先创建``web3``实例，并与我们的测试环境连接：

```js
<script>
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    }
</script>
```

这段代码是[web3.js Github](https://github.com/ethereum/web3.js/)提供的样例，意思是如果``web3``已经被定义，那么就可以直接当作我们的 provider 使用。如果没有定义，则我们手动指定 provider。

> 这里可能会存在疑问：为什么 web3 会被事先定义呢？实际上，如果你使用类似 [MetaMask](https://metamask.io/)（一个 Chrome 上的插件，迷你型以太坊钱包）这样的软件，provider 就会被自动植入。

在上面代码的基础上，接下来设置默认的以太坊账户：

```js
web3.eth.defaultAccount = web3.eth.accounts[0];
```
在上文中我们使用 Ganache 已经创建了 10 个账户了，这里我们选择第一个账户当作默认账户。

接下来需要让我们的``web3``知道我们的合约是什么样的，这里需要用到合约的 [ABI（Application Binary Interface）](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI)。``ABI``可以使我们调用合约的函数，并且从合约中获取数据。

在上文中我们已经在 Remix 中创建了我们的合约，这时重新回到 Remix，在 Compile 的 tab 下我们点击``Details`` 出现的页面中我们可以拷贝合约的``ABI``，如下图所示。
![](https://img.learnblockchain.cn/2018/ABI.png!wl)
将其复制到代码中：

```js
var infoContract = web3.eth.contract(PASTE ABI HERE!);
```

接下来转到 run 的tab，拷贝合约的地址，将其复制到下面的代码中：

```js
var info = InfoContract.at('PASTE CONTRACT ADDRESS HERE');
```

完成这些我们就可以调用合约中的函数了，下面我们使用 jQuery 与我们的合约进行交互：

```js
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
```
以上的代码就简单地实现了对合约中两个函数的调用，分别读取和显示``name``和``age``变量。

到此我们就完成了全部的代码，完整代码可以在 [InfoContract](https://github.com/xilibi2003/InfoContract) 中找到。在浏览器中打开``index.html``测试效果如下图（输入名字和年龄后刷新）。

![](https://img.learnblockchain.cn/2018/page.png!wl)

本文中点击"Updata Info"按钮之后，虽然调用智能合约成功，但是当前的界面并没有得到更新，下一篇文章会介绍[Web3监听合约事件更新界面](https://learnblockchain.cn/2018/05/09/solidity-event/)。

本文的作者是盖盖，他的微信公众号: chainlab


强烈安利两门视频课程给大家：
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发
* [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) -  Solidity 语言面面俱到

## 参考文献
* [Interacting with a Smart Contract through Web3.js (Tutorial)](https://coursetro.com/posts/code/99/Interacting-with-a-Smart-Contract-through-Web3.js-(Tutorial))


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果你想和我有密切的联系，欢迎加入知识星球[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)，我会在星球为大家解答技术问题，作为星友福利，星友可加入我创建的区块链技术群，群内已经聚集了300多位区块链技术牛人和爱好者。



