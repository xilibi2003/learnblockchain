---
title: Python实现一条基于POS算法的区块链
permalink: python-blockchain-with-pos
date: 2018-08-07 20:44:00
categories: 比特币
tags:
    - 区块链
    - 权益证明
    - Python
author: Magic_陈
---


# 区块链中的共识算法

在比特币公链架构解析中，就曾提到过为了实现去中介化的设计，比特币设计了一套共识协议，并通过此协议来保证系统的稳定性和防攻击性。 并且我们知道，截止目前使用最广泛，也是最被大家接受的共识算法，是我们先前介绍过的POW(proof of work)[工作量证明算法](https://learnblockchain.cn/2017/11/04/bitcoin-pow/)。目前市值排名前二的比特币和以太坊也是采用的此算法。

<!-- more -->

虽然POW共识算法取得了巨大的成功，但对它的质疑也从来未曾停止过。 其中最主要的一个原因就是电力消耗。据不完全统计，基于POW的挖矿机制所消耗的电量是非常巨大的，甚至比绝大多数国家耗电量还要多。这对我们的资源造成了极大的浪费，此外随着比特大陆等公司的强势崛起，造成了算力的高度集中。


基于以上种种原因，更多的共识算法被提出来 POS、DPOS、BPFT等等。 今天我们就来认识POS(proof of stake)算法。

Proof of stake，译为权益证明。你可能已经猜到了，权益证明简单理解就是拥有更多token的人，有更大的概率获得记账权利，然后获得奖励。 这个概率具体有多大呢？ 下面我们在代码实现中会展示，分析也放在后面。 当然，POS是会比POW更好吗？ 会更去中心化吗？ 现在看来未必，所以我们这里也不去对比谁优谁劣。 我们站在中立的角度，单纯的来讨论讨论POS这种算法。

# 代码实战
## 生成一个Block
既然要实现POS算法，那么就难免要生成一条链，链又是由一个个Block生成的，所以下面我们首先来看看如何生成Block，当然在前面的内容里面，关于如何生成Block，以及交易、UTXO等等都已经介绍过了。由于今天我们的核心是实现POS，所以关于Block的生成，我们就用最简单的实现方式，好让大家把目光聚焦在核心的内容上面。

我们用三个方法来实现生成一个合法的区块
- calculate_hash  计算区块的hash值
- is_block_valid  校验区块是否合法
- generate_block  生成一个区块

```python

from hashlib import sha256
from datetime import datetime

def generate_block(oldblock, bpm, address):
    """

    :param oldblock:
    :param bpm:
    :param address:
    :return:
    """
    newblock = {
        "Index": oldblock["Index"] + 1,
        "BPM": bpm,
        "Timestamp": str(datetime.now()),
        "PrevHash": oldblock["Hash"],
        "Validator": address
    }

    newblock["Hash"] = calculate_hash(newblock)
    return newblock


def calculate_hash(block):
    record = "".join([
        str(block["Index"]),
        str(block["BPM"]),
        block["Timestamp"],
        block["PrevHash"]
    ])

    return sha256(record.encode()).hexdigest()


def is_block_valid(newblock, oldblock):
    """

    :param newblock:
    :param oldblock:
    :return:
    """

    if oldblock["Index"] + 1 != newblock["Index"]:
        return False

    if oldblock["Hash"] != newblock["PrevHash"]:
        return False

    if calculate_hash(newblock) != newblock["Hash"]:
        return False

    return True
```

这里为了更灵活，我们没有用类的实现方式，直接采用函数来实现了Block生成，相信很容易看懂。

## 创建一个TCP服务器
由于我们需要用权益证明算法来选择记账人，所以需要从很多Node(节点)中选择记账人，也就是需要一个server让节点链接上来，同时要同步信息给节点。因此需要一个TCP长链接。

```python
from socketserver import BaseRequestHandler, ThreadingTCPServer

def run():
    # start a tcp server
    serv = ThreadingTCPServer(('', 9090), HandleConn)
    serv.serve_forever()
```
在这里我们用了python内库socketserver来创建了一个TCPServer。 需要注意的是，这里我们是采用的多线程的创建方式，这样可以保证有多个客户端同时连接上来，而不至于被阻塞。当然，这里这个server也是存在问题的，那就是有多少个客户端连接，就会创建多少个线程，更好的方式是创建一个线程池。由于这里是测试，所以就采用更简单的方式了。

相信大家已经看到了，在我们创建TCPServer的时候，使用到了HandleConn，但是我们还没有定义，所以接下来我们就来定义一个HandleConn

##消息处理器
下面我们来实现Handler函数，Handler函数在跟Client Node通信的时候，需要我们的Node实现下面的功能
- Node可以输入balance（token数量）  也就是股权数目
- Node需要能够接收广播，方便Server同步区块以及记账人信息
- 添加自己到候选人名单 （候选人为持有token的人）
- 输入BPM生成Block
- 验证一个区块的合法性

感觉任务还是蛮多的，接下来我们看代码实现

```python
import threading
from queue import Queue, Empty

# 定义变量
block_chain = []
temp_blocks = []
candidate_blocks = Queue()  # 创建队列，用于线程间通信
announcements = Queue()
validators = {}

My_Lock = threading.Lock()

class HandleConn(BaseRequestHandler):
    def handle(self):
        print("Got connection from", self.client_address)

        # validator address
        self.request.send(b"Enter token balance:")
        balance = self.request.recv(8192)
        try:
            balance = int(balance)
        except Exception as e:
            print(e)

        t = str(datetime.now())
        address = sha256(t.encode()).hexdigest()
        validators[address] = balance
        print(validators)

        while True:
            announce_winner_t = threading.Thread(target=annouce_winner, args=(announcements, self.request,),
                                                 daemon=True)
            announce_winner_t.start()

            self.request.send(b"\nEnter a new BPM:")
            bpm = self.request.recv(8192)
            try:
                bpm = int(bpm)
            except Exception as e:
                print(e)
                del validators[address]
                break

            # with My_Lock:
            last_block = block_chain[-1]

            new_block = generate_block(last_block, bpm, address)

            if is_block_valid(new_block, last_block):
                print("new block is valid!")
                candidate_blocks.put(new_block)

            self.request.send(b"\nEnter a new BPM:\n")

            annouce_blockchain_t = threading.Thread(target=annouce_blockchain, args=(self.request,), daemon=True)
            annouce_blockchain_t.start()

```

这段代码，可能对大多数同学来说是有难度的，在这里我们采用了多线程的方式，同时为了能够让消息在线程间通信，我们使用了队列。 这里使用队列，也是为了我们的系统可以更好的拓展，后面如果可能，这一节的程序很容易拓展为分布式系统。 将多线程里面处理的任务拆分出去成独立的服务，然后用消息队列进行通信，就是一个简单的分布式系统啦。（是不是很激动？）

由于这里有难度，所以代码还是讲一讲吧

```python
    # validator address
        self.request.send(b"Enter token balance:")
        balance = self.request.recv(8192)
        try:
            balance = int(balance)
        except Exception as e:
            print(e)

        t = str(datetime.now())
        address = sha256(t.encode()).hexdigest()
        validators[address] = balance
        print(validators)
```
这一段就是我们提到的Node 客户端添加自己到候选人的代码，每链接一个客户端，就会添加一个候选人。 这里我们用添加的时间戳的hash来记录候选人。 当然也可以用其他的方式，比如我们代码里面的client_address 


```python

announce_winner_t = threading.Thread(target=annouce_winner, args=(announcements, self.request,),
                                                daemon=True)
        announce_winner_t.start()

def annouce_winner(announcements, request):
    """

    :param announcements:
    :param request:
    :return:
    """
    while True:
        try:
            msg = announcements.get(block=False)
            request.send(msg.encode())
            request.send(b'\n')
        except Empty:
            time.sleep(3)
            continue


```

然后接下来我们起了一个线程去广播获得记账权的节点信息到所有节点。

```python
self.request.send(b"\nEnter a new BPM:")
            bpm = self.request.recv(8192)
            try:
                bpm = int(bpm)
            except Exception as e:
                print(e)
                del validators[address]
                break

            # with My_Lock:
            last_block = block_chain[-1]

            new_block = generate_block(last_block, bpm, address)

            if is_block_valid(new_block, last_block):
                print("new block is valid!")
                candidate_blocks.put(new_block)
```
根据节点输入的BPM值生成一个区块，并校验区块的有效性。 将有效的区块放到候选区块当中，等待记账人将区块添加到链上。


```python
annouce_blockchain_t = threading.Thread(target=annouce_blockchain, args=(self.request,), daemon=True)
        annouce_blockchain_t.start()

def annouce_blockchain(request):
    """

    :param request:
    :return:
    """
    while True:
        time.sleep(30)
        with My_Lock:
            output = json.dumps(block_chain)
        try:
            request.send(output.encode())
            request.send(b'\n')
        except OSError:
            pass
```

最后起一个线程，同步区块链到所有节点。


看完了，节点跟Server交互的部分，接下来是最重要的部分，

## POS算法实现

```python
def pick_winner(announcements):
    """
    选择记账人
    :param announcements:
    :return:
    """
    time.sleep(10)

    while True:
        with My_Lock:
            temp = temp_blocks

        lottery_pool = []  #

        if temp:
            for block in temp:
                if block["Validator"] not in lottery_pool:
                    set_validators = validators
                    k = set_validators.get(block["Validator"])
                    if k:
                        for i in range(k):
                            lottery_pool.append(block["Validator"])

            lottery_winner = choice(lottery_pool)
            print(lottery_winner)
            # add block of winner to blockchain and let all the other nodes known
            for block in temp:
                if block["Validator"] == lottery_winner:
                    with My_Lock:
                        block_chain.append(block)

                    # write message in queue.
                    msg = "\n{0} 赢得了记账权利\n".format(lottery_winner)
                    announcements.put(msg)

                    break

        with My_Lock:
            temp_blocks.clear()
```
这里我们用pick_winner 来选择记账权利，我们根据token数量构造了一个列表。 一个人获得记账权利的概率为：
```
p = mount['NodeA']/mount['All']
```
文字描述就是其token数目在总数中的占比。 比如总数有100个，他有10个，那么其获得记账权的概率就是0.1， 到这里核心的部分就写的差不多了，接下来，我们来添加节点，开始测试吧 

# 测试POS的记账方式
在测试之前，起始还有一部分工作要做，前面我们的run方法需要完善下，代码如下：

```python
def run():
    # create a genesis block
    t = str(datetime.now())
    genesis_block = {
        "Index": 0,
        "Timestamp": t,
        "BPM": 0,
        "PrevHash": "",
        "Validator": ""
    }

    genesis_block["Hash"] = calculate_hash(genesis_block)
    print(genesis_block)
    block_chain.append(genesis_block)

    thread_canditate = threading.Thread(target=candidate, args=(candidate_blocks,), daemon=True)
    thread_pick = threading.Thread(target=pick_winner, args=(announcements,), daemon=True)

    thread_canditate.start()
    thread_pick.start()

    # start a tcp server
    serv = ThreadingTCPServer(('', 9090), HandleConn)
    serv.serve_forever()

def candidate(candidate_blocks):
    """

    :param candidate_blocks:
    :return:
    """
    while True:
        try:
            candi = candidate_blocks.get(block=False)
        except Empty:
            time.sleep(5)
            continue
        temp_blocks.append(candi)

if __name__ == '__main__':
    run()
```
# 添加节点连接到TCPServer
为了充分减少程序的复杂性，tcp client我们这里就不实现了，可以放在后面拓展部分。 毕竟我们这个系统是很容易扩展的，后面我们拆分了多线程的部分，在实现tcp client就是一个完整的分布式系统了。

所以，我们这里用linux自带的命令 nc，不知道nc怎么用的同学可以google或者 man nc
![](https://img.learnblockchain.cn/2018/de1ec95397b1f627c1ded8fc3ac256e1.png!wl)

- 启动服务    运行 python pos.py  
- 打开3个终端
- 分别输入下面命令
    - nc localhost 9090

终端如果输出
```
Enter token balance: 
```
说明你client已经链接服务器ok啦.

# 测试POS的记账方式
接下来依次按照提示操作。 balance可以按心情来操作，因为这里是测试，我们输入100，
紧接着会提示输入BPM，我们前面提到过，输入BPM是为了生成Block，那么就输入吧，随便输入个9. ok， 接下来就稍等片刻，等待记账。
输出如同所示
![](https://img.learnblockchain.cn/2018/4eee010dfd46e7672d48d063b08cae47.png!wl)
依次在不同的终端，根据提示输入数字，等待消息同步。

# 生成区块链
下面是我这边获得的3个block信息。
![](https://img.learnblockchain.cn/2018/1e5f93c93cc2bc5443902b89abd4ac02.png!wl)

# 总结
在上面的代码中，我们实现了一个完整的基于POS算法记账的链，当然这里有许多值得扩展与改进的地方。
- python中多线程开销比较大，可以改成协程的方式
- TCP建立的长链接是基于TCPServer，是中心化的方式，可以改成P2P对等网络
- 链的信息不够完整
- 系统可以拓展成分布式，让其更健壮

大概列了以上几点，其他还有很多可以拓展的地方，感兴趣的朋友可以先玩玩， 后者等到我们后面的教程。 （广告打的措手不及，哈哈）

当然了，语言不是重点，所以在这里，我也实现了go语言的版本[源码地址](https://github.com/csunny/argo/tree/master/src/pos)

go语言的实现感觉要更好理解一点，也显得要优雅一点。这也是为什么go语言在分布式领域要更抢手的原因之一吧！


# 项目地址
- https://github.com/csunny/py-bitcoin/


# 参考
- https://medium.com/@mycoralhealth/code-your-own-proof-of-stake-blockchain-in-go-610cd99aa658
  
我的**[专栏](https://xiaozhuanlan.com/eosio)**专注区块链底层技术开发，P2P网络、加密技术、MerkleTree、DAG、DHT等等，另外对于分布式系统的学习也很有帮助。欢迎大家交流。
