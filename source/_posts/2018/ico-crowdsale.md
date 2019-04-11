---
title: 如何通过以太坊智能合约来进行众筹（ICO）
permalink: ico-crowdsale
date: 2018-02-28 20:30:42
categories: 
    - 以太坊
    - 智能合约
tags:
    - Token
    - ICO
    - 智能合约
    - ERC20
author: Tiny熊
---

前面我们有两遍文章写了如何发行代币，今天我们讲一下如何使用代币来公开募资，即编写一个募资合约。

<!-- more -->

## 写在前面
本文所讲的代币是使用以太坊智能合约创建，阅读本文前，你应该对以太坊、智能合约有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

## 众筹
先简单说下众筹的概念：一般是这样的，我一个非常好的想法，但是我没有钱来做这事，于是我把这个想法发给大家看，说：我做这件事需要5百万，大家有没有兴趣投些钱，如果大家在30天内投够了5百万我就开始做，到时大家都是原始股东，如果募资额不到5百万，大家投的钱就还给大家。

现在ICO众筹已经被各路大佬拿来割韭菜而被玩坏了（不管有无达标，都把钱卷走）。

其实区块链技术本事非常适合解决众筹的信任问题，借助于智能合约，可以实现当募资额完成时，募资款自动打到指定账户，当募资额未完成时，可退款。这个过程不需要看众筹大佬的人品，不用依靠第三方平台信用担保。


## 代币
传统的众筹在参与之后通常不容易交易（参与之后无法转给其他人），而通过用代币来参与众筹，则很容易进行交易，众筹的参与人可随时进行买卖，待众筹项目实施完成的时候，完全根据代币持有量进行回馈。

举个例子说明下，大家会更容易理解，有这一个众筹：A有技术做一个能监测健康的指环，为此向公众募资200百万，募资时100块对应一个代币，约定在指环上市之后，代币的持有人可以用一个代币来兑换一个指环。而指环的研发周期是一年，因此在指环还未上市的一年里，众筹的参与人可以随时交易所持有的代币。


## 众筹智能合约代码
接下来就看看如何实现一个众筹智能合约。

```js

pragma solidity ^0.4.16;

interface token {
    function transfer(address receiver, uint amount);
}

contract Crowdsale {
    address public beneficiary;  // 募资成功后的收款方
    uint public fundingGoal;   // 募资额度
    uint public amountRaised;   // 参与数量
    uint public deadline;      // 募资截止期

    uint public price;    //  token 与以太坊的汇率 , token卖多少钱
    token public tokenReward;   // 要卖的token

    mapping(address => uint256) public balanceOf;

    bool fundingGoalReached = false;  // 众筹是否达到目标
    bool crowdsaleClosed = false;   //  众筹是否结束

    /**
    * 事件可以用来跟踪信息
    **/
    event GoalReached(address recipient, uint totalAmountRaised);
    event FundTransfer(address backer, uint amount, bool isContribution);

    /**
     * 构造函数, 设置相关属性
     */
    function Crowdsale(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint durationInMinutes,
        uint finneyCostOfEachToken,
        address addressOfTokenUsedAsReward) {
            beneficiary = ifSuccessfulSendTo;
            fundingGoal = fundingGoalInEthers * 1 ether;
            deadline = now + durationInMinutes * 1 minutes;
            price = finneyCostOfEachToken * 1 finney;
            tokenReward = token(addressOfTokenUsedAsReward);   // 传入已发布的 token 合约的地址来创建实例
    }

    /**
     * 无函数名的Fallback函数，
     * 在向合约转账时，这个函数会被调用
     */
    function () payable {
        require(!crowdsaleClosed);
        uint amount = msg.value;
        balanceOf[msg.sender] += amount;
        amountRaised += amount;
        tokenReward.transfer(msg.sender, amount / price);
        FundTransfer(msg.sender, amount, true);
    }

    /**
    *  定义函数修改器modifier（作用和Python的装饰器很相似）
    * 用于在函数执行前检查某种前置条件（判断通过之后才会继续执行该方法）
    * _ 表示继续执行之后的代码
    **/
    modifier afterDeadline() { if (now >= deadline) _; }

    /**
     * 判断众筹是否完成融资目标， 这个方法使用了afterDeadline函数修改器
     *
     */
    function checkGoalReached() afterDeadline {
        if (amountRaised >= fundingGoal) {
            fundingGoalReached = true;
            GoalReached(beneficiary, amountRaised);
        }
        crowdsaleClosed = true;
    }


    /**
     * 完成融资目标时，融资款发送到收款方
     * 未完成融资目标时，执行退款
     *
     */
    function safeWithdrawal() afterDeadline {
        if (!fundingGoalReached) {
            uint amount = balanceOf[msg.sender];
            balanceOf[msg.sender] = 0;
            if (amount > 0) {
                if (msg.sender.send(amount)) {
                    FundTransfer(msg.sender, amount, false);
                } else {
                    balanceOf[msg.sender] = amount;
                }
            }
        }

        if (fundingGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountRaised)) {
                FundTransfer(beneficiary, amountRaised, false);
            } else {
                //If we fail to send the funds to beneficiary, unlock funders balance
                fundingGoalReached = false;
            }
        }
    }
}
```

