---
title: 如何开发一款以太坊（安卓）钱包系列2 - 导入账号及账号管理
permalink: eth-wallet-dev-2
date: 2019-03-18 11:27:50
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - 以太坊
author: Tiny熊
---

这是[如何开发一款以太坊安卓钱包系列](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/)第2篇，如何导入账号。有时用户可能已经有一个账号，这篇文章接来介绍下，如何实现导入用户已经存在的账号。

<!-- more -->


## 导入账号预备知识

从用户需求上来讲，导入用户已经存在的账号是有必要的。 不过从安全性考虑，当你之前使用的是一个非官方、非开源的钱包产品时（尤其是小众钱包），或者之前没有对私钥、助记词、Keysotre文件小心保存时。 
正确的做法是提示用户：
1. 在新的钱包重新创建一个钱包账号、并安全备份（因为之前的可能已经不安全）；
2. 然后在老钱包里把所有的币转移到新账号。

导入账号有3种方式：
1. 通过私钥导入
2. 通过KeyStore 导入
3. 通过助记词导入


## 通过私钥导入账号

关键是用用户输入的私钥创建一个椭圆曲线秘钥对，然后用这个秘钥对创建钱包，代码如下：
（代码在[代码库](https://github.com/xilibi2003/Upchain-wallet)中的`app/src/pro/upchain/wallet/utils/ETHWalletUtils.java`文件中）

```java
    public static ETHWallet loadWalletByPrivateKey(String privateKey, String pwd) {
        Credentials credentials = null;
        ECKeyPair ecKeyPair = ECKeyPair.create(Numeric.toBigInt(privateKey));
        return generateWallet(generateNewWalletName(), pwd, ecKeyPair);
    }
```

返回语句中的 generateWallet()，在[系列1-通过助记词创建账号](https://learnblockchain.cn/2019/03/13/eth_wallet_dev_1/) 已经介绍过，通过椭圆曲线秘钥对创建钱包。

loadWalletByPrivateKey()中第2个参数密码pwd，在私钥生成账号这个过程并不需要pwd，它是用来加密保存私钥，即为了生成keystore文件。


## 通过KeyStore文件导入账号

关于KeyStore文件，不了解的可以阅读下[账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)。

关键步骤：
1. KeyStore 文本内容解析WalletFile实例；
2. 使用密码 解码 WalletFile 生成椭圆曲线秘钥对创建钱包。

```java
    /**

     * @param keystore 原json文件内容
     * @param pwd      keystore解密密码
     * @return
     */
    public static ETHWallet loadWalletByKeystore(String keystore, String pwd) {
        try {
            WalletFile walletFile = null;
            walletFile = objectMapper.readValue(keystore, WalletFile.class);
            return generateWallet(generateNewWalletName(), pwd, Wallet.decrypt(pwd, walletFile));
        } catch (IOException e) {
        } catch (CipherException e) {
        }
        return null;
    }
```

## 通过助记词导入账号

导入和[上一篇](https://learnblockchain.cn/2019/03/13/eth_wallet_dev_1/)中，创建非常相似，不同的是，种子由用户提供的助记词生成。

使用助记词导入账号时，还需要用户选择（或输入）一个推倒路径(参考[BIP44](https://learnblockchain.cn/2018/09/28/hdwallet/))，关键步骤是：
1. 通过助记词创建随机数种子；
2. 通过 种子 + 路径 派生生成私钥 创建钱包 ；


```java

    /**
     * 通过导入助记词，导入钱包
     *
     * @param path bip44路径
     * @param list 助记词
     * @param pwd  密码
     * @return
     */
    public static ETHWallet importMnemonic(String path, String mnemonic, String pwd) {
        List<String>  list =  Arrays.asList(mnemonic.split(" "))；
        if (!path.startsWith("m") && !path.startsWith("M")) {
            //参数非法
            return null;
        }
        String[] pathArray = path.split("/");
        if (pathArray.length <= 1) {
            //内容不对
            return null;
        }
        String passphrase = "";
        long creationTimeSeconds = System.currentTimeMillis() / 1000;
        DeterministicSeed ds = new DeterministicSeed(list, null, passphrase, creationTimeSeconds);
        return generateWalletByMnemonic(generateNewWalletName(), ds, pathArray, pwd);
    }

```

generateWalletByMnemonic在[上一篇](https://learnblockchain.cn/2019/03/13/eth_wallet_dev_1/)中已经介绍过，

## 账号存储（保存到数据库）

很多同学肯定已经注意到， 不管通过什么方式构造的账号，都会最终构造为一个ETHWallet 钱包对象，他的定义如下：

```java
@Entity
public class ETHWallet {

    @Id(autoincrement = true)
    private Long id;

    public String address;
    private String name;
    private String password;   // 经过加密后的pwd
    private String keystorePath;  
    private String mnemonic;   
    private boolean isCurrent;   // 是否是当前选中的钱包
    private boolean isBackup;    // 是否备份过
}
```

前面构造的ETHWallet是只存在于内容之中， 在应用程序退出之后，这个数据将丢失， 因此我们需要把它序列化到
序列化数据库中存储起来，在下一次进入应用的时候加载数据库还原出账号。

### greenDAO



greenDAO 是一个将**对象映射到 SQLite 数据库**中的轻量且快速的 ORM 解决方案，以下是一个greenDAO的作用示意图：


![](https://img.learnblockchain.cn/2019/15529003884556.jpg!wl)


这里我们也使用了 greenDAO 来把ETHWallet对象映射到 SQLite 数据库， greenDAO的用法这里只简单说明，不详细阐述，大家可以跟随官方提供的[introduction](http://greenrobot.org/greendao/documentation/introduction/) 和 [how-to-get-started](http://greenrobot.org/greendao/documentation/how-to-get-started/)。

### 对象映射保存


把ETHWallet映射的到数据库，需要给类加上@Entity注解，这样greenDAO会生成几个类：`DaoMaster`、`DaoSession`及 `ETHWalletDao` 帮我们完成构建数据库表等操作。

在使用ETHWalletDao插入到数据库之前需要先进行一个初始化，通常初始化放在应用程序入口中进行，如：pro.upchain.wallet.UpChainWalletApp的onCreate()中执行，初始化代码如下：

```java
protected void init() {
    DaoMaster.DevOpenHelper mHelper = new DaoMaster.DevOpenHelper(this, "wallet", null);
    SQLiteDatabase db = mHelper.getWritableDatabase();
    DaoSession daoSession = new DaoMaster(db).newSession();
    ETHWalletDao ethWalletDao = daoSession.getETHWalletDao();
}
```


有了greenDAO为我们生成的辅助类，插入到数据库就很简单了，一行代码：

```
ethWalletDao.insert(ethWallet);  // 
```

ethWallet为ETHWallet实例， 前面不管是新创建还是导入的账号都会构造这样一个实例。

## 多账号管理

考虑到用户可能会创建多个账号，因此需要确定一个当前选定的账号，一般情况下，用户新创建的账号应该作为当前选中的的账号，同时其他账号应该取消选中， 我们完善下账号存储逻辑， 如下：
（代码在[代码库](https://github.com/xilibi2003/Upchain-wallet)中的`app/src/pro/upchain/wallet/utils/WalletDaoUtils.java`文件中）

```java

    /**
     * 插入新创建钱包
     *
     * @param ethWallet 钱
     */
    public static void insertNewWallet(ETHWallet ethWallet) {
        updateCurrent(-1);  // 取消其他站账号选中状态
        ethWallet.setCurrent(true);
        ethWalletDao.insert(ethWallet);
    }
    

    /**
     * 更新选中钱包
     *
     * @param id 钱包ID
     */
    public static ETHWallet updateCurrent(long id) {
    // 加载所有钱包账号
        List<ETHWallet> ethWallets = ethWalletDao.loadAll();
        ETHWallet currentWallet = null;
        for (ETHWallet ethwallet : ethWallets) {
            if (id != -1 && ethwallet.getId() == id) {
                ethwallet.setCurrent(true);
                currentWallet = ethwallet;
            } else {
                ethwallet.setCurrent(false);
            }
            ethWalletDao.update(ethwallet);
        }
        return currentWallet;
    }
```

## 打通账号创建与保存


以通过私钥导入账号进行保存为例，把创建账号和保存账号打通，这里我们使用响应式编程 ReactiveX，
这部分作为订阅者福利，发表在我的[小专栏](https://xiaozhuanlan.com/blockchaincore)，趁还未涨价，赶紧订阅吧，超值的！

[下一篇](https://learnblockchain.cn/2019/03/24/eth_wallet_dev_3/) 将继续介绍资产的显示。

## 学习资料

1. [RxAndroid](https://github.com/ReactiveX/RxAndroid/) 了解更多响应式编程
2. [introduction](http://greenrobot.org/greendao/documentation/introduction/) 和 [how-to-get-started](http://greenrobot.org/greendao/documentation/how-to-get-started/) 了解greenDAO。

我创建了一个专门讨论钱包开发的微信群，加微信：xlbxiong 备注：钱包。


加入[知识星球](https://learnblockchain.cn/images/zsxq.png)，和一群优秀的区块链从业者一起学习。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


<!--

（代码在[代码库](https://github.com/xilibi2003/Upchain-wallet)中的`app/src/pro/upchain/wallet/interact/CreateWalletInteract.java`中）


java
    public Single<ETHWallet> loadWalletByPrivateKey(final String privateKey, final String pwd) {
        return Single.fromCallable(() -> {
                    ETHWallet ethWallet = ETHWalletUtils.loadWalletByPrivateKey(privateKey, pwd);
                    if (ethWallet != null) {
                        WalletDaoUtils.insertNewWallet(ethWallet);
                    }
                    return ethWallet;
                }
        ).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread());

    }


这个方法使用响应式编程方法，返回了一个可订阅的Single<ETHWallet> 对象。

响应式编程 ReactiveX 提供了一个清晰、准确处理异步问题和事件的方法。RxJava是一个ReactiveX在JVM上的实现，在Android应用开发中使用RxJava 为[RxAndroid](https://github.com/ReactiveX/RxAndroid/)。

补充下为什么要用响应式编程方法，因为加解密及数据库（磁盘IO）操作都是耗时操作，不能放在主线程中执行（会造成UI卡顿）， 传统的做法是用`AsyncTask`在`doInBackground`执行耗时操作，而使用ReactiveX代码将简洁很多。

代码中使用`subscribeOn`指定被观察者在单独 的**io 子线程**运行（Schedulers.io()） ，`observeOn` 指定观察者运行在AndroidSchedulers.mainThread() 主线程（UI）线程，这样观察者在订阅收到ETHWallet对象后，就可以UI 展示等操作。

提示大家阅读本文时，最好把[代码库](https://github.com/xilibi2003/Upchain-wallet)克隆到本地对照阅读。
 -->

