---
title: 如何通过以太坊智能合约来进行众筹（ICO）
date: 2018-02-08 20:30:42
categories: 
    - 以太坊
    - 智能合约
tags:
    - Token
    - 智能合约
author: Tiny熊
---

前面我们有两遍文章写了如何发行代币，今天我们讲一下如何使用代币来公开募资。

<!-- more -->

## 写在前面
本文所讲的代币是使用以太坊智能合约创建，阅读本文前，你应该对以太坊、智能合约有所了解，如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

## 众筹

一个正常的众筹是这样的：我一个非常好的想法，但是我没有钱来做这事，于是我把这个想法发给大家看，说：我做这件事需要5百万，大家有没有兴趣投些钱，如果大家在30天内投够了5百万我就开始做，到时大家都是原始股东，如果募资额不到5百万，大家投的钱就还给大家。

尽管现在很不幸，众筹已经被各种割韭菜的ICO玩坏了（不管有没有募到指定额，都把钱卷走），不过还是要讲：区块链非常适合解决众筹的信任问题，借助于智能合约，可以实现当募资额完成时，募资款自动打到指定账户，当募资额未完成时，自动退款。这个过程不需要看众筹这的人品，也不用依靠第三方信用担保。


## TOKENS、DAOS


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

    bool fundingGoalReached = false;  // 是否达标
    bool crowdsaleClosed = false;   // 售卖是否结束

    /**
    * 事件可以用来记录信息，每次调用事件方法时都能将相关信息存入区块链中
    * 可以用作凭证，也可以在你的 Dapp 中查询使用这些数据
    **/
    event GoalReached(address recipient, uint totalAmountRaised);
    event FundTransfer(address backer, uint amount, bool isContribution);

    /**
     * Constrctor function
     *
     * Setup the owner
     */
    function Crowdsale(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint durationInMinutes,
        uint etherCostOfEachToken,
        address addressOfTokenUsedAsReward
    ) {
        beneficiary = ifSuccessfulSendTo;
        fundingGoal = fundingGoalInEthers * 1 ether;
        deadline = now + durationInMinutes * 1 minutes;
        price = etherCostOfEachToken * 1 ether;
        tokenReward = token(addressOfTokenUsedAsReward);   // 传入已发布的 token 合约的地址来创建实例
    }

    /**
     * Fallback function
     * 向合约付款时调用的方法
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
    * modifier 函数修改器（作用和Python的装饰器很相似）
    * 用于在函数执行前检查某种前置条件（判断通过之后才会继续执行该方法）
    * _ 表示继续执行之后的代码
    **/
    modifier afterDeadline() { if (now >= deadline) _; }

    /**
     * Check if goal was reached
     *
     * Checks if the goal or time limit has been reached and ends the campaign
     */
    function checkGoalReached() afterDeadline {
        if (amountRaised >= fundingGoal){
            fundingGoalReached = true;
            GoalReached(beneficiary, amountRaised);
        }
        crowdsaleClosed = true;
    }


    /**
     * Withdraw the funds
     *
     * Checks to see if goal or time limit has been reached, and if so, and the funding goal was reached,
     * sends the entire amount to the beneficiary. If goal was not reached, each contributor can withdraw
     * the amount they contributed.
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


接下来就看看如何实现一个众筹智能合约。




[](https://www.ethereum.org/crowdsale)