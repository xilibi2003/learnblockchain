---
title: multi-sig-wallet
date: 2018-06-28 21:43:53
tags:
---

如何实现以太坊多重签名钱包

## 多重签名


https://medium.com/@ChrisLundkvist/exploring-simpler-ethereum-multisig-contracts-b71020c19037

https://blog.gridplus.io/toward-an-ethereum-multisig-standard-c566c7b7a3f6


## 多重签名钱包

 你可以使用太坊钱包的多重签名来保护账户中余额。好处是，当要从提取较大额度的金时，需要多个账户共同认证才能成功提取。在创建一重签名钱包前你首先至少需要创建 2账户。

##


多重签名的优势是当你需要提取超过限制的金额时，需要多把私钥同时授权，同时提升防盗，防丢的安全性。

在以太坊官方钱包中，你可以在 Wallet Contracts 下方中选择 Add Wallet Contract，前提是你用来创建 Wallet Contract 的 account 有不少于 0.02 ETH，足以支付交易所需的费用。

多重签名
什么是多重签名

比特币的匿名性，使交易处于不可信之中，最终导致用户不敢交易。有了签名功能，就有了确认双方信息的有效手段。那么，什么是多重签名呢？

多重签名，可以简单地理解为一个数字资产的多个签名。多重签名预示着数字资产可由多人支配和管理。多重签名，就表示动用这笔资金需要多个私钥签名，通常这笔资金或数字资产会保存在一个多重签名的地址或账号里。类似于生活中有一份文件需要多个部门签署才能生效一样。

多重签名是数字签名的升级，它让区块链相关技术应用到各行各业成为可能。在实际的操作过程中，一个多重签名地址可以关联n个私钥，在需要转账等操作时，只要其中的m个私钥签名就可以把资金转移了，其中m要小于等于n，也就是说m/n小于1，可以是2/3, 3/5等等，是要在建立这个多重签名地址的时候确定好的。

例如，电子商务、财产分割、资金监管等。例如，一对夫妻要储备一笔资金，供孩子上大学使用，在这之前谁都不能动，那么把签名模式改为2/2，不仅限制了夫妻双方，也给黑客攻击增加了难度。多重签名的设计，让各种业务去中心化充满无限可能。

工作原理

数字资产在某种情况下，需要多人支配。换句话说，在某些特定条件下，数字资产如果无法确认归属某个特定的人，那么最好让相关人共同签署它的所有权。

仍然举上面的例子，在Alice发货之后，Imfly收到货之前，这笔钱应该由第三方信用比较高的中介暂时保存，这个阶段，这笔钱要么是Alice的，要么是Imfly的，最终的归属要看Imfly是否收到货。所以，这个第三方，无论如何都是应该有的，不然Imfly就要承担大部分风险（因为比特币的单向不可逆，Imfly发送之后就没有办法收回了）

这样一来，这笔钱的所属关系，在交易过程中涉及到Alice、Imfly和平台第三方（虽然不属于它，但它有权裁定资金去向），那么就应该由他们三方签名，因此网上购物就是典型的多重签名的例子。其多重签名模型就是2/3，也就是说只要他们中的两个签名，资金就可以被转移。

具体到这个例子，Imfly把钱打给一个关联三方私钥的多重签名地址，如果整个交易过程顺利，只要Alice和Imfly两个签名，这笔钱就会顺利到达Alice手里。如果不顺利，他们任何一人提出仲裁，平台第三方调查之后，通过签名就能把这笔钱转给Alice或退回Imfly。这非常类似淘宝和京东的模式，但是比他们更加便捷和安全，至少不用担心第三方倒闭、挪用资金或携款跑路。



多重签名的比特币钱包需要“m-n”签名，才能在比特币网络中进行广播获取确认。多重签名的比特币钱包的使用主要有两种流行的使用方式：2-3多重签名和2-2 多重签名。其中2-3多重签名是最常用的，下面就介绍一下2-3多重签名常用的用法。<img src="https://pic4.zhimg.com/v2-f850bc8ed75da658bffbb93f8993a89b_b.jpg" data-caption="" data-size="normal" data-rawwidth="600" data-rawheight="360" class="origin_image zh-lightbox-thumb" width="600" data-original="https://pic4.zhimg.com/v2-f850bc8ed75da658bffbb93f8993a89b_r.jpg">



-3多重签名2-3多重签名常用的用法是：自己生成两个私钥，一个保存为备份，另一个存放在钱包内；剩下的一个私钥由钱包服务商生成和保存。支付比特币时，需要用户和钱包服务商共同签名交易。如果用户或者钱包服务商丢失了私钥，备份的私钥就可以动用，转移资金。但是钱包服务商却不能私自动用用户的资金。


多签钱包的目的是通过要求多方在交易执行前达成共识来提高安全性。在以太坊平台上这个目标可以通过智能合约轻松地达到。通过智能合约持有标的资产（例如以太币或者其他代币），并且明确持有这个多签钱包的以太坊账户地址。交易只有在被超过预先确定数字的钱包持有者确认后才能执行。这解决了私钥持有账户的单点沦陷问题——如果丢失或者泄漏私钥会可能直接导致账户中所有的资产的丢失。

[first - ](https://github.com/ethereum/dapp-bin/blob/master/wallet/wallet.sol)


[MultiSigWallet](https://github.com/Gnosis/MultiSigWallet)
[MultiSigWallet](https://github.com/ConsenSys/MultiSigWallet)

https://etherscan.io/accounts

https://github.com/MysticMonsoon/SimpleMultisig

https://github.com/christianlundkvist/simple-multisig/blob/master/contracts/SimpleMultiSig.sol