---
title: 用Python从零开始创建区块链
date: 2017-10-27 10:15:28
categories: BlockChain
tags:
    - python
    - 创建区块链
    - 翻译
author: Tiny熊
---
本文主要内容来源于[Learn Blockchains by Building One](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46)
英文好的同学可以看原文， 作者认为最快的学习区块链的方式是创建一个，本文就跟随作者来用Python创建一个区块链。


<!-- more -->

对数字货币的崛起感到新奇的我们，并且想知道其背后的技术——区块链是怎样实现的。

但是完全搞懂区块链并非易事，我喜欢在实践中学习，通过写代码来学习技术会掌握得更牢固。通过构建一个区块链可以加深对区块链的理解。

## 准备工作

本文要求读者对Python有基本的理解，能读写基本的Python，并且需要对HTTP请求有基本的了解。

我们知道区块链是由区块的记录构成的不可变、有序的链结构，记录可以是交易、文件或任何你想要的数据，重要的是它们是通过哈希值（hashes）链接起来的。

如果你还不是很了解哈希，可以查看[这篇文章](https://learncryptography.com/hash-functions/what-are-hash-functions) 

### 环境准备
环境准备，确保已经安装Python3.6+, pip , Flask, requests
安装方法：
```
pip install Flask==0.12.2 requests==2.18.4
```

同时还需要一个HTTP客户端，比如Postman，cURL或其它客户端。

参考[源代码](https://github.com/xilibi2003/blockchain)

## 开始创建Blockchain
新建一个文件 blockchain.py，本文所有的代码都写在这一个文件中，可以随时参考[源代码](https://github.com/xilibi2003/blockchain)

### Blockchain类
首先创建一个Blockchain类，在构造函数中创建了两个列表，一个用于储存区块链，一个用于储存交易。

以下是Blockchain类的框架：
```python
class Blockchain(object):
    def __init__(self):
        self.chain = []
        self.current_transactions = []
        
    def new_block(self):
        # Creates a new Block and adds it to the chain
        pass
    
    def new_transaction(self):
        # Adds a new transaction to the list of transactions
        pass
    
    @staticmethod
    def hash(block):
        # Hashes a Block
        pass

    @property
    def last_block(self):
        # Returns the last Block in the chain
        pass
```
Blockchain类用来管理链条，它能存储交易，加入新块等，下面我们来进一步完善这些方法。

### 块结构
每个区块包含属性：索引（index），Unix时间戳（timestamp），交易列表（transactions），工作量证明（稍后解释）以及前一个区块的Hash值。

以下是一个区块的结构：
```javascript
block = {
    'index': 1,
    'timestamp': 1506057125.900785,
    'transactions': [
        {
            'sender': "8527147fe1f5426f9dd545de4b27ee00",
            'recipient': "a77f5cdfa2934df3954a5c7c7da5df1f",
            'amount': 5,
        }
    ],
    'proof': 324984774000,
    'previous_hash': "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
}
```

到这里，区块链的概念就清楚了，每个新的区块都包含上一个区块的Hash，这是关键的一点，它保障了区块链不可变性。如果攻击者破坏了前面的某个区块，那么后面所有区块的Hash都会变得不正确。不理解的话，慢慢消化，可参考{% post_link whatbc 区块链技术原理 %}

### 加入交易
接下来我们需要添加一个交易，来完善下new_transaction方法
```python
class Blockchain(object):
    ...
    
    def new_transaction(self, sender, recipient, amount):
        """
        Creates a new transaction to go into the next mined Block
        :param sender: <str> Address of the Sender
        :param recipient: <str> Address of the Recipient
        :param amount: <int> Amount
        :return: <int> The index of the Block that will hold this transaction
        """

        self.current_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
        })

        return self.last_block['index'] + 1
```

方法向列表中添加一个交易记录，并返回该记录将被添加到的区块(下一个待挖掘的区块)的索引，等下在用户提交交易时会有用。

### 创建新块

当Blockchain实例化后，我们需要构造一个创世块（没有前区块的第一个区块），并且给它加上一个工作量证明。
每个区块都需要经过工作量证明，俗称挖矿，稍后会继续讲解。

为了构造创世块，我们还需要完善new_block(), new_transaction() 和hash() 方法：

```python
import hashlib
import json
from time import time


class Blockchain(object):
    def __init__(self):
        self.current_transactions = []
        self.chain = []

        # Create the genesis block
        self.new_block(previous_hash=1, proof=100)

    def new_block(self, proof, previous_hash=None):
        """
        Create a new Block in the Blockchain
        :param proof: <int> The proof given by the Proof of Work algorithm
        :param previous_hash: (Optional) <str> Hash of previous Block
        :return: <dict> New Block
        """

        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
        }

        # Reset the current list of transactions
        self.current_transactions = []

        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, amount):
        """
        Creates a new transaction to go into the next mined Block
        :param sender: <str> Address of the Sender
        :param recipient: <str> Address of the Recipient
        :param amount: <int> Amount
        :return: <int> The index of the Block that will hold this transaction
        """
        self.current_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
        })

        return self.last_block['index'] + 1

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        """
        Creates a SHA-256 hash of a Block
        :param block: <dict> Block
        :return: <str>
        """

        # We must make sure that the Dictionary is Ordered, or we'll have inconsistent hashes
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()


```