---
title: 使用ethers.js开发以太坊Web钱包4 - 发送Token(代币）
permalink: eth-web-wallet_4
date: 2018-10-26 17:34:44
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - ERC20
    - ethers.js
author: Tiny熊
---

以太坊去中心化网页钱包开发系列，点链接[观看视频课程](https://ke.qq.com/course/356068?tuin=bd898bbf)，将从零开始开发出一个可以实际使用的钱包，本系列文章是理论与实战相结合，一共有四篇：[创建钱包账号](https://learnblockchain.cn/2018/10/25/eth-web-wallet_1/)、[账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)、[展示钱包信息及发起签名交易](https://learnblockchain.cn/2018/10/26/eth-web-wallet_3/)、[发送Token(代币）](https://learnblockchain.cn/2018/10/26/eth-web-wallet_4/)，本文是第四篇，Token（代币、通证）是以太坊的一大特色，既然开发钱包，则发送Token 功能必不可少。

<!-- more -->

## 合约 ABI 信息

首先我们需要明白，进行Token转账的时候，其实是在调用合约的转账函数，而要调用一个合约的函数，需要知道合约的 ABI 信息。

> 如何创建直接的Token，可阅读[创建ERC20代币](https://learnblockchain.cn/2018/01/12/create_token/)

其次 通常我们所说的Token， 其实指的是符合 ERC20 标准接口的合约， [ERC20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) 接口定义如下：

```js
contract ERC20Interface {

    string public constant name = "Token Name";
    string public constant symbol = "SYM";
    uint8 public constant decimals = 0;

    function totalSupply() public constant returns (uint);

    function balanceOf(address tokenOwner) public constant returns (uint balance);

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function approve(address spender, uint tokens) public returns (bool success);

    function transfer(address to, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);


    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
```

ABI 全称是 Application Binary Interface，它就是合约接口的描述，因此有了合约的接口定义，就可以很容易通过编译拿到ABI 信息，比如像下图在Remix 的编译选项卡就可以直接复制ABI。

![](https://img.learnblockchain.cn/2018/15403775499051.jpg!wl)

生成的 ABI 描述大概长这样：

```js
[
...
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "tokenOwner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	...
]
```

它是一个JSON形式的数组，数组里每一个元素，都是对函数接口的描述，在外部调用合约的时候就需要遵从这个接口，以上面的接口为例，通常一个接口描述包含下述几个字段：

* name: 函数会事件的名称
* type: 可取值有function，constructor，fallback，event
* inputs: 函数的输入参数，每个参数对象包含下述属性：
    * name: 参数名称
    * type: 参数的规范型(Canonical Type)。
* outputs:  一系列的类似inputs的对象，如果无返回值时，可以省略。
* constant: true表示函数声明自己不会改变状态变量的值。
* payable: true表示函数可以接收ether，否则表示不能。

接下来在构造合约对象就需要是使用ABI。

## 构造合约对象

ethers.js 构造合约对象很简单，仅需要提供三个参数给ethers.Contract构造函数，代码如下：

```js
 var abi = [...];
 var addr = "0x...";
 var contract = new ethers.Contract(address, abi, provider);

```

合约的地址在合约部署之后，可以获得，关于Token合约部署及ERC20相关的概念，这里不展开讲，不熟悉的同学，可以参考我另一篇文章[创建自己的数字货币](https://learnblockchain.cn/2018/01/12/create_token/)。

只有就可以是使用 `contract` 对象来调用Token合约的函数。

## 获取Token余额及转移Token

### 获取Token余额

结合UI来实现以下获取Token余额，UI如下：

 ![](https://img.learnblockchain.cn/2018/15405195250777.jpg!wl)

在HTML里，定义的标签如下：

```html
    <tr>
      <th>TT Token:</th>
      <td>
          <input type="text" readonly="readonly" class="readonly" id="wallet-token-balance" value="0.0" /></div>
      </td>
    </tr>
```


对应的逻辑代码也很简单：

```js
     var tokenBalance = $('#wallet-token-balance');
     // 直接调用合约方法
    contract.balanceOf(activeWallet.address).then(function(balance){
        tokenBalance.val(balance);
    });
```

### 转移Token

转移Token的UI效果如下：

 ![](https://img.learnblockchain.cn/2018/15405195493994.jpg!wl)

界面的HTML代码如下：

```html
<h3>转移代币:</h3>
<table>
    <tr>
        <th>发送至:</th>
        <td><input type="text" placeholder="(target address)" id="wallet-token-send-target-address" /></td>
    </tr>
    <tr>
        <th>金额:</th>
        <td><input type="text" placeholder="(amount)" id="wallet-token-send-amount" /></td>
    </tr>
    <tr>
        <td> </td>
        <td>
            <div id="wallet-token-submit-send" class="submit disable">发送</div>
        </td>
    </tr>
</table>
```

上面定义了两个文本输入框及一个“发送“按钮，在逻辑处理部分，转移Token代币尽管和获取余额类似，同样是调用合约的方法，不过转移代币需要发起一个交易，因此需要测量gas 消耗。
点击发送时运行一下（关键）代码：

```js
var inputTargetAddress = $('#wallet-token-send-target-address');
var inputAmount = $('#wallet-token-send-amount');
var submit = $('#wallet-token-submit-send');

var targetAddress = ethers.utils.getAddress(inputTargetAddress.val());
var amount = inputAmount.val();

submit.click(function() {
// 先计算transfer 需要的gas 消耗量，这一步有默认值，非必须。
    contract.estimate.transfer(targetAddress, amount)
      .then(function(gas) {

          // 必须关联一个有过签名钱包对象
          let contractWithSigner = contract.connect(activeWallet);

          //  发起交易，前面2个参数是函数的参数，第3个是交易参数
          contractWithSigner.transfer(targetAddress, amount, {
              gasLimit: gas,
              // 偷懒，直接是用 2gwei
              gasPrice: ethers.utils.parseUnits("2", "gwei"),
            }).then(function(tx) {
                console.log(tx);
                // 介绍刷新上面的Token余额，重置输入框
            });  
      });
}
```

上述有一个地方都要注意一下，在合约调用 transfer 之前， 需要连接一个**signer**，因为发起交易的时候需要用它来进行签名，在ethers.js API里 Wallet 是 signer（抽象类）的实现类。

> 所有会更改区块链数据的函数都需要关联签名器，如果是视图函数则只需要连接provider。

ethers.js 的 Contract 提供了一个非常方便方法：`contract.estimate.functionName` 来计算预测交易的gasLimit。

在发起交易的时候，可以提供一个可选的[Overrides](https://docs.ethers.io/ethers.js/html/api-contract.html?highlight=estimate#overrides)参数，在这个参数里可以指定如交易的 gasLimit 、 gasPrice，如果我们不指定这个参数时，会默认使用 contract.estimate 获得的值作为 gasLimit，以及 provider.getGasPrice() 的值来指定 gasPrice。

哈哈，恭喜大家，到这里这里就完整的实现了一个基于以太坊去中心化网页钱包。

这是一条硬广，欢迎订阅[深入浅出区块链技术小专栏](https://xiaozhuanlan.com/blockchaincore)，目前仅需69元， 订阅就可以查看完整源码，还有其他惊喜哦~。
戳链接收看[详细的视频课程讲解](https://ke.qq.com/course/356068?tuin=bd898bbf)。

## 参考文档

1. [Ethers.js](https://docs.ethers.io/ethers.js/html)


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

[深入浅出区块链知识星球](https://learnblockchain.cn/images/zsxq.png)最专业技术问答社区，加入社区还可以在微信群里和300多位区块链技术爱好者一起交流。


