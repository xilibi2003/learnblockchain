---
title: 美链BEC合约漏洞技术分析
permalink: bec-overflow
date: 2018-04-25 10:13:07
categories: 
    - 以太坊
    - 智能合约
tags:
    - 智能合约
author: Tiny熊
---

这两天币圈链圈被美链BEC智能合约的漏洞导致代币价值几乎归零的事件刷遍朋友圈。这篇文章就来分析下BEC智能合约的漏洞

<!-- more -->
## 漏洞攻击交易

我们先来还原下攻击交易，这个交易可以在这个[链接](https://etherscan.io/tx/0xad89ff16fd1ebe3a0a7cf4ed282302c06626c1af33221ebe0d3a470aba4a660f)查询到。
我截图给大家看一下：
![](https://img.learnblockchain.cn/2018/BEC_transfer.jpg!wl)

攻击者向两个账号转移57896044618...000.792003956564819968个BEC，相当于BEC凭空进行了一个巨大的增发，几乎导致BEC价格瞬间归零。
下面我们来分析下这个攻击过程。

## 合约漏洞分析

我们先来看看[BEC智能合约的代码](https://etherscan.io/address/0xc5d105e63711398af9bbff092d4b6769c82f793d#code)，
BEC在合约中加入一个批量转账的函数，它的实现如下：

```js
function batchTransfer(address[] _receivers, uint256 _value) public whenNotPaused returns (bool) {
    uint cnt = _receivers.length;
    uint256 amount = uint256(cnt) * _value;
    require(cnt > 0 && cnt <= 20);
    require(_value > 0 && balances[msg.sender] >= amount);

    balances[msg.sender] = balances[msg.sender].sub(amount);
    for (uint i = 0; i < cnt; i++) {
        balances[_receivers[i]] = balances[_receivers[i]].add(_value);
        Transfer(msg.sender, _receivers[i], _value);
    }
    return true;
```

这个函数的作用是，调用者传入若干个地址和转账金额，在经过一些条件检查之后，对msg.sender的余额进行减操作，对每一个对每一个传入的地址进行加操作，以实现BEC的转移。
问题出在 `uint256 amount = uint256(cnt) * _value;` 这句代码，当传入值`_value`过大时（接近uint256的取值范围的最大值），`uint256 amount = uint256(cnt) * _value`计算时会发生溢出，导致amount实际的值是一个非常小的数（此时amount不再是`cnt * _value`的实际值），amount很小，也使得后面对调用者余额校验可正常通过（即`require(_value > 0 && balances[msg.sender] >= amount)`语句通过）。

我们来结合实际攻击交易使用的参数来分析一下：

![](https://img.learnblockchain.cn/2018/BEC_transfer_params.jpg!wl)

`batchTransfer`的参数`_value`值为16进制的`800000000000000000000...`，参数`_receivers`数组的大小为2，相乘之后刚好可超过uint256所能表示的整数大小上限，引发溢出问题`amount`实际的值为0，后面的转账操作实际上msg.sender的余额减0， 而对两个账号进行了加16进制的`800000000000000000000...`，最终的结果是相当于增发了2 * 16进制的`800000000000000000000...`。

实际上对于这种整数溢出漏洞，最简单的方法是采用 SafeMath 数学计算库来避免。有趣的是BEC智能合约代码中，其实其他的都使用了SafeMath， 而关键的`uint256 amount = uint256(cnt) * _value`却没有使用。
心痛程序员，也心痛韭菜。这句代码改为`uint256 amount = _value.mul(uint256(cnt));`就可以防止溢出问题

所以在做加减乘除的时候请记得一定使用：SafeMath，代码在[这里](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/math/SafeMath.sol)

##  溢出补充说明

溢出补充说明为小专栏订阅用户福利，小专栏的文章内介绍了什么时候会发生上溢，什么时候会发生下溢，并且给出了代码事例。
大家可请前往我的[小专栏](https://xiaozhuanlan.com/blockchaincore)阅读。


知识星球**[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)**做好的区块链技术问答社区，欢迎来提问，作为星球成员福利，成员可加入区块链技术付费交流群。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

<!--
Solidity最大可以处理256位数字, 最大值为 `2**256 - 1`, 对(`2**256 - 1`) 加1的结果会溢出归0。`2**255` 乘2也同样会溢出归0。
对无符号类型最小值是零，对零做减1会得到 (`2**256 - 1`)。

我们用一段代码验证一下：

```js
pragma solidity 0.4.20;
contract TestFlow {
    uint256 public zero = 0;
    uint256 public max = 2**256 - 1;
    uint256 public mm = 2**255;

    function subUnderFlow() public constant returns (uint) {
        uint256 a =  zero - 1;
        return a;
    }

    function addOverFlow() public constant returns (uint) {
        uint256 a =  max + 1;
        return a;
    }

    function mulOverFlow() public constant returns (uint) {
        uint256 a =  mm * 2;
        return a;
    }
}

```
合约部署和运行，之前已经经过很多次，我直接贴运行结果：
![](https://img.learnblockchain.cn/2018/BEC_transfer_flow.jpg!wl)

-->