## 部署及说明
在部署这个合约之前，我们需要先部署一个代币合约，请参考[一步步教你创建自己的数字货币](https://learnblockchain.cn/2018/01/12/create_token/)。

1. 创建众筹合约我们需要提供一下几个参数：
ifSuccessfulSendTo： 募资成功后的收款方（其实这里可以默认为合约创建者）
fundingGoalInEthers： 募资额度， 为了方便我们仅募3个ether
durationInMinutes： 募资时间
finneyCostOfEachToken 每个代币的价格, 这里为了方便使用了[单位finney](https://learnblockchain.cn/2018/02/02/solidity-unit/)及值为：1 （1 ether =  1000 finney）
addressOfTokenUsedAsReward： 代币合约地址。
如：
![](https://img.learnblockchain.cn/2018/crowdsale_create.jpeg!wl)
本文使用的参数为：
```
"0xc6f9ea59d424733e8e1902c7837ea75e20abfb49",3, 100, 1,"0xad8972e2b583f580fc52f737b98327eb65d08f8c"
```

2. 参与人投资的时候实际购买众筹合约代币，所以需要先向合约预存代币，代币的数量为：募资额度 / 代币的价格 ， 这里为：3 * 1000/1 = 3000 （当能也可以大于3000）。
向合约预存代币可以使用[myetherwallet](https://www.myetherwallet.com/#send-transaction)钱包，或在remix中重新加载代币合约，执行代币合约tranfer()函数进行代币转账，转账的地址就是我们创建合约的地址。如使用myetherwallet转账如图：
![](https://img.learnblockchain.cn/2018/crowdsale_send_token.jpeg!wl)

3. 投资人向众筹合约转账（发送以太币）即是参与众筹行为，转账时，会执行Fallback回退函数（即无名函数）向其账户打回相应的代币。

4. safeWithdrawl() 可以被参与人或收益人调用，如果融资不达标参与人可收回之前投资款，如果融资达标收益人可以拿到所有的融资款。

## 扩展

上面是一个很正规的募资合约。接下来讲两个募资合约的扩展，如何实现无限募资合约及割韭菜合约。
这部分内容独家发布在我的小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)


另外安利几门视频课程给大家：
1. [通过代币（Token）学以太坊智能合约开发](https://ke.qq.com/course/317230) 
2. [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528) 
3. [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


如果你在学习中遇到问题，欢迎到我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**提问，作为星球成员福利，成员可加入区块链技术付费交流群。

## 参考文档
* [Create a crowdsale](https://ethereum.org/crowdsale)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


