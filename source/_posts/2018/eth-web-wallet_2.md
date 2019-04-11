---
title: 使用ethers.js开发以太坊Web钱包2 - 账号Keystore文件导入导出
permalink: eth-web-wallet_2
date: 2018-10-25 20:34:44
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - Keystore
    - KDF
    - ethers.js

author: Tiny熊
---

以太坊去中心化网页钱包开发系列，点链接[观看视频课程](https://ke.qq.com/course/356068?tuin=bd898bbf)，将从零开始开发出一个可以实际使用的钱包，本系列文章是理论与实战相结合，一共有四篇：[创建钱包账号](https://learnblockchain.cn/2018/10/25/eth-web-wallet_1/)、[账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)、[展示钱包信息及发起签名交易](https://learnblockchain.cn/2018/10/26/eth-web-wallet_3/)、[发送Token(代币）](https://learnblockchain.cn/2018/10/26/eth-web-wallet_4/)，这是第二篇，主要介绍钱包账号导出与导入，将对Keystore文件的生成的原理进行介绍。

<!-- more -->

## 如何导入Geth创建的账号？

在[上一篇文章](https://learnblockchain.cn/2018/10/20/eth-web-wallet_1/)，介绍了如何使用私钥及助记词来创建账号，如果是使用已有的私钥及助记词，这其实也是账号导入的过程。

有一些同学会问，我的账号是Geth生成的，如何导入到钱包呢？使用Geth的同学，应该知道Geth在创建账号时会生成一个对应keystore JSON文件，Keystore文件存储加密后的私钥信息，因此我们需要做的就是导入这个Keystore文件，这个文件通常在同步区块数据的目录下的keystore文件夹（如： ~/.ethereum/keystore）里。

尽管在ethers.js 中，简单的使用一个函数就可以完成keystore文件的导入，不过理解Keystore 文件的作用及原理还是非常有必要的，当然如果你是在没有兴趣，可以直接跳到本文最后一节：使用ethers.js 实现账号导出导入。


## 详细解读 Keystore 文件

###  为什么需要 Keystore 文件

通过这篇文章[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)，私钥其实就代表了一个账号，最简单的保管账号的方式就是直接把私钥保存起来，如果私钥文件被人盗取，我们的数字资产将洗劫一空。

Keystore 文件就是一种以加密的方式存储密钥的文件，这样的发起交易的时候，先从Keystore 文件是使用密码解密出私钥，然后进行签名交易。这样做之后就会安全的多，因为只有黑客同时盗取 keystore 文件和密码才能盗取我们的数字资产。

### Keystore 文件如何生成的

 以太坊是使用对称加密算法来加密私钥生成Keystore文件，因此对称加密秘钥(注意它其实也是发起交易时需要的解密秘钥)的选择就非常关键，这个秘钥是使用KDF算法推导派生而出。因此在完整介绍Keystore 文件如何生成前，有必要先介绍一下KDF。

#### 使用 KDF 生成秘钥

密码学KDF（key derivation functions），其作用是通过一个密码派生出一个或多个秘钥，即从 password 生成加密用的 key。

其实在[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet/)中介绍助记词推导出种子的PBKDF2算法就是一种KDF函数，其原理是加盐以及增加哈希迭代次数。

而在Keystore中，是用的是[Scrypt算法](https://tools.ietf.org/html/rfc7914)，用一个公式来表示的话，派生的Key生成方程为：

```
DK = Scrypt(salt, dk_len, n, r, p)
```

其中的 salt 是一段随机的盐，dk_len 是输出的哈希值的长度。n 是 CPU/Memory 开销值，越高的开销值，计算就越困难。r 表示块大小，p 表示并行度。

>  Litecoin 就使用 scrypt 作为它的 POW 算法

实际使用中，还会加上一个密码进行计算，用一张图来表示这个过程就是：

![](https://img.learnblockchain.cn/2018/15402189467872.png!wl)

#### 对私钥进行对称加密

上面已经用KDF算法生成了一个秘钥，这个秘钥就是接着进行对称加密的秘钥，这里使用的对称加密算法是  aes-128-ctr，aes-128-ctr 加密算法还需要用到一个参数初始化向量 iv。


### Keystore文件

好了，我们现在结合具体 Keystore文件的内容，就很容易理解了Keystore 文件怎么产生的了。


```json
{  
   "address":"856e604698f79cef417aab...",
   "crypto":{  
      "cipher":"aes-128-ctr",
      "ciphertext":"13a3ad2135bef1ff228e399dfc8d7757eb4bb1a81d1b31....",
      "cipherparams":{  
         "iv":"92e7468e8625653f85322fb3c..."
      },
      "kdf":"scrypt",
      "kdfparams":{  
         "dklen":32,
         "n":262144,
         "p":1,
         "r":8,
         "salt":"3ca198ce53513ce01bd651aee54b16b6a...."
      },
      "mac":"10423d837830594c18a91097d09b7f2316..."
   },
   "id":"5346bac5-0a6f-4ac6-baba-e2f3ad464f3f",
   "version":3
}
```

来解读一下各个字段：

* address: 账号地址
* version: Keystore文件的版本，目前为第3版，也称为V3 KeyStore。
* id : uuid
* crypto: 加密推倒的相关配置.
    * cipher 是用于加密以太坊私钥的对称加密算法。用的是 aes-128-ctr 。
    * cipherparams 是 aes-128-ctr 加密算法需要的参数。在这里，用到的唯一的参数 iv。
    * ciphertext 是加密算法输出的密文，也是将来解密时的需要的输入。
    * kdf: 指定使用哪一个算法，这里使用的是 scrypt。
    * kdfparams: scrypt函数需要的参数
    * mac: 用来校验密码的正确性， mac= sha3(DK[16:32], ciphertext) 下面一个小节单独分析。


我们来完整梳理一下 Keystore 文件的产生：
1. 使用scrypt函数 （根据密码 和 相应的参数） 生成秘钥
2. 使用上一步生成的秘钥 + 账号私钥 + 参数 进行对称加密。
3. 把相关的参数 和 输出的密文 保存为以上格式的 JSON 文件


### 如何确保密码是对的？

当我们在使用Keystore文件来还原私钥时，依然是使用kdf生成一个秘钥，然后用秘钥对ciphertext进行解密，其过程如下：

![](https://img.learnblockchain.cn/2018/15402194796574.png!wl)

此时细心的同学会发现，无论使用说明密码，来进行这个操作，都会生成一个私钥，但是最终计算的以太坊私钥到底是不是正确的，却不得而知。

这就是 keystore 文件中 mac 值的作用。mac 值是 kdf输出 和 ciphertext 密文进行SHA3-256运算的结果，显然密码不同，计算的mac 值也不同，因此可以用来检验密码的正确性。检验过程用图表示如下：


![](https://img.learnblockchain.cn/2018/15402227441945.png!wl)

现在我们以解密的角度完整的梳理下流程，就可以得到以下图：


![](https://img.learnblockchain.cn/2018/15402229547319.png!wl)



## 用ethers.js 实现账号导出导入

ethers.js 直接提供了加载keystore JSON来创建钱包对象以及加密生成keystore文件的方法，方法如下：


```js
// 导入keystore Json
    ethers.Wallet.fromEncryptedJson(json, password, [progressCallback]).then(function(wallet) {
       // wallet
    });

    // 使用钱包对象 导出keystore Json
    wallet.encrypt(pwd, [progressCallback].then(function(json) {
        // 保存json
    });
```

现在结合界面来完整的实现账号导出及导入，先看看导出，UI图如下：

![](https://img.learnblockchain.cn/2018/15402637447655.jpg!wl)

HTML 代码如下：

```html
    <h3>KeyStore 导出:</h3>
    <table>
        <tr>
            <th>密码:</th>
            <td><input type="text" placeholder="(password)" id="save-keystore-file-pwd" /></td>
        </tr>

        <tr>
            <td> </td>
            <td>
                <div id="save-keystore" class="submit">导出</div>
            </td>
        </tr>
    </table>
```
上面主要定义了一个密码输入框和一个导出按钮，点击“导出”后，处理逻辑代码如下：

```js
// "导出" 按钮，执行exportKeystore函数
  $('#save-keystore').click(exportKeystore);

  exportKeystore: function() {
    // 获取密码
    var pwd = $('#save-keystore-file-pwd');

    // wallet 是上一篇文章中生成的钱包对象
    wallet.encrypt(pwd.val()).then(function(json) {
      var blob = new Blob([json], {type: "text/plain;charset=utf-8"});

      // 使用了FileSaver.js 进行文件保存
      saveAs(blob, "keystore.json");

    });
  }

```

[FileSaver.js](https://github.com/eligrey/FileSaver.js) 是可以用来在页面保存文件的一个库。

再来看看导入keystore 文件, UI图如下：

![](https://img.learnblockchain.cn/2018/15402647159310.jpg!wl)


```html
 <h2>加载账号Keystore文件</h2>
<table>
    <tr>
        <th>Keystore:</th>
        <td><div class="file" id="select-wallet-drop">把Json文件拖动到这里</div><input type="file" id="select-wallet-file" /></td>
    </tr>
    <tr>
        <th>密码:</th>
        <td><input type="password" placeholder="(password)" id="select-wallet-password" /></td>
    </tr>
    <tr>
        <td> </td>
        <td>
            <div id="select-submit-wallet" class="submit disable">解密</div>
        </td>
    </tr>
</table>
```

上面主要定义了一个文件输入框、一个密码输入框及一个“解密“按钮，因此处理逻辑包含两部分，一是读取文件，二是解析加载账号，关键代码如下：

 ```js
 // 使用FileReader读取文件，

var fileReader = new FileReader();
  fileReader.onload = function(e) {
    var json = e.target.result;

    // 从加载
    ethers.Wallet.fromEncryptedJson(json, password).then(function(wallet) {

    }， function（error) {

    });

  };
fileReader.readAsText(inputFile.files[0]);

```

 哈哈哈，有到了推广时间了，完整源码请订阅[深入浅出区块链技术小专栏](https://xiaozhuanlan.com/blockchaincore)查看，赶紧订阅吧，走过路过，不容错过。
 戳链接收看[详细的视频课程讲解](https://ke.qq.com/course/356068?tuin=bd898bbf)。

## 参考文档

[what-is-an-ethereum-keystore-file](https://medium.com/@julien.maffre/what-is-an-ethereum-keystore-file-86c8c5917b97)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

[深入浅出区块链知识星球](https://learnblockchain.cn/images/zsxq.png)最专业技术问答社区，加入社区还可以在微信群里和300多位区块链技术爱好者一起交流。


