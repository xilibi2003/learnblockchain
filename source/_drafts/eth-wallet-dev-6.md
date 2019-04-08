---
title: 如何开发一款以太坊安卓钱包系列6 - 获取交易列表 
permalink: eth-wallet-dev-6
un_reward: true
date: 2019-03-27 22:34:40
categories:
tags:
author:
---


首先需要明确一点，以太坊官方的节点服务是不提供获取某一个地址的所有历史交易的。



## 第三方服务

Etherscan

API 

https://api-ropsten.etherscan.io/
https://api-kovan.etherscan.io/
https://api-rinkeby.etherscan.io



http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken

https://etherscan.io/apis#accounts

api?module=account&action=txlist&address=



http://api.etherscan.io/api?module=account&action=tokentx&address=0x4e83362442b8d1bec281594cea3050c8eb01311c&startblock=0&endblock=999999999&sort=asc&apikey=YourApiKeyToken


后台  
node.js
https://github.com/sebs/etherscan-api

https://sebs.github.io/etherscan-api/#txlist



## 区块解析逻辑




## 搭建区块解析服务器



## 

