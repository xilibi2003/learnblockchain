---
title: 剖析非同质化代币ERC721-全面解析ERC721标准
permalink: token-erc721
date: 2018-03-23 21:54:50
categories: 
    - 以太坊
    - 智能合约
tags:
    - Token
    - ERC721
    - 智能合约
author: Tiny熊
---

什么是ERC-721？现在我们看到的各种加密猫猫狗狗都是基于ERC-721创造出来的，每只都是一个独一无二的ERC-721代币，不过ERC-721在区块链世界远不止猫猫狗狗，它更大的想象空间在于将物理世界的资产映射到区块链上。本文就来剖析下什么是ERC721.

<!-- more -->

## ERC721是什么

在[创建代币](https://learnblockchain.cn/2018/01/12/create_token/)一篇，我们讲到过ERC20代币，
和ERC20一样，ERC721同样是一个代币标准，ERC721官方简要解释是Non-Fungible Tokens，简写为NFTs，多翻译为非同质代币。 
> ERC721 是由Dieter Shirley 在2017年9月提出。Dieter Shirley 正是谜恋猫CryptoKitties背后的公司Axiom Zen的技术总监。因此谜恋猫也是第一个实现了ERC721 标准的去中心化应用。ERC721号提议已经被以太坊作为标准接受，但该标准仍处于草稿阶段。本文介绍的ERC721标准基于最新(2018/03/23官方提议。

那怎么理解**非同质**代币呢?

非同质代表独一无二，谜恋猫为例，每只猫都被赋予拥有基因，是独一无二的（一只猫就是一个NFTs），猫之间是不能置换的。这种独特性使得某些稀有猫具有收藏价值，也因此受到追捧。

ERC20代币是可置换的，且可细分为N份（1 = 10 * 0.1）, 而ERC721的Token最小的单位为1，无法再分割。
> 如果同一个集合的两个物品具有不同的特征，这两个物品是非同质的，而同质是某个部分或数量可以被另一个同等部分或数量所代替。

非同质性其实广泛存在于我们的生活中，如图书馆的每一本，宠物商店的每一只宠物，歌手所演唱的歌曲，花店里不同的花等等，因此ERC721合约必定有广泛的应用场景。通过这样一个标准，也可建立跨功能的NFTs管理和销售平台（就像有支持ERC20的交易所和钱包一样），使生态更加强大。


## ERC721标准

ERC721最为一个合约标准，提供了在实现ERC721代币时必须要遵守的协议，要求每个ERC721标准合约需要实现ERC721及ERC165接口，接口定义如下：

```js
pragma solidity ^0.4.20;

interface ERC721 /* is ERC165 */ {

    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    
    function approve(address _approved, uint256 _tokenId) external payable;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}
```

**接口说明：**
* balanceOf(): 返回由_owner 持有的NFTs的数量。
* ownerOf(): 返回tokenId代币持有者的地址。
* approve(): 授予地址_to具有_tokenId的控制权，方法成功后需触发Approval 事件。
* setApprovalForAll(): 授予地址_operator具有所有NFTs的控制权，成功后需触发ApprovalForAll事件。
* getApproved()、isApprovedForAll(): 用来查询授权。

* safeTransferFrom(): 转移NFT所有权，一次成功的转移操作必须发起 Transer 事件。函数的实现需要做一下几种检查：
1. 调用者msg.sender应该是当前tokenId的所有者或被授权的地址
2. _from 必须是 _tokenId的所有者
3. _tokenId 应该是当前合约正在监测的NFTs 中的任何一个
4. _to 地址不应该为 0
5. 如果_to 是一个合约应该调用其onERC721Received方法, 并且检查其返回值，如果返回值不为`bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`抛出异常。
一个可接收NFT的合约必须实现ERC721TokenReceiver接口：
```js
    interface ERC721TokenReceiver {
        /// @return `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
        function onERC721Received(address _from, uint256 _tokenId, bytes data) external returns(bytes4);
    }
```
* transferFrom(): 用来转移NFTs, 方法成功后需触发Transfer事件。调用者自己确认_to地址能正常接收NFT，否则将丢失此NFT。此函数实现时需要检查上面条件的前4条。


## ERC165 标准
ERC721标准同时要求必须符合ERC165标准 ，其接口如下：
```js
interface ERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
```
[ERC165](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md)同样是一个合约标准，这个标准要求合约提供其实现了哪些接口，这样再与合约进行交互的时候可以先调用此接口进行查询。
interfaceID为函数选择器，计算方式有两种，如：`bytes4(keccak256('supportsInterface(bytes4)'));`或`ERC165.supportsInterface.selector`，多个函数的接口ID为函数选择器的异或值。
关于ERC165，这里不深入介绍，有兴趣的同学可以阅读[官方提案](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md)。

## 可选实现接口：ERC721Metadata
ERC721Metadata 接口用于提供合约的元数据：name , symbol 及 URI（NFT所对应的资源）。
其接口定义如下：
```js
interface ERC721Metadata /* is ERC721 */ {
    function name() external pure returns (string _name);
    function symbol() external pure returns (string _symbol);
    function tokenURI(uint256 _tokenId) external view returns (string);
}
```
**接口说明：**
* name(): 返回合约名字，尽管是可选，但强烈建议实现，即便是返回空字符串。
* symbol(): 返回合约代币符号，尽管是可选，但强烈建议实现，即便是返回空字符串。
* tokenURI(): 返回_tokenId所对应的外部资源文件的URI（通常是IPFS或HTTP(S)路径）。外部资源文件需要包含名字、描述、图片，其格式的要求如下：
```json
{
    "title": "Asset Metadata",
permalink: token-erc721
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents",
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents",
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
        }
    }
}
```
tokenURI通常是被web3调用，以便在应用层做相应的查询和展示。

## 可选实现接口：ERC721Enumerable

ERC721Enumerable的主要目的是提高合约中NTF的可访问性，其接口定义如下：
```js
interface ERC721Enumerable /* is ERC721 */ {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}
```
**接口说明：**
* totalSupply(): 返回NFT总量
* tokenByIndex(): 通过索引返回对应的tokenId。
* tokenOfOwnerByIndex(): 所有者可以一次拥有多个的NFT, 此函数返回_owner拥有的NFT列表中对应索引的tokenId。

## 补充说明
### NTF IDs
NTF ID，即tokenId，在合约中用唯一的uint265进行标识，每个NFT的ID在智能合约的生命周期内不允许改变。推荐的实现方式有：
1. 从0开始，每新加一个NFT，NTF ID加1
2. 使用sha3后uuid 转换为 NTF ID

### 与ERC-20的兼容性
ERC721标准尽可能遵循 ERC-20 的语义，但由于同质代币与非同质代币之间的根本差异，并不能完全兼容ERC-20。

### 交易、挖矿、销毁
在实现transter相关接口时除了满足上面的的条件外，我们可以根据需要添加自己的逻辑，如加入黑名单等。
同时挖矿、销毁尽管不是标准的一部分，我们可以根据需要实现。

## 参考实现
参考实现为订阅用户专有福利，请订阅我的小专栏：[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。
<!-- 1. [CryptoKitties Deployed Contract.](https://ethfiddle.com/09YbyJRfiI) 2. [XXXXERC721](https://github.com/fulldecent/erc721-example)3. [ERC721ExampleDeed](https://github.com/nastassiasachs/ERC721ExampleDeed) -->


## 参考文献
1. [EIPS-165](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md)
2. [EIPS-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md)

欢迎来我的知识星球[**深入浅出区块链**](https://learnblockchain.cn/images/zsxq.png)讨论区块链，作为星友福利，星友可加入区块链技术付费交流群。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
