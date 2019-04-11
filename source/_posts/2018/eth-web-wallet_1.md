---
title: 使用ethers.js开发以太坊Web钱包1 - 创建钱包账号
permalink: eth-web-wallet_1
date: 2018-10-25 18:34:44
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - 比特币
    - ethers.js

author: Tiny熊
---


以太坊去中心化网页钱包开发系列，详细的[视频课程讲解直接戳链接](https://ke.qq.com/course/356068?tuin=bd898bbf)，本系列将从零开始开发出一个可以实际使用的钱包，本系列是理论与实战相结合，文章一共有四篇：[创建钱包账号](https://learnblockchain.cn/2018/10/25/eth-web-wallet_1/)、[账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)、[展示钱包信息及发起签名交易](https://learnblockchain.cn/2018/10/26/eth-web-wallet_3/)、[发送Token(代币）](https://learnblockchain.cn/2018/10/26/eth-web-wallet_4/)，这是第一篇，主要介绍钱包将实现哪些功能及怎么创建钱包账号，本钱包是基于[ethers.js](https://docs.ethers.io/ethers.js/html) 进行开发。

<!-- more -->

## 去中心化网页钱包

先明确一下定义，什么是去中心化钱包，账号秘钥的管理，交易的签名，都是在客户端完成， 即私钥相关的信息都是在用户手中，钱包的开发者接触不到私钥信息。

> 对应的中心化钱包则是私钥由中心服务器托管，如交易所的钱包就是这种。

网页钱包，或者叫web钱包，是指钱包以网页的形式展现，去中心化网页钱包则交易的签名等操作是在浏览器里完成。
其他形式的钱包，如Android钱包或iOS钱包其开发思路和web钱包一样，因此文本对开发其他平台的钱包也有参考意义，不过本系列文章主要侧重在钱包功能的实现，并未过多考虑用户体验。


## 钱包功能

一个钱包通常主要包含的功能有：

* 账号管理（主要是私钥的管理）：创建账号、账号导入导出
* 账号信息展示：如以太币余额、Token（代币）余额。
* 转账功能：发送以太币及发送Token（代币）

这些功能将基于 ethers.js 进行开发，   ethers.js 和web3.js 一样，也是一套和以太坊区块链进行交互的库，不仅如此，ethers.js 还对BIP 39等相关的提案进行了实现，可以在这个[链接](https://docs.ethers.io/ethers.js/html/)阅读其文档。

这些功能主要表现为钱包的两个界面，一个界面是：账号管理，一个界面是进行账号信息展示及转账。下面逐个进行介绍

## 创建钱包账号

读过上一篇文章[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)的同学，会知道创建账号，可以有两种方式：

* 直接生成32个字节的数当成私钥
* 通过助记词进行确定性推导出私钥

### 使用随机数作为私钥创建钱包账号

即方式一，可以使用ethers.utils.randomBytes生成一个随机数，然后使用这个随机数来创建钱包，如代码:

```js
var privateKey = ethers.utils.randomBytes(32);
var wallet = new ethers.Wallet(privateKey);
console.log("账号地址: " + wallet.address);

```

上面代码的 wallet 是 ethers 中的一个钱包对象，它除了有代码中出现的.address 属性之外，还有如 获取余额、发送交易等方法，在后面的文章会进行介绍。


注意ethers.utils.randomBytes 生成的是一个字节数组，如果想用十六进制数显示出来表示，需要转化为BigNumber代码如下：

```js
let keyNumber = ethers.utils.bigNumberify(privateKey);
console.log(randomNumber._hex);
```

现在我们结合界面，完整的实现创建账号，其效果图如下，加载私钥时创建账号。

![](https://img.learnblockchain.cn/2018/15401942330046.jpg!wl)

界面代码（HTML）代码如下（主要是在表格中定义个一个输入框及一个按钮）：

```html
                <table>
                    <tr>
                        <th>私钥:</th>
                        <td><input type="text" placeholder="(private key)" id="select-privatekey" /></td>
                    </tr>
                    <tr>
                        <td> </td>
                        <td>
                            <div id="select-submit-privatekey" class="submit">加载私钥</div>
                        </td>
                    </tr>
                </table>
```

对应的逻辑代码(JavaScript)如下：

```js
// 使用JQuery获取两个UI标签
    var inputPrivatekey = $('#select-privatekey');
    var submit = $('#select-submit-privatekey');

// 生成一个默认的私钥
    let randomNumber = ethers.utils.bigNumberify(ethers.utils.randomBytes(32));
    inputPrivatekey.val(randomNumber._hex);

// 点击“加载私钥”时， 创建对应的钱包
    submit.click(function() {
        var privateKey = inputPrivatekey.val();
        if (privateKey.substring(0, 2) !== '0x') { privateKey = '0x' + privateKey; }
       var wallet = new ethers.Wallet(privateKey));

    });

```

如果用户提供一个已有账号的私钥，则会导入其原有账号。


### 通过助记词方式创建钱包账号

这是目前主流常见钱包的方式，关于助记词推导过程请阅读[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)。

我们需要先生成一个随机数，然后用随机数生成助记词，随后用助记词创建钱包账号，设计到的API有：

```js

var rand = ethers.utils.randomBytes(16);

// 生成助记词
var mnemonic = ethers.utils.HDNode.entropyToMnemonic(rand);

var path = "m/44'/60'/0'/0/0";

// 通过助记词创建钱包
ethers.Wallet.fromMnemonic(mnemonic, path);
```

现在我们结合界面来实现一下通过助记词方式创建钱包账号，其效果图如下：

![](https://img.learnblockchain.cn/2018/15401977091699.jpg!wl)

界面代码（HTML）代码如下（主要是在表格中定义个两个输入框及一个按钮）：

```html
    <table>
        <tr>
            <th>助记词:</th>
            <td><input type="text" placeholder="(mnemonic phrase)" id="select-mnemonic-phrase" /></td>
        </tr>
        <tr>
            <th>Path:</th>
            <td><input type="text" placeholder="(path)" id="select-mnemonic-path" value="m/44'/60'/0'/0/0" /></td>
        </tr>
        <tr>
            <td> </td>
            <td>
                <div id="select-submit-mnemonic" class="submit">推倒</div>
            </td>
        </tr>
    </table>

```

对应的逻辑代码(JavaScript)如下：

```js
    var inputPhrase = $('#select-mnemonic-phrase');
    var inputPath = $('#select-mnemonic-path');
    var submit = $('#select-submit-mnemonic');

// 生成助记词
    var mnemonic = ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
    inputPhrase.val(mnemonic);

    submit.click(function() {
    // 检查助记词是否有效。
        if (!ethers.utils.HDNode.isValidMnemonic(inputPhrase.val())) {
            return;
        }

// 通过助记词创建钱包对象
       var wallet = ethers.Wallet.fromMnemonic(inputPhrase.val(), inputPath.val());
    });
```

同样用户可以提供一个其保存的助记词来导入其钱包，有一些遗憾的是，ethers.js 暂时不支持通过添加密码作为Salt来保护种子（也可能是我没有找到，如果知道的同学，希望反馈下），如果需要此功能可以引入bip39 和 ethereumjs-wallet 库来实现，代码可参考[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)。


## 小结

其实 ethers 还提供了一个更简单的方法来创建钱包：

```js
   // 直接创建一个随机钱包
   ethers.Wallet.createRandom();
```

完整源码请订阅[深入浅出区块链技术小专栏](https://xiaozhuanlan.com/blockchaincore)查看， 哈哈，是不是有一点鸡贼，创作不易呀。
戳链接收看[详细的视频课程讲解](https://ke.qq.com/course/356068?tuin=bd898bbf)。

参考文档:
[ethers.js](https://docs.ethers.io/ethers.js/html)


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

[深入浅出区块链知识星球](https://learnblockchain.cn/images/zsxq.png)最专业技术问答社区，加入社区还可以在微信群里和300多位区块链技术爱好者一起交流。


