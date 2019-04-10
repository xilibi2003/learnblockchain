---
title:  使用Truffle开发以太坊投票DAPP
permalink: election-dapp
un_reward: true
date: 2019-04-10 17:51:31
categories: 
    - 以太坊
    - Dapp
tags:
    - Dapp
    - Truffle
author: Tiny熊
---


投票最担心的是暗箱操作、利用区块链的去中心化技术，来实现一个DAPP保证投票公平公正，来看看如何实现，通过本文可以了解到映射`mapping` 、结构体`struct` 及事件 `event` 的使用。


<!-- more -->

##  投票需求分及实现效果 

要实现一个投票DApp，对于合约来说有两个基本需求：
1. 每人（账号）只能投一票；
2. 记录下一共有多少候选人
3. 记录每个候选人的得票数。


在界面上，需要看到每个候选人的得票数， 已经选择投票人进行投票，来看看实现的效果图：

![投票界面及结果](https://img.learnblockchain.cn/2019/15548051127201.jpg!wl)


## 投票合约实现

### 数据存储
每人（账号）只能投一票很容易实现，只需要使用一个`mapping` 来记录每个地址的投票信息

定义一个 mapping 记录投票记录：

```
mapping(address => bool) public voters;
```

记录候选人及得票数， 我们思考下，如何合约中表示一个候选人，这里我们用一个结构体来表示候选人：


```
struct Candidate {
    uint id;
    string name;  // 候选人的名字
    uint voteCount;
}
```

在Candidate结构体中，用`voteCount`表示得票数。我们还需要记录下一共有多少个候选人，直觉是保存到一个数组，前端需要候选人列表时，直接把这个数组返回给前端。

基于EVM的限制，外部函数是没法返回动态的内容，更多可阅读[Solidity数组](https://learnblockchain.cn/2017/12/21/solidity-arrays/)，所以这里我们需要使用一个变通的方案。

用一个变量保存一共有多少个候选人`uint public candidatesCount`，然后定义一个映射：
```
mapping(uint => Candidate) public candidates
```
通过id作为`key`访问映射candidates来取候选人。


### 投票功能实现

接下来就是添加功能： 主要是两个功能： 添加候选人及投票。

每添加一个候选人就加入到candidates映射中，同时候选人数量加1，添加候选人addCandidate函数实现为：

```js
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
```

我们在合约创建的时候，就把候选人添加好，在构造函数中，调用addCandidate，构造函数实现如下：

```js
    constructor () public {
        addCandidate("Tiny 熊");
        addCandidate("Big 熊");
    }
```

投票就是在对应的候选人的voteCount加1，同时这个函数需要一个参数即给哪一个候选人投票，另外需要进行一些合法性检查: 候选人是有效的，投票人必须没有投过票，投票vote函数实现如下：

```js
    function vote (uint _candidateId) public {
        require(!voters[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount ++;
    }
```

### 事件Event

为了有更好的前端体验， 在用户投票之后，应该及时的刷新页面， 这就需要用到事件了。
> 你还可以阅读另外一篇文章：[详解 Solidity 事件Event](https://learnblockchain.cn/2018/05/09/solidity-event/) 了解更多事件知识。

先定义一个事件：
```js
    // voted event
    event votedEvent (
        uint indexed _candidateId
    );
```

然后在投票vote函数中最后一行加入发出事件：

```
emit votedEvent(_candidateId);
```

合约部分代码编写完了， 订阅[小专栏](https://xiaozhuanlan.com/blockchaincore) 获取完整源代码。

## 合约部署

为合约Election，添加一个部署脚本：

```
var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election);
};

```

在部署之前，还需要打开以太坊的模拟节点Ganache，并确保Truffle配置文件truffle.js 链接节点的地址和端口与Ganache 一致。
> Ganache 的安装使用可阅读[开发、部署第一个DApp](https://learnblockchain.cn/2018/01/12/first-dapp/)
> 如果要部署到以太坊正式网络可阅读[用Truffle 开发一个链上记事本](https://learnblockchain.cn/2019/03/30/dapp_noteOnChain/)

然后运行一下命令进行部署：

```
truffle migrate
```

## 前端界面

有一个html `table`标签显示候选人列表:

```html
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">候选人</th>
          <th scope="col">得票数</th>
        </tr>
      </thead>
      <tbody id="candidatesResults">
      </tbody>
    </table>
```

candidatesResults的内容，需要使用[web3.js](https://web3.learnblockchain.cn/0.2x.x/)从合约中读取候选人信息后动态填入。

使用`form`标签执行投票操作：
```html
    <form onSubmit="App.castVote(); return false;">
      <div class="form-group">
        <label for="candidatesSelect">选择候选人</label>
        <select class="form-control" id="candidatesSelect">
        </select>
      </div>
      <button type="submit" class="btn btn-primary">投票</button>
      <hr />
    </form>
```

## 合约交互

分三个部分：
1. 初始化 web3 及合约
2. 获取候选人填充到前端页面
3. 用户提交投票

### 初始化

 在`initWeb3`函数中，完成web3的初始化

```javascript
  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
}
```

web3的初始化，调用App.initContract进行合约初始化：

```
 initContract: function() {
    $.getJSON("Election.json", function(election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  }
```

### 监听投票事件


```java
listenForEvents: function() {    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        App.render();
      });
    });
  }
```

这里有一份[web3.js 监听事件 API文档说明](https://web3.learnblockchain.cn/0.2x.x/web3.eth/#contract-events)

### 候选人界面渲染

```js
  render: function() {
    var electionInstance;
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();  // ❶
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {  // ❷
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate); // ❸

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);  // ❹
        });
      }
    }
```

+ ❶ 获取候选人数量
+ ❷ 依次获取某一个候选人信息
+ ❸ 候选人信息写入候选人表格内
+ ❹ 候选人信息写入投票选项

## 运行DApp

使用以下命令，启动DApp 服务：

```
npm run dev
```

在浏览器打开`http://localhost:3000` ， 浏览器的MetaMask 小狐狸插件需要连接到Ganache网络， 因为只有网络一致才可以读取到网络上的合约数据。

> 如何设置MetaMask 可阅读[开发、部署第一个去中心化应用](https://learnblockchain.cn/2018/01/12/first-dapp/)。


本文为保持主干清晰，代码有删减， 网站代码请订阅[小专栏](https://xiaozhuanlan.com/blockchaincore)查看。


## 参考文档

[Truffle 官方文档](https://truffleframework.com/) 


加我微信：xlbxiong 备注：DApp， 加入以太坊DApp开发微信群。


加入[知识星球](https://learnblockchain.cn/images/zsxq.png) 成长比别人快一点。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，学区块链的都在这里，打造最好的区块链技术博客。







