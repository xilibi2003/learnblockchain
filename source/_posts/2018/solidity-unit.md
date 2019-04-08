---
title: 智能合约语言 Solidity 教程系列7 - 以太单位及时间单位
permalink: solidity-unit
date: 2018-02-02 19:51:03
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

这是Solidity教程系列文章第7篇介绍以太单位及时间单位，系列带你全面深入理解Solidity语言。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->
## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。

## 货币单位（Ether Units）

一个数字常量（字面量）后面跟随一个后缀**wei**, **finney**,**szabo**或**ether**，这个后缀就是货币单位。不同的单位可以转换。不含任何后缀的默认单位是wei。
不同的以太币单位转换关系如下：
* 1 ether == 10^3 finney == 1000 finney
* 1 ether == 10^6 szabo
* 1 ether == 10^18 wei

> 插曲：以太币单位其实是密码学家的名字，是以太坊创始人为了纪念他们在数字货币的领域的贡献。他们分别是：
> wei:  Wei Dai  戴伟 密码学家 ，发表 B-money
> finney: Hal Finney   芬尼  密码学家、工作量证明机制（POW）提出
> szabo:  Nick Szabo  尼克萨博  密码学家、智能合约的提出者

我们可以使用一下代码验证一个转换关系：
```js
pragma solidity ^0.4.16;

contract testUnit {
    function tf() public pure returns (bool) {
      if (1 ether == 1000 finney){
          return true;
      }
      return false;
    }
    
    function ts() public pure returns (bool) {
      if (1 ether == 1000000 szabo){
          return true;
      }
      return false;
    }
    
    function tgw() public pure returns (bool) {
      if (1 ether == 1000000000000000000 wei){
          return true;
      }
      return false;
    }
}
```



## 时间单位（Time Units）
时间单位: seconds, minutes, hours, days, weeks, years均可做为后缀，并进行相互转换，规则如下：
* 1 == 1 seconds (默认是seconds为单位)
* 1 minutes == 60 seconds
* 1 hours == 60 minutes
* 1 days == 24 hours
* 1 weeks = 7 days
* 1 years = 365 days


使用这些单位进行日期计算需要特别小心，因为不是每年都是365天，且并不是每天都有24小时，因为还有闰秒。由于无法预测闰秒，必须由外部的预言（oracle）来更新从而得到一个精确的日历库。

这些后缀不能用于变量。如果想对输入的变量说明其不同的单位，可以使用下面的方式：
```js
pragma solidity ^0.4.16;

contract testTUnit {

    function currTimeInSeconds() public pure returns (uint256){
        return now;
    }

    function f(uint start, uint daysAfter) public {
        if (now >= start + daysAfter * 1 days) {
        // ...
        }
    }
}

```

强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

## 参考文档
* [units](https://solidity.readthedocs.io/en/develop/units-and-global-variables.html#units-and-globally-available-variables)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果想与我有更密切的交流可以选择加入我的[知识星球](https://learnblockchain.cn/images/zsxq.png)（星球成员可加入微信技术交流群）


