---
title: 如何开发一款以太坊（安卓）钱包系列1 - 通过助记词创建账号
permalink: eth_wallet_dev_1
un_reward: true
date: 2019-03-13 16:56:50
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - 以太坊
    - 助记词
    - web3j
author: Tiny熊
---

上周我们开源了[登链钱包](https://github.com/xilibi2003/Upchain-wallet)，反映很好，一周时间不到已经快到100 Star。接下来我会写把钱包核心要点写出来作为一个[以太坊钱包开发系列文章](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/)，对代码进行一个解读。

<!-- more -->
## 写在前面

本钱包是基于Android安卓平台开发，使用的是原生语言 Java 编写， 是基于Java 1.8 版本，其中使用了Java 1.8 中一些较新的语言特性，如 Lambda表达式等；另外还较多使用了[ReactiveX/RxAndroid](https://github.com/ReactiveX/RxAndroid/)响应式编程用法。

在本系列文章中，重点是介绍以太坊钱包账号、交易等逻辑，有时可能会假定读者已经了解[以太坊](https://wiki.learnblockchain.cn/ethereum/readme.html)及Android开发等相关知识，因为这些内容不是文章的重点，因此不会过多介绍，请海涵。


## 钱包包含的功能

通常一个钱包会包含以下功能：

- [x] 支持通过生成助记词、Keystore文件、私钥 创建钱包账号。
- [x] 支持导出钱包账号助记词、私钥、Keystore文件。
- [x] 支持多个钱包账号管理
- [x] 账户余额查询及转账功能（二维码扫描支持）。
- [x] 支持ERC20 代币（余额显示、转账、代币币价显示）
- [x] 支持用法币（美元和人民币）实时显示币价。
- [x] 历史交易列表显示

## 创建账号预备知识

我们先来介绍第一个功能：通过生成助记词、Keystore文件、私钥创建钱包账号。
本系列中，钱包都是指分层确定性钱包，（HD钱包 Hierarchical Deterministic Wallets）， 之前博客有一篇文章[分层钱包](https://learnblockchain.cn/2018/09/28/hdwallet/)进行了详细的介绍，还不熟悉的可以读一下。
为了保持本文的完整，这里做一个总结性回顾：以太坊及比特币的**地址是由随机生成的私钥经过椭圆曲线等算法单向推倒而来** ，BIP32及BIP44是为方便管理私钥提出的分层推倒方案，BIP39 定义助记词让分层种子的备份更方便。
而KeyStore文件是用来解密以太坊保存私钥的一种方式，大家可以阅读下[这篇文章: 账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)了解更多。

实现完成的，界面如下图：

![](https://img.learnblockchain.cn/2019/1551843006.png!wl)

这是一张导入钱包账号的截图（导入和创建，其实原理一样），界面仿照ImToken，不过本文将不会介绍UI部分的编写。

### Web3j & bitcoinj

为了完成创建账号功能，我们需要使用到两个库：[Web3j](https://github.com/web3j/web3j/) 和 [bitcoinj](https://github.com/bitcoinj/bitcoinj)

Web3是一套和以太坊通信的封装库，Web3j是Java版本的实现，例如发起交易和智能合约进行交互，下图很好的表达了其作用。
![](https://img.learnblockchain.cn/2019/15525530768209.jpg!wl)

不过本文中的功能，主要是使用了web3j中椭圆曲线加密及KeyStore文件的生成与解密。

bitcoinj 的功能和web3类似，它是比特币协议的Java实现，他实现了 BIP32、BIP44及BIP39 相关协议。


Android使用Gradle来构建，直接在`app/build.gradle`文件中加入： 
```
implementation 'org.web3j:core:4.1.0-android'
implementation 'org.bitcoinj:bitcoinj-core:0.14.7'
```

> 提示： 实践中遇到的一个问题，由于bitcoinj 中引入了 `com.lambdaworks:scrypt`加密库， 它包含的`lib/x86_64/darwin/libscrypt.dylib`文件，会导致在进行Android App Bundle 编译时会出现错误（好像也会导致某些机型没法安装），解决办法是在 build.gradle 加入一下语句，把这个文件在打包时排除掉。
    > packagingOptions {
    >     exclude 'lib/x86_64/darwin/libscrypt.dylib'
    > }

## 创建账号实现

### 通过助记词常见钱包账号

这是目前钱包客户端，最常见的一种为用户常见账号的方式，这里会包含一下几个核心步骤：
1. 生成一个随机数种子；
2. 通过随机数种子得到助记词；
3. 通过 种子 + 路径 派生生成私钥；
4. 使用KeyStore保存私钥；
5. 私钥推倒出账号地址。

大家可以在再次阅读[分层钱包](https://learnblockchain.cn/2018/09/28/hdwallet/)，理解为何这么做的原因。

理解了上面几点，那么代码就容易明白了，代码在[代码库](https://github.com/xilibi2003/Upchain-wallet)中的`app/src/pro/upchain/wallet/utils/ETHWalletUtils.java`中，关键代码逻辑如下：

```java
    // 创建钱包对象入口函数
    public static ETHWallet generateMnemonic(String walletName, String pwd) {
        String[] pathArray = "m/44'/60'/0'/0/0".split("/");

        long creationTimeSeconds = System.currentTimeMillis() / 1000;

        SecureRandom secureRandom = SecureRandomUtils.secureRandom();
        DeterministicSeed ds = new DeterministicSeed(secureRandom, 128, "", creationTimeSeconds);

        return generateWalletByMnemonic(walletName, ds, pathArray, pwd);
    }

    /**
     * @param walletName 钱包名称
     * @param ds         助记词加密种子
     * @param pathArray  助记词标准
     * @param pwd        密码
     * @return
     */
    @Nullable
    public static ETHWallet generateWalletByMnemonic(String walletName, DeterministicSeed ds,
                                                     String[] pathArray, String pwd) {
        //种子
        byte[] seedBytes = ds.getSeedBytes();
        //助记词
        List<String> mnemonic = ds.getMnemonicCode();

        if (seedBytes == null)
            return null;

        //  衍生推倒key
        DeterministicKey dkKey = HDKeyDerivation.createMasterPrivateKey(seedBytes);
        for (int i = 1; i < pathArray.length; i++) {
            ChildNumber childNumber;
            if (pathArray[i].endsWith("'")) {
                int number = Integer.parseInt(pathArray[i].substring(0,
                        pathArray[i].length() - 1));
                childNumber = new ChildNumber(number, true);
            } else {
                int number = Integer.parseInt(pathArray[i]);
                childNumber = new ChildNumber(number, false);
            }
            dkKey = HDKeyDerivation.deriveChildKey(dkKey, childNumber);
        }

        ECKeyPair keyPair = ECKeyPair.create(dkKey.getPrivKeyBytes());
        ETHWallet ethWallet = generateWallet(walletName, pwd, keyPair);
        if (ethWallet != null) {
            ethWallet.setMnemonic(convertMnemonicList(mnemonic));
        }
        return ethWallet;
    }

    //  通过椭圆曲线秘钥对创建钱包
        @Nullable
    private static ETHWallet generateWallet(String walletName, String pwd, ECKeyPair ecKeyPair) {
        WalletFile keyStoreFile;
        try {
            //最后两个参数： n 是 CPU/Memory 开销值，越高的开销值，计算就越困难。r 表示块大小，p 表示并行度
            keyStoreFile = Wallet.create(pwd, ecKeyPair, 1024, 1); // WalletUtils. .generateNewWalletFile();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        BigInteger publicKey = ecKeyPair.getPublicKey();
        String s = publicKey.toString();

        String wallet_dir = AppFilePath.Wallet_DIR;

        String keystorePath = "keystore_" + walletName + ".json";
        File destination = new File(wallet_dir, "keystore_" + walletName + ".json");

        //目录不存在则创建目录，创建不了则报错
        if (!createParentDir(destination)) {
            return null;
        }
        try {
            objectMapper.writeValue(destination, keyStoreFile);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        ETHWallet ethWallet = new ETHWallet();
        ethWallet.setName(walletName);
        ethWallet.setAddress(Keys.toChecksumAddress(keyStoreFile.getAddress()));
        ethWallet.setKeystorePath(destination.getAbsolutePath());
        ethWallet.setPassword(Md5Utils.md5(pwd));
        return ethWallet;
    }

```

上述代码中，`generateMnemonic()`是入口函数，最终返回的是一个ETHWallet 自定义的钱包实体类，一个实例就对应一个钱包，ETHWallet保存了钱包相关的属性，后面会详细介绍，如果对它序列化保存钱包账号及多个钱包账号管理。

## 几个注意事项

关于助记词及私钥的保存，有几点要**特别注意**，否则有可能和其他钱包无法兼容或导致私钥泄漏。


这部分作为订阅者福利，发表在我的[小专栏](https://xiaozhuanlan.com/blockchaincore)，趁还未涨价，赶紧订阅吧，超值的！

## 参考文档
* [web3j API 文档](https://docs.web3j.io/)
* [web3j GitHub](https://github.com/web3j)
* [bitcoinj 介绍及文档 ](https://bitcoinj.github.io/)

我创建了一个专门讨论钱包开发的微信群，加微信：xlbxiong 备注：钱包。

加入最专业的[区块链问答社区](https://learnblockchain.cn/images/zsxq.png)，和一群优秀的区块链从业者一起学习。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


<!--

## 几个注意事项
1. 创建钱包输入的密码，并不是用于生成种子，而是用来做keystore 加密的密码，这是业内的一个常规做法，尽管这个做法会降低一些安全性，但是不遵循行规，会导致和其他的钱包不兼容，及在其他钱包的助记词不能导入到我们钱包，或反之。
2. keystore 文件应该存储在内部存储沙盒类，即应用程序自身目录内，保证其他程序无法读取内容，万万不可存取在外部存储中，如SD卡。
3. 商业产品，应该检查手机时候root，如果root，则第2点的安全性无法保证。

 -->






