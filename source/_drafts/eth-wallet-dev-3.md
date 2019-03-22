---
title: 如何开发一款以太坊（安卓）钱包系列3 - 钱包账号资产信息展示
permalink: eth_wallet_dev_3
un_reward: true
date: 2019-03-21 21:59:44
categories: 以太坊
tags:
    - 钱包
    - 以太坊
author: Tiny熊
---


这是如何开发以太坊（安卓）钱包系列第3篇， 钱包账号资产信息展示，展示信息主要包括账号地址、eth余额及该账号所拥有的Token及余额。


<!-- more -->

## 预备知识 MVVM

本文会涉及和UI界面的交互，提前理解下界面和数据如何交互是非常有必要的，如果你已经很熟悉MVVM，可跳过这一小节。

最早写Android的时候，数据和界面经常耦合在一起，一个Activity文件总是特别大，每当产品界面改版就非常痛苦，吐槽下，很多产品经理都喜欢对界面改来改去。

后来Google 推荐多个架构模式： MPV、 MVVM模式来解决数据和UI耦合的问题，[登链钱包代码](https://github.com/xilibi2003/Upchain-wallet)，使用的就是MVVM模式，所以对它做一个简单介绍，下面是MVVM的视图和数据的交互图：

![](images/15532408840119.jpg)

View 通常对应于Activity/Fragment/自定义View
Model：则是和数据相关的模块。

View 与 Model 不直接发生联系， 而是通过ViewModel负责接收View层的事件以及获取并处理数据，ViewModel层的数据变化也会通知给View层进行相应的UI的更新，从而实现业务逻辑和Ui的隔离。


使用MVVM模式最大的优点就是**解耦**， 因为数据处理逻辑是独立于View, 在UI更改时，ViewModel 不用做太多改动。

我们使用了Google在I/O大会推出的一套遵循MVVM开发模式的**LiveData和ViewModel**组件架构。

### ViewModel 和 LiveData

ViewModel 会关注UI生命周期来存储和管理数据，在Activity发生变化（锁屏开屏、旋转）时，ViewModel 会自动保留之前的数据并给新的Activity或Fragment使用，当界面被系统销毁时，ViewModel也会进行资源清理，避免内存泄漏。

ViewModel 还可以用于不同界面间数据共享。

LiveData是一个可观察的数据持有者类。观察者可以方便我们以**异步的方式获取数据**，同时LiveData也是有生命周期感知的。如果其生命周期处于STARTED或RESUMED状态。LiveData会将观察者视为活动状态，并通知其数据的变化。LiveData未注册的观察对象以及非活动观察者是不会收到有关更新的通知。

了解更多，可自行以关键字： Lifecycle、ViewModel、LiveData 进行搜索。
 

## 账号信息展示

展示信息主要包括账号地址、eth余额及该账号所拥有的Token及余额， 其界面效果如下:

![](images/15532473043633.jpg)
（上图的UPT 是我自己发行的Token，所以没有显示价格）




步骤：
1. 获取当前选中的账号
2. 获取当前选中的网络
3. 构招






https://github.com/xilibi2003/Upchain-wallet



```java
    private BigDecimal getEthBalance(String walletAddress) throws Exception {


        return new BigDecimal(web3j
                .ethGetBalance(walletAddress, DefaultBlockParameterName.LATEST)
                .send()
                .getBalance());
    }
```





lifecycle官方文档地址：

https://developer.android.com/topic/libraries/architecture/lifecycle


