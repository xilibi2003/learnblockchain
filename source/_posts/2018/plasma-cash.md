---
title: 深入理解Plasma（四）Plasma Cash
permalink: plasma-cash
date: 2018-11-16 12:44:17
categories:
    - 以太坊
    - Plasma
tags:
    - 以太坊
    - Plasma
    - 扩容

author: 盖盖
---

这一系列文章将围绕[以太坊的二层扩容](https://wiki.learnblockchain.cn/ethereum/layer-2.html)框架 Plasma，介绍其基本运行原理，具体操作细节，安全性讨论以及未来研究方向等。本篇文章主要介绍在 Plasma 框架下的项目 Plasma Cash。


<!-- more -->


在[上一篇](https://github.com/gitferry/mastering-ethereum/blob/master/Plasma-in-depth/plasma-mvp.md)文章中我们已经理解了 Plasma 的最小实现 Plasma MVP 如何使用 UTXO 模型实现 Plasma 链下扩容的核心思想。但由于 Plasma MVP 本身过于简单，并不能用于实际的生产环境中。2018 年 3 月，在巴黎举行的以太坊开发者大会上，Vitalik 发布了 Plasma Cash 模型[[1]](https://ethresear.ch/t/plasma-cash-plasma-with-much-less-per-user-data-checking/1298)，可以视为对 Plasma MVP 的改进。Plasma Cash 与 Plasma MVP 的主要区别是每次存款操作都会产生一个唯一的 coin ID 对应转移到侧链上的资产，并使用一种称为稀疏梅克尔树（Sparse Merkle Tree）的数据结构存储交易历史。由此带来的好处是用户不需要关注子链上的每个动态，只需要关注跟自己的 token 有关的动态。在下文中将介绍具体细节。

### 存款（Deposits）
Plasma Cash 中的每次存款操作都会对应产生一个 NFT（non-fungible token）[[2]](https://en.wikipedia.org/wiki/Non-fungible_token)。NFT 可以简单理解为“不可互换的 token”，即每个 token 都是独一无二的，由唯一的 ID 标记。以太坊官方为 NFT 提供了 ERC721 标准[[3]](http://erc721.org/)，在之前火爆到阻塞以太坊的 CryptoKitties 就是由 ERC721 合约实现的。

在 Plasma Cash 中，当用户向 Plasma 合约发送存款交易时，合约会生成一个与存款等值的 token，并给这个 token 分配一个唯一的 ID。如果一个用户分别执行两次存款操作，且每次存款都是 5 ETH，那么他将得到相等价值的两个完全不同的 token。和 Plasma MVP 一样，每次存款操作都会使得 Plasma 合约产生一个只包含这个存款交易的区块。

### Plasma Cash 区块
Plasma Cash 中的每个 token 都被分配唯一的 ID，因此可以按 ID 的顺序存储每个 token 的交易历史。Plasma Cash 的区块按 token ID 的顺序给每个 token 分配了一个插槽（slot），每个插槽会记录这个 token 是否被交易的信息。例如在下图（来源[[4]](https://github.com/ethsociety/learn-plasma)）的区块中，包含 4 个 token，id 分别是 #1，#2，#3，#4。其中 #1，#2，#3 被标记为没有被花费，而 #4 由用户 A 发送给用户 B。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/pc-block.png"  width="600" height="190" alt="Plasma Cash Block" />

从上面这个例子中我们可以看到，每个插槽记录了其所对应的 token 在当前区块中的交易状态，所有存储了某个 token 的交易状态的区块按时间顺序连在一起就构成了这个 token 的全部交易历史。每当一个 token 被分配了一个 id，之后的所有交易状态都会被保存在每个区块相同的插槽中，也不会被其它 token 取代。因此，用户只需要关注每个区块中存储属于自己的 token 的状态，完全不用关心别的插槽存储的内容。

### 交易与验证
由于 Plasma Cash 中的节点只追踪属于自己的 token 的交易历史，因此当有交易发生时，token 的发送者要向接收者提供关于这个 token 所有的交易历史（从存款交易开始）以便接收者验证。从下图（来源[[4]](https://github.com/ethsociety/learn-plasma)）的例子中可以看到 4 个区块中所记录的 4 个 token 的交易历史。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/pc-tx.png"  width="400" height="500" alt="Plasma Cash TXs" />

截止到区块 #4，可以看到token #1 和 token #3 始终没有被交易。token #2 在区块 #2 被 E 发送给了 F，在区块 #4 被 F 发送给了 G，在其它区块没有发生交易，token #2 的最终所有权归 G。token #4 在区块 #1 被 A 发送给了 B，在区块 #3 被 B 发送给了 C，在其它区块没有发生交易，token #4 的最终所有权归 C。F 为了向 G 证明 token #2 的合法性，需要向 G 提供 token #2 在前 4 个区块中的所有交易历史，也就是说不仅需要包括区块 #2 中 E => F 的交易证明、区块 #4中 F => G 的交易证明，还要包括在区块 #1 和 #3 中没有被交易的证明。到这里可能感觉有点奇怪，为什么还要包括没有被交易的证明？这是为了防止双花，因为 G 并不知道在区块 #1 和 #3 中 token #2 是否被交易给了其它人。假如 F 在区块 #3 中将 token #2 发送给了 H，并且对 G 隐瞒了这个交易，那么发生在区块 #4 中的 F => G 就是非法（双花）的。因此，在 Plasma Cash 中，完整且合法的交易历史是一个 token 被安全交易的前提。

### 稀疏梅克尔树（Sparse Merkle Tree）
在上文中我们已经了解到一个交易的成功的前提是需要发送方提供关于一个 token 的完整交易历史。完整的交易历史既包括这个 token 在哪些区块被交易的信息，也包括这个 token 在哪些区块没有被交易的信息。我们都知道，在区块链中，使用梅克尔树（Merkle Tree，MT）构造梅克尔证明（Merkel Proof, MP）可以在 O(logN)的时间复杂度验证一个交易是否存在一个区块中。但想要证明一个交易没有存在一个区块中，使用标准的梅克尔树却没那么容易。因此，Plasma Cash 中使用了一种称为稀疏梅克尔树（Sparse Merkle Tree，SMT）的数据结构存储交易数据，能够在O(logN)的时间复杂度验证一个交易不存在。

SMT 实际上一点都不复杂，它的叶子节点是按数据集中的元素序号顺序排列的。如果某个叶子节点对应的元素为空，那么该叶子节点将存储一个特定的值（例如 0 的哈希值）。一个简单的 SMT 示例如下图（来源[[5]](https://medium.com/@kelvinfichter/whats-a-sparse-merkle-tree-acda70aeb837)）所示。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/SMT.png"  width="400" height="400" alt="Sparse Merkle Tree" />

扩展到 Plasma Cash 中，SMT 的叶子节点对应了区块中给每个 token 分配的插槽，按照每个 token 的 ID 排序。每个叶子节点存储对应的 token 的交易信息，如果 token 在这个区块中没有被交易，则相应的叶子节点存储的值为 *null*。

以上图为例，如果需要证明交易 A 存在，就像在标准的 MT 中一样，需要构造 MP：H(null) 和 H(H(null) + H(D))。如果需要证明 B 不存在，同样很简单，我们已经知道 B 的位置是第二个叶子节点，如果 B 不存在，那么该节点存储的值应该为 *null*。因此就像在标准的 MT 中证明存在的 MP 一样，只不过需要加上 H(null) 作为 MP 的一部分，即 MP：H(null)、H(A)和 H(H(null)+H(D))。

### 取款/退出（Withdrawl/Exit）
Plasma Cash 中的取款操作在流程上跟 Plasma MVP 大体相同，都要从提交取款申请开始，经历争议期之后才能完成。由于 Plasma Cash 中采用的数据结构不同，在取款时需要提交的 token 所有权证明不同，因此当争议发生时需要提交的争议证明也不同。

#### 提交取款申请
在向 Plasma 合约提交关于某个 token 的取款申请时，需要提供关于这个 token 最近的两次交易证明。例如，在上图中，假如 G 想要取走 token #2 到主链，那么他需要提交关于 F => G 以及 E => F 的 Merkle Proof。

#### 提交争议
取款者在提交了取款申请之后同样需要支付一定的保证金，并等待一段时间的争议期。在这期间如果有其它节点提交了有效的争议证明，那么取款者不但无法完成取款操作，也会损失全部或部分的保证金。

目前 Plasma Cash 支持三种争议证明，分别应对三种不同的攻击场景（具体会在后文分析）：

1. 已花费证明。如果能证明正在取款的 token 已经被花费，那么取款立即被取消；
2. 双花证明。如果能证明取款申请中提供的两次交易证明中间还有别的交易，即发生了双花，那么取款立即被取消；
3. 非法交易历史证明。用户还可以对正在取款的 token 的其它交易历史提出争议。这种争议不会立刻阻断取款，而是强制取款者提交其它交易证明来反驳争议，如果没有在规定时间内反驳，则取款被取消。

### 攻击场景
在这一节将讨论已有的 3 种攻击场景以及如何构造争议分别应对这些攻击[[6]](https://karl.tech/plasma-cash-simple-spec/)。在这里假设 Plasma Cash 中存在不可信的 operator 接收所有的交易并构造区块。

#### 发送交易后立即退出
如下图（来源[[7]](https://github.com/loomnetwork/plasma-paper/blob/master/plasma_cash.pdf)）所示，假设攻击者 Alice 向 Bob 发送了一个 token A，且 Bob 已经验证了 A 的交易历史没有问题，交易在区块 N+X 得到确认。在这之后，Alice 立即提交取款申请，企图将 token A 取回主链，并提交 A 在区块 N 以及之前的交易证明。为了应对这种情况，Bob 必须及时发现 Alice 的取款行为，并且在争议期结束前提交在区块 N+X 中 token A 被 Alice 发送给 Bob 的证明。这里需要注意的是，如果 Bob 在区块 N+Y 将 token A 发送给 Charlie 的交易是不能被当做争议证明的，只有最接近被争议的交易的下一个交易证明有效。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/attack1.png"  width="700" height="220" alt="attack1" />

#### 双花攻击
双花攻击需要 operator 配合，将含有已经被花费的 token 的交易打包入下一个区块中。如下图所示（来源[[7]](https://github.com/loomnetwork/plasma-paper/blob/master/plasma_cash.pdf)），攻击者 Alice 和 Charlie 是同谋，Alice 向 Bob 发送一个 token A 在区块 N+X 被确认，之后 Alice 又将 token A 发送给 Charlie，并在区块 N+Y 被确认。这时在主链看来，Bob 和 Charlie 都是 token A 的合法拥有者。接下来，Charlie 立即提交取款申请，企图取走 token A。Bob 为了防止自己的 token 被盗，可以在争议期内提交在区块 N+X 被确认的交易，表明自己在 Charlie 之前已经拥有了 token A。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/attack2.png"  width="700" height="300" alt="attack2" />

#### 取款包含非法交易历史

这种攻击需要联合比较多的同谋者。如下图所示，Alice 在区块 N 拥有 token A。Bob 联合 operator、Charlie 以及 Dylan 企图盗走 Alice 的 token。首先，operator 伪造 Alice 将 token A 发送给 Bob 的交易，并在区块 N+X 得到确认，之后 Bob 将 token 发送给 Charlie，在区块 N+Y 确认。同样地，Charlie 接着将 token 发送给 Dylan，在区块 N+Z 确认。这是，Dylan 提出取款申请，企图取走 token A。Dylan 用于取款申请的两个交易证明 Charlie => Dylan 和 Bob => Charlie 都是合法的，但 token A 的交易历史中有一部分是伪造的。Alice 为了证明自己是 token A 的最新合法拥有者，可以提出争议，要求 Dylan 提供 Alice => Bob 的交易证明，同时 Alice 需要提交一部分保证金（否则任何人都可以随便提出争议）。Dylan 必须在一定的时间内提供合法的交易证明，否则取款失效。

<img src="https://raw.githubusercontent.com/gitferry/mastering-ethereum/master/Plasma-in-depth/images/attack3.png"  width="900" height="250" alt="attack3" />

### 相关项目

> Talk is cheap, show me your code.

目前已经有许多机构和公司已经实现了 Plasma Cash，但实现的语言和细节有所不同：

* Loom Network [[8]](https://github.com/loomnetwork/plasma-cash)
* Omisego [[9]](https://github.com/omisego/plasma-cash)
* Wolk [[10]](https://github.com/wolkdb/deepblockchains/tree/master/Plasmacash)
* Lucidity [[11]](https://github.com/luciditytech/lucidity-plasma-cash)

### 总结

本篇介绍了 Plasma 框架下的基于 NFT 的项目 Plasma Cash。Plasma Cash 给每个新转移的 token 分配一个唯一的 token ID，并且用稀疏梅克尔树存储交易，使得用户可以只关注跟自己的 token 有关的动态，而不需要关注其它 token。Plasma Cash 可以被看作 Plasma 逐渐迈向成熟的一步，已经有很多公司使用 Plasma Cash 搭建自己的平台和应用，例如 Loomnetwork 公司搭建了自己的 Plasma Cash 子链并且编写了 SDK 支撑开发者在上面开发新的应用。然而 Plasma Cash 本身仍然存在较多的问题，例如 token 无法被分隔合并、需要提交的证明过长等。在接下来的文章中还会继续跟进 Plasma 最新的进展。

### 相关资源

1. [https://ethresear.ch/t/plasma-cash-plasma-with-much-less-per-user-data-checking/1298](https://ethresear.ch/t/plasma-cash-plasma-with-much-less-per-user-data-checking/1298)
2. [https://en.wikipedia.org/wiki/Non-fungible_token](https://en.wikipedia.org/wiki/Non-fungible_token)
3. [http://erc721.org/](http://erc721.org/)
4. [https://github.com/ethsociety/learn-plasma](https://github.com/ethsociety/learn-plasma)
5. [https://medium.com/@kelvinfichter/whats-a-sparse-merkle-tree-acda70aeb837](https://medium.com/@kelvinfichter/whats-a-sparse-merkle-tree-acda70aeb837)
6. [https://karl.tech/plasma-cash-simple-spec/](https://karl.tech/plasma-cash-simple-spec/)
7. [https://github.com/loomnetwork/plasma-paper/blob/master/plasma_cash.pdf](https://github.com/loomnetwork/plasma-paper/blob/master/plasma_cash.pdf)
8. [https://github.com/loomnetwork/plasma-cash](https://github.com/loomnetwork/plasma-cash)
9. [https://github.com/omisego/plasma-cash](https://github.com/omisego/plasma-cash)
10. [https://github.com/wolkdb/deepblockchains/tree/master/Plasmacash](https://github.com/wolkdb/deepblockchains/tree/master/Plasmacash)
11. [https://github.com/luciditytech/lucidity-plasma-cash](https://github.com/luciditytech/lucidity-plasma-cash)


本文的作者是盖盖，他的微信公众号: chainlab

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


