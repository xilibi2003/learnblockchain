---
title:  一步步教你创建自己的数字货币（代币）进行ICO
permalink: create_token
date: 2018-01-12 22:36:39
categories: 
    - 以太坊
    - 智能合约
tags:
    - Token
    - 智能合约
    - ERC20
author: Tiny熊
---

本文从技术角度详细介绍如何基于以太坊ERC20创建代币的流程.

<!-- more -->

## 写在前面
本文所讲的代币是使用以太坊智能合约创建，阅读本文前，你应该对以太坊、智能合约有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

## 代币Token
如果不那么追求精确的定义，代币就是数字货币，比特币、以太币就是一个代币。
利用以太坊的智能合约可以轻松编写出属于自己的代币，代币可以代表任何可以交易的东西，如：积分、财产、证书等等。
因此不管是出于商业，还是学习很多人想创建一个自己的代币，先贴一个图看看创建的代币是什么样子。
![](https://img.learnblockchain.cn/2018/token_info.jpeg!wl)

今天我们就来详细讲一讲怎样创建一个这样的代币。

### ERC20 Token
也许你经常看到ERC20和代币一同出现， ERC20是以太坊定义的一个[代币标准](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md)。
要求我们在实现代币的时候必须要遵守的协议，如指定代币名称、总量、实现代币交易函数等，只有支持了协议才能被以太坊钱包支持。
其接口如下：

```js
contract ERC20Interface {

    string public constant name = "Token Name";
    string public constant symbol = "SYM";
    uint8 public constant decimals = 18;  // 18 is the most common number of decimal places

    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
```

简单说明一下：
name ：  代币名称
symbol： 代币符号
decimals： 代币小数点位数，代币的最小单位， 18表示我们可以拥有 .0000000000000000001单位个代币。
totalSupply() : 发行代币总量。
balanceOf(): 查看对应账号的代币余额。
transfer(): 实现代币交易，用于给用户发送代币（从我们的账户里）。
transferFrom():  实现代币用户之间的交易。
allowance(): 控制代币的交易，如可交易账号及资产。
approve():  允许用户可花费的代币数。


## 编写代币合约代码

代币合约代码：

```js
pragma solidity ^0.4.16;

interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }

contract TokenERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;  // 18 是建议的默认值
    uint256 public totalSupply;

    mapping (address => uint256) public balanceOf;  // 
    mapping (address => mapping (address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Burn(address indexed from, uint256 value);


    function TokenERC20(uint256 initialSupply, string tokenName, string tokenSymbol) public {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        name = tokenName;
        symbol = tokenSymbol;
    }


    function _transfer(address _from, address _to, uint _value) internal {
        require(_to != 0x0);
        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value > balanceOf[_to]);
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        Transfer(_from, _to, _value);
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= allowance[_from][msg.sender]);     // Check allowance
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public
        returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        return true;
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }

    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        Burn(msg.sender, _value);
        return true;
    }

    function burnFrom(address _from, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        totalSupply -= _value;
        Burn(_from, _value);
        return true;
    }
}
```
代码的详细解读，请订阅我的[小专栏](https://xiaozhuanlan.com/blockchaincore)。


## 部署
在开发测试智能合约时，[MetaMask](https://metamask.io/)和[Remix Solidity IDE](https://remix.ethereum.org)是两个非常好用的工具，今天就用他们来完成部署。

1. 安装和配置MetaMask请参考[开发、部署第一个去中心化应用](https://learnblockchain.cn/2018/01/12/first-dapp)，不同的上本文选择了以太坊的测试网络Ropsten，如果你没有余额请点击购买buy，进入的网站可以送一些测试以太币给你，配置好之后，界面应该如下：
![](https://img.learnblockchain.cn/2018/metamask_main.png!wl)

2. 浏览器打开Remix Solidity IDE，复制以上源码粘贴上，在右侧选项参考如图的设置：
![](https://img.learnblockchain.cn/2018/token_create_remix.jpeg!wl)
 注意Environment和Account和MetaMask保持一致，然后选择合约TokenERC20，填入你想要的发行量，名称及代号，就可以创建合约了。
 这时MetaMask会弹出一个交易确认框，点SUBMIT。待合约部署交易确认之后，复制合约地址。

3. 打开Metamask界面，切换到TOKENS，点添加合约，出现如下对话框：
![](https://img.learnblockchain.cn/2018/metamask_add_token.png!wl)
填入刚刚复制的地址，点ADD，这时你就可以看到你创建的代币了，如图：
![](https://img.learnblockchain.cn/2018/metamask_token_added.png!wl)

哈哈，你已经完成了代币的创建和部署(正式网络和测试网络部署方法一样)，可以在[Etherscan](https://ropsten.etherscan.io/token/0x1f0c085ad323bb69758111cf9ecdc32a32d9a5bb)查询到我们刚刚部署的代币。可以用它进行ICO了，从此走上人生巅峰（玩笑话，不鼓励大家发行无意义的代币）。

## 代币交易
由于MetaMask插件没有提供代币交易功能，同时考虑到很多人并没有以太坊钱包或是被以太坊钱包网络同步问题折磨，今天我用[网页钱包](https://www.myetherwallet.com)来讲解代币交易。
1. 进入[网页钱包地址](https://www.myetherwallet.com/#send-transaction), 第一次进入有一些安全提示需要用户确认。
2. 进入之后，按照下图进行设置：
![](https://img.learnblockchain.cn/2018/myetherwaller.jpeg!wl)
3. 连接上之后，如图
![](https://img.learnblockchain.cn/2018/myetherwaller_connected.jpeg!wl)
需要添加代币，填入代币合约地址。
4. 进行代币转账交易
![](https://img.learnblockchain.cn/2018/myetherwaller_transfer.jpeg!wl)
在接下来的交易确认也，点击确认即可。
5. 交易完成后，可以看到MetaMask中代币余额减少了，如图：
![](https://img.learnblockchain.cn/2018/metamask_token_tansfered.png!wl)

代币交易是不是很简单，只要明白了交易流程，使用其他的钱包也是一样的道理。

另外强烈安利几门视频课程给大家：
*  [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) - Solidity 语言面面俱到
* [通过代币（Token）学以太坊智能合约开发](https://ke.qq.com/course/317230) 代币开发So Easy
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


如果你在创建代币的过程中遇到问题，我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**可为大家解答问题，作为星球成员福利，成员还可加入区块链技术付费交流群。

## 参考文档

* [代币标准](https://theethereum.wiki/w/index.php/ERC20_Token_Standard)
* [Create your own crypto-currency with ethereum](https://ethereum.org/token)


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


