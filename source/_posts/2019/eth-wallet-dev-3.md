---
title: 如何开发一款以太坊安卓钱包系列3 - 资产信息展示
permalink: eth_wallet_dev_3
un_reward: false
date: 2019-03-24 21:59:44
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - 以太坊
    - web3j
author: Tiny熊
---


这是[如何开发以太坊安卓钱包系列](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/)第3篇， 钱包账号资产信息展示，展示信息主要包括账号地址、eth余额及该账号所拥有的Token及余额。


<!-- more -->

## 预备知识 MVVM

本文会涉及和UI界面的交互，提前理解下界面和数据如何交互是非常有必要的，如果你已经很熟悉MVVM，可跳过这一小节。

最早写Android的时候，数据和界面经常耦合在一起，一个Activity文件总是特别大，每当产品界面改版就非常痛苦，吐槽下，很多产品经理都喜欢对界面改来改去。

后来Google 推荐多个架构模式： MPV、 MVVM模式来解决数据和UI耦合的问题，[登链钱包代码](https://github.com/xilibi2003/Upchain-wallet)，使用的就是MVVM模式，所以对它做一个简单介绍，下面是MVVM的视图和数据的交互图：

![](https://img.learnblockchain.cn/2019/15532408840119.jpg!wl)

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

![上图](https://img.learnblockchain.cn/2019/15532473043633.jpg!wl)
> 这个界面应的是[登链钱包](https://github.com/xilibi2003/Upchain-wallet)的`PropertyFragment`，上图的UPT 是我自己发行的Token，所以没有显示价格


现在我们来**思考**一下， 怎么来展现上面的数据， 别着急往下看， 可以先想想。

先对问题做一个拆分，把数据拆分为4个部分：

1. 显示当前选中的账号
2. 显示当前账号 ETH 余额
3. 显示当前账号下 Token 数量
4. 显示对应的法币金额。

为了避免 UI 与上面4个数据的耦合，代码使用了一个`TokensViewModel`， 获取到的数据用 LiveData做了一个Wrap，以便UI可以订阅数据，TokensViewModel类像下面，[代码](https://github.com/xilibi2003/Upchain-wallet)有删减：

```java 
public class TokensViewModel extends ViewModel {
    private final MutableLiveData<ETHWallet> defaultWallet;
    private final MutableLiveData<NetworkInfo> defaultNetwork;

    private final MutableLiveData<Token[]> tokens;
    private final MutableLiveData<Ticker> prices;
}

```

`MutableLiveData`  是前面提到的 LiveData的子类，在UI界面中就可以对数据进行订阅，下面我们逐一拆解下每个数据。


### 显示当前账号

可以分为两个步骤： 
1. 从数据库中读取账号；
2. 界面显示账号


TokensViewModel中定义了一个`MutableLiveData<ETHWallet> defaultWallet` ，从数据库中读取账号会保存在defaultWallet中，然后UI对 defaultWallet 进行观察显示。

> 注解: [登链钱包](https://github.com/xilibi2003/Upchain-wallet) 里大量使用的这个方式，通过一个LiveData 做数据桥接。

在上一篇[导入账号及账号管理](https://learnblockchain.cn/2019/03/18/eth-wallet-dev-2/)，所有的账号使用greenDao 存储起来， 因此我们只需要把所有账号从加载出来，挑选出当前选中的那一个。 结合代码看一看：


```java
// WalletDaoUtils.java
    public static ETHWallet getCurrent() {
        List<ETHWallet> ethWallets = ethWalletDao.loadAll();
        for (ETHWallet ethwallet : ethWallets) {
            if (ethwallet.isCurrent()) {
                ethwallet.setCurrent(true);
                return ethwallet;
            }
        }
        return null;
    }
```
上面代码先用 `ETHWalletDao.loadAll` 加载出所有的账号，返回当前选中的，上面的代码会被`FetchWalletInteract` 类的 `findDefault`方法调用，在ViewModle里，很多时候以数据进行交互的类，我们会命名为 `xxxInteract`，这也是一个习惯用法。

其代码如下：

```java 
   // FetchWalletInteract.java
   // 返回一个可订阅的Single<ETHWallet> 对象
   public Single<ETHWallet> findDefault() {
        return Single.fromCallable(() -> {
            return WalletDaoUtils.getCurrent();
        }).subscribe(this::onDefaultWallet);
    } 

    // 获取到默认钱包账号 设置到 defaultWallet 这个LiveData
    private void onDefaultWallet(ETHWallet wallet) {
        defaultWallet.setValue(wallet);
    }
```

`findDefault()`返回一个可订阅的[Single](https://mcxiaoke.gitbooks.io/rxdocs/content/Single.html)<ETHWallet> 对象，如果不熟悉可参考后面的文档。

之后，在UI界面` PropertyFragment.java` 中， 就可以对 `defaultWallet` 进行订阅：

```java
tokensViewModel.defaultWallet().observe(this,  this::showWallet);
```

当获取到默认账号时，就会回调`showWallet`:

```
// UI 显示
    public void showWallet(ETHWallet wallet) {
        tvWalletName.setText(wallet.getName());
        tvWalletAddress.setText(wallet.getAddress());

    }
```

这样， 界面的显示就完成了，[下一篇](https://learnblockchain.cn/2019/03/26/eth_wallet_dev_4/)继续介绍获取余额。



## 参考文档

1. [lifecycle官方文档地址](https://developer.android.com/topic/libraries/architecture/lifecycle)
2. [RxAndroid](https://github.com/ReactiveX/RxAndroid/) 了解更多响应式编程


我创建了一个专门讨论钱包开发的微信群，加微信：xlbxiong 备注：钱包。


加入[知识星球](https://learnblockchain.cn/images/zsxq.png)，和一群优秀的区块链从业者一起学习。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，学区块链的都在这里，打造最好的区块链技术博客。

