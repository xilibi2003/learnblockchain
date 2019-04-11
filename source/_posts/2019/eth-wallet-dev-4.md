---
title: 如何开发一款以太坊安卓钱包系列4 - 获取以太及Token余额
permalink: eth-wallet-dev-4
un_reward: false
date: 2019-03-26 21:40:50
categories: 
    - 以太坊
    - 钱包
tags:
    - 钱包
    - 以太坊
    - web3j
author: Tiny熊
---


这是如何[开发以太坊安卓钱包系列](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/)，接[上一篇](https://learnblockchain.cn/2019/03/24/eth_wallet_dev_3/)继续展示钱包账号资产信息，这篇来看看如何获取账号的以太余额及Token余额。


<!-- more -->

## 回顾 

在[上一篇](https://learnblockchain.cn/2019/03/24/eth_wallet_dev_3/)中，为了避免 UI 与上面4个数据的耦合，使用了一个`TokensViewModel`，并且已经完成当前选中账号`defaultWallet`的获取，我们在回看一下`TokensViewModel`的定义：

```java 
public class TokensViewModel extends ViewModel {
    private final MutableLiveData<ETHWallet> defaultWallet;
    private final MutableLiveData<NetworkInfo> defaultNetwork;

    private final MutableLiveData<Token[]> tokens;
    private final MutableLiveData<Ticker> prices;
}

```

上面还有三个变量，一个是tokens， 当前账号下 所拥有的 Token 数组； 一个是`defaultNetwork`当前选中网络，还有一个`prices`我们下一遍介绍。

为什么需要 `defaultNetwork` 来保存网络信息呢？ 这是因为同一个账号，他在不同的网络下，其余额是不同的，而登链钱包又可以支持多个不同的网络，所有我们在获取账号余额前，需要确定一下其网络。

 
## 网络

### 以太坊网络

这里补充下以太坊网络，当前以太坊在使用的网络有5个：

* Mainnet ：主网，真正有价值的网络，当前Pow共识；
* Ropsten ：测试网网络， 使用Pow，和当前的公有链环境一致；
* Kovan ：测试网网络， 使用PoA共识，仅parity钱包支持；
* Rinkeby：测试网网络，使用PoA共识 仅geth钱包支持；
* Goerli：测试网网络，为Eth2.0 作准备启动的一个跨客户端的网络。

除此之外，登链钱包还支持本地开发网络。

### NetworkInfo

代码中使用 `NetworkInfo`类 来表示一个网络，其定义如下，大家看一下注释：


```java 
public class NetworkInfo {
    public final String name;  // 网络名称，如 mainnet， ropsten
    public final String symbol;  // ETH
    public final String rpcServerUrl;  // 节点提供的rpc 服务地址
    public final String backendUrl;    // 查询交易的列表的服务url
    public final String etherscanUrl;
    public final int chainId;
    public final boolean isMainNetwork;
}
```

在`EthereumNetworkRepository.java`中用一个 NetworkInfo 数组 `NETWORKS` 列出了所有支持的网络，其中包含了一个本地开发网络，：

```java

    private final NetworkInfo[] NETWORKS = new NetworkInfo[] {
            new NetworkInfo("Mainnet","ETH",
                    "https://mainnet.infura.io/llyrtzQ3YhkdESt2Fzrk",
                    "https://api.trustwalletapp.com/",
                    "https://etherscan.io/",1, true),
            // ignore some ...  
            new NetworkInfo("local_dev","ETH",
                    "http://192.168.8.100:8545",
                    "http://192.168.8.100:8000/",
                    "",1337, false),
    };
```

`NetworkInfo`中节点及交易查询服务，我们可以选择自己[搭建节点](https://learnblockchain.cn/2018/03/18/create_private_blockchain/)（使用Geth、Ganache 等工具），或使用第三方的服务。

### 测试网络

如果是测试网络，就必须得自己搭建节点，如使用geth启动一个网络：

```bash
geth --datadir  my_datadir --dev --rpc --rpcaddr "0.0.0.0" console
```

特别要注意，需要对`--rpcaddr` 进行设置，表示哪一个地址能接受RPC请求，因为默认情况下，geth只接受来自 localhost 的请求，这样就无法接受到来自手机的客户端的请求。
如果是Ganache，可以点击Ganache右上角的设置，进行配置。

### 确定当前网络

在钱包有一个设置项，会把用户选中的网络的`name`保存到 `SharedPreference`， 如图：

![](https://img.learnblockchain.cn/2019/15536708197342.jpg!wl)

确定网络的代码逻辑就简单了： 从`SharedPreference`读取到选中的网络名再对`NETWORKS` 做一个匹配，[代码](https://github.com/xilibi2003/Upchain-wallet)在`EthereumNetworkRepository`中，大家可对照查看。


## Coin 还是 Token

Coin 指的是以太币，Token 是大家通常所说的代币 或 通证，以太余额何Token余额，他们的获取方式是不一样的，明白这一点很重要，有必要先介绍下以太坊账户模型。

### 以太坊账户模型

以太币Eth是以太坊的原生代币，在以太坊的账户模型中，有一个字段`balance`存储着余额，例如账号的定义像下面：

```
class Account {
  nonce: '0x01',
  balance: '0x03e7',  // wei
  stateRoot: '0x56abc....',
  codeHash: '0x56abc....', 
}
```

获取以太币的余额只需要调用web3j提供的RPC接口[`eth_getBalance`](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getbalance)。

而一个地址的Token余额，他记录在Token合约上，注意合约其实也是一个账户（合约账户），Token是指
符合[ERC20标准](https://learnblockchain.cn/2018/01/12/create_token/)的合约， 每个地址的余额通常存储在一个`Mapping`类型的`balanceOf`变量中，获取地址的余额需要调用合约的balanceOf方法，并给他传递地址作为参数。

> 如果在合约地址上调用 `eth_getBalance`， 获取的是合约上所存的 eth余额。

### Token & TokenInfo

在登链代码里，每一种币及余额封装成了一个`Token`类，不论是以太币还是Token 都处理是一个`Token`实例。

这里Token 命名不是很严谨，以太币一般称为Coin，为了方便，**Coin和Token 都统一作为Token处理**，Coin 作为一个特殊的Token，了解这一点对后文阅读很重要。

Token的定义如下:

```java
public class Token {
    public final TokenInfo tokenInfo;
    public final String balance;    // 币余额
    public String value;            // 币对应的法币价值
}

public class TokenInfo {
    public final String address;  // 合约地址
    public final String name;
    public final String symbol;   // 代币符号
    public final int decimals;
}
```

## 账号所有资产

资产包括以太币资产及Token资产。

### 关联 Token 

在获取账号余额之前，我们需要先知道有多少 Token 种类，然后再获取每种Token余额。在[登链钱包](https://github.com/xilibi2003/Upchain-wallet)中，每一账号在某个网络下所关联 Token种类，保存为一个 [Realm](https://realm.io/docs/java/latest/)文件，相关逻辑在`RealmTokenSource`类中。

> Realm 是一个移动端数据库，是替代sqlite的一种解决方案。

在用户通过以下界面添加新资产，会调用`RealmTokenSource`类的`put`方法保存到`.realm`文件。
![](https://img.learnblockchain.cn/2019/15536710194901.jpg!wl)

现在来看看如何获取账号所关联的 Token， 逻辑上比较简单，不过涉及了多个类，我把调用序列图梳理一下：

![](https://img.learnblockchain.cn/2019/15536757559224.jpg!wl)


<div style='display: none'>

流程图源码
```sequence
Title: 获取账号Token种类
TokensViewModel->FetchTokensInteract: fetch
FetchTokensInteract->TokenRepository: fetch
TokenRepository->TokenLocalSource: fetch
TokenLocalSource-->>TokensViewModel: OnTokens
```
</div>


通过这个调用过程，最终通过TokensViewModel类的onTokens获取到Token种类。

```java
    private void onTokens(Token[] tokens) {
        this.tokens.postValue(tokens);
   }
```

在PropertyFragmeng界面中订阅收到数据之后，把它设置到界面的Adapter里，完成Token列表的显示。

### Ethplorer-API 服务

TokenRepository在执行fetch方法时，如果是在主网下，会调用[代码](https://github.com/xilibi2003/Upchain-wallet)中
`EthplorerTokenService`类，从第三方服务[Ethplorer-API](https://api.ethplorer.io)获取到获取到某一个地址所关联的所有的Token种类。

Ethplorer-API提供的API更多，不过我们只需要[getAddressInfo]( https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API#get-address-info)接口，请求接口如下：

```
/getAddressInfo/0xaccount?apiKey=freekey
```

Ethplorer-API 的免费接口是有请求限额，每2秒才能发起一个请求，需要注意访问频度。
 
## 余额 balance

### 获取以太余额

分为两步：
1. 先构造出web3j 对象
2. web3j 调用 ethGetBalance 获取以太余额

web3j对象的构造方法如下:
```java
web3j = Web3j.build(new HttpService(networkInfo.rpcServerUrl, httpClient, false));
```

web3j对象在TokenRepository初始化的时候完成，在TokenRepository获取到Token列表之后，如果是以太币会随即会调用`getEthBalance` 方法：

```java
    private BigDecimal getEthBalance(String walletAddress) throws Exception {
        return new BigDecimal(web3j
                .ethGetBalance(walletAddress, DefaultBlockParameterName.LATEST)
                .send()
                .getBalance());
    }
```

###  获取 Token 数量

在TokenRepository获取到Token列表之后，如果是ERC20代币会随即会调用`getBalance` 方法。
根据前面的介绍获取代币的余额需要调用合约的balanceOf方法，在以太坊上**对合约方法的调用实际上会合约地址发起一个调用，调用的附加数据是函数及参数的ABI编码数据**。

> 之前写过一篇文章：[如何理解以太坊ABI](https://learnblockchain.cn/2018/08/09/understand-abi/)， 大家可以读一下。

用以下方法构造出`balanceOf`的ABI函数类型：

```java
    private static org.web3j.abi.datatypes.Function balanceOf(String owner) {
        return new org.web3j.abi.datatypes.Function(
                "balanceOf",
                Collections.singletonList(new Address(owner)),
                Collections.singletonList(new TypeReference<Uint256>() {}));
    }
```

获取到balanceOf的ABI 之后，经过编码之后，使用 createEthCallTransaction来构造这样一个交易：交易的发起者是当前的账号，交易的目标地址是合约地址，附加数据是编码之后的数据，getBalance方法如下：

```java

    private BigDecimal getBalance(String walletAddress, TokenInfo tokenInfo) throws Exception {
        org.web3j.abi.datatypes.Function function = balanceOf(walletAddress);
        String responseValue = callSmartContractFunction(function, tokenInfo.address, walletAddress);

        List<Type> response = FunctionReturnDecoder.decode(
                responseValue, function.getOutputParameters());
        if (response.size() == 1) {
            return new BigDecimal(((Uint256) response.get(0)).getValue());
        } else {
            return null;
        }
    }


    private String callSmartContractFunction(
            org.web3j.abi.datatypes.Function function, String contractAddress, String walletAddress) throws Exception {
        String encodedFunction = FunctionEncoder.encode(function);

        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(walletAddress, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST)
                .sendAsync().get();
        return response.getValue();
    }
```

### 余额格式化

上面获取到的余额，是以最小单位表示的一个数，如以太币余额用wei表示，而现示给用户的数据是ether，即大家说的以太。 
> 注： 1 eth = 10^18 wei , 更多[单位转换](https://learnblockchain.cn/2018/02/02/solidity-unit/)

转换方法如下：

```Java
BigDecimal decimalDivisor = new BigDecimal(Math.pow(10, decimals));
BigDecimal ethbalance = balance.divide(decimalDivisor);
```

对以太币而言 decimals 为 18，之后 ethbalance 会转化为一个保留4位小数点数的字符串保存到Token类型的`balance`变量，转换方法如下：
```java
 ethBalance.setScale(4, RoundingMode.CEILING).toPlainString()
```

UI界面最终通过订阅 tokens 数组获取Token种类及余额，代码查阅` PropertyFragment.java` 。


## 参考文档

[web3j](https://github.com/web3j) 
[Realm](https://realm.io/docs/java/latest/)
[Ethplorer-API](https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API) 

加我微信：xlbxiong 备注：钱包， 加入钱包开发的微信群。


加入[知识星球](https://learnblockchain.cn/images/zsxq.png)，和一群优秀的区块链从业者一起学习。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，学区块链的都在这里，打造最好的区块链技术博客。



