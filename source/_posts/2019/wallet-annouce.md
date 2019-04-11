---
title: 登链钱包-一款功能强大的完全开源以太坊钱包
permalink: wallet-annouce
date: 2019-03-07 10:34:57
categories:
    - 以太坊
tags:
    - 以太坊
    - 钱包
author: Tiny熊
---

你是否和我前段时间一样，苦苦的寻找一款好用的开源以太坊钱包，你会发现可用都很少，因为很多钱包说开源，仅仅是开源部分代码，现在不需要再找了。

重要的事情说三遍：
这是一个款**完全开源**，**完全免费**，功能强大**支持DApp浏览器功能**的钱包；
这是一个款**完全开源**，**完全免费**，功能强大**支持DApp浏览器功能**的钱包；
这是一个款**完全开源**，**完全免费**，功能强大**支持DApp浏览器功能**的钱包。

再也不用傻乎乎找人开发以太坊钱包了， 直接拿去用吧；再也不用担心私钥会被上传到别人的服务器上。

<!-- more -->

## 写在前面

区块链是开放的，很难想象一个封闭的项目如何产生信任，开源一直是区块链社区所倡导的行为准则。
我们也希望开源能够降低行业的开发门槛，吸引更多的开发者和公司能够利用我们的代码，找到更多落地的应用场景，一起来推动行业的发展。
同时我们也相信开源可以是产品更加的安全，我们也邀请专业的区块链安全团队[零时科技](https://www.noneage.com/)来为钱包做安全审计。


## 效果演示

先来看看钱包长什么样吧，我制作了一个gif图片：

<p align="center">
  <img src="https://img.learnblockchain.cn/2019/upchainwallet.gif" width="450">
</p>

19年4月更新：加入 **DApp 浏览器** 功能

<p align="center">
  <img src="https://img.learnblockchain.cn/2019/dapp.gif" width="450">
</p>

DApp 浏览器，目前暂未开源，需要请加微信：xlbxiong。


Gif 图片比较简陋，见谅见谅，可以看的出来界面参考了现在的主流钱包，感谢imToken及[ETHWallet](https://github.com/DwyaneQ/ETHWallet)，

大家可以戳[链接](https://img.learnblockchain.cn/apk/upchain_wallet.apk)下载APK体验，
Google play 也已经上架，[链接](https://play.google.com/store/apps/details?id=pro.upchain.ethwallet)

## 功能介绍

目前版本支持一下功能：

- [x] 支持通过生成助记词、Keystore文件、私钥 创建钱包账号；
- [x] 支持导出钱包账号助记词、私钥、Keystore文件；
- [x] 账户余额查询及转账功能；
- [x] 支持多个钱包账号管理；
- [x] 支持ERC20 代币（余额显示、转账、代币币价显示）；
- [x] 历史交易列表显示；
- [x] 支持DApp Browser 浏览器 
- [x] 二维码扫描，兼容imToken格式；
- [x] 支持用法币（美元和人民币）实时显示币价；
- [x] 支持以太坊官方测试网络（Infura Koven及Ropsten）及本地测试网络。

功能够全面吧，尤其是最后一个功能支持以太坊官方测试网络（Infura Koven及Ropsten）及本地测试网络，估计是开发者的最爱，做为开发者的我，懂你们的痛（可以获取到免费的以太币用于测试）。

[代码的讲解](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/)和相应的课程，我们后面会陆续放出，在还没有放出之前，先提醒大家几个注意的点：
1. 使用本地网络测试的时候注意Geth 或 Ganache 设置下可接收RPC连接的地址，因为默认情况下只支持本地连接，这样手机上就无法连接。
2. 显示交易记录功能需要自己搭建一个服务器提供API接口，这个接口来自TrustWallet，为了和本应用保持版本一致，我Fork了一份，地址为[trust-ray](https://github.com/xilibi2003/trust-ray)，这个库会解析区块，并把交易信息存到MongoDb数据库里，然后用API提供给客户端使用。
3. 实时币价的显示其实也是使用trust-ray提供的接口，trust-ray 使用的是[CoinMarketCap](https://coinmarketcap.com/)的数据，目前使用的是CoinMarketCap免费提供的数据，CoinMarketCap现在有一套新的付费接口，免费的数据可能在将来会停用，到时需要使用CoinMarketCap 的apikey来访问。
4. 代码中ERC20_Contract目录提供了一个ERC20合约给大家部署测试Token功能。


其他的代码介绍及环境搭建大家就只有等我的文章了，大家也可以学习[网页钱包开发课程](https://ke.qq.com/course/356068?tuin=bd898bbf)，课程详细介绍了开发钱包必备的理论知识。



有什么需要的功能，可以提issue或加我微信留言。

对了本项目的GitHub地址为：[Upchain-wallet](https://github.com/xilibi2003/Upchain-wallet),  点 Star 的同学都会发大财，哈哈哈~~~  

## 参考的开源项目

本钱包在开发是站在巨人的肩膀上完成，特别感谢以下项目：

* [web3j](https://docs.web3j.io/index.html)
* [bitcoinj](https://bitcoinj.github.io/javadoc/0.14.7/)
* [Trust-wallet](https://github.com/TrustWallet/trust-wallet-android-source)
* [ETHWallet](https://github.com/DwyaneQ/ETHWallet)
* [BGAQRCode](https://github.com/bingoogolapple/BGAQRCode-Android)
* [Trust-ray](https://github.com/TrustWallet/trust-ray)


## 再啰嗦几句

本次开源也是受到区块链社区的影响，尤其是HiBlock区块链社区一些朋友坚持布道和开源的精神影响。
> HiBlock区块链社区 是国内最大的区块链开发者社区，社区已经聚集了数千名区块链开发者。

登链钱包是由登链学院出品，希望大家知道[登链学院](https://upchain.ke.qq.com)不单出品优质课程，我们也为行业发展贡献一份力量，感谢大家转发。

想要加入开源钱包讨论群的的朋友，加微信：xlbxiong  备注：钱包

PS: 我们提供专业的钱包定制开发，欢迎咨询微信：xlbxiong 备注：定制开发

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


