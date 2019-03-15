---
title: 如何开发一款以太坊（安卓）钱包 - 通过助记词创建账号
permalink: eth_wallet_dev_1
un_reward: true
date: 2019-03-14 16:56:50
categories: 以太坊
tags:
    - 钱包
    - 以太坊
    - 助记词
author: Tiny熊
---

上周我开源了一款[钱包](https://github.com/xilibi2003/Upchain-wallet)，反映很好，一周时间不到已经快到100 Star。接下来我会几篇系列文章把开发以太坊钱包的核心要点写出来，也算是对代码的一个解读。

<!-- more -->
## 写在前面

钱包是使用Android安卓平台编写，使用的是原生代码Java 语言编写， 是基于Java 1.8 版本，也使用了Java 1.8 中一些较新的语言特性，如 Lambda表达式等；另外还较多使用了[ReactiveX/RxAndroid](https://github.com/ReactiveX/RxAndroid/)响应式编程用法。

在本系列文章中，重点是介绍以太坊钱包账号、交易等逻辑，有时可能会假定读者已经了解Android开发等相关知识，因为这些内容不是文章的重点，因此不会过多介绍，请海涵。



### 钱包账号对象序列化


```
@Entity
public class ETHWallet {

    @Id(autoincrement = true)
    private Long id;

    public String address;
    private String name;
    private String password;
    private String keystorePath;
    private String mnemonic;
    private boolean isCurrent;
    private boolean isBackup;
}
```

通过ETHWallet来把各个字段保存起来， 


org.web3j:core


## 注意事项
##  私钥的安全性

不可root

编译问题





## 参考文档

* [web3j API 文档](https://docs.web3j.io/)
* [bitcoinj 介绍及文档 ](https://bitcoinj.github.io/)



- [x] 贴心的以太坊测试网络（Infura Koven及Ropsten）及本地测试网络 支持



 支持通过生成助记词、Keystore文件、私钥 创建钱包账号。
 支持导出钱包账号助记词、私钥、Keystore文件。
 支持多个钱包账号管理


 org.web3j:core:4.1.0-android

 org.bitcoinj:bitcoinj-core:0.14.7









