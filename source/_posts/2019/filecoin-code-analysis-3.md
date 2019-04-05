---
title: filecoin技术架构分析三：filecoin开发网络使用
permalink: filecoin-code-analysis-3
date: 2019-02-22 16:35:33
categories:
    - FileCoin
tags:
    - FileCoin
author: 先河系统杨尉
un_reward: true
---


我是先河系统CTO杨尉，欢迎大加关注的的Github: [waynewyang](https://github.com/waynewyang)，本文是[filecoin技术架构分析系列文章](https://learnblockchain.cn/201903/11/filecoin-code-analysis-0/)第三章filecoin开发网络使用。


<!-- more -->

## filecoin开发网络使用<a name="filecoin开发网络使用"></a>
### 辅助资源

- Filecoin状态:  [https://stats.kittyhawk.wtf](https://stats.kittyhawk.wtf)
  - 网络
  	- 存储实时价格 FIL/GB/Month
  	- 当前存储容量 GB
  	- 当前网络利用率
  	- 检索平均价格
  	- 激活节点以及分布图
  	- 存储平均价格曲线
  	- best tipset
  - 存储矿工
  	- 存储矿工数量变化曲线
  	- 存储矿工共识结果
  	- 近30天的矿工top图
  - 检索矿工
  	- 平均检索价格
  	- 平均检索时间
  	- 平均检索容量
  - FIL指数
  	- 流通FIL及抵押FIL变化图
  	- FIL地址总数
  	- FIL总抵押数及对应存储空间
  	- FIL总数上升曲线图
  	- FIL区块奖励下降曲线图

- Filecoin区块浏览器：  http://user.kittyhawk.wtf:8000
  - Chain信息
  - BestBlock信息
  - Actor合约信息

- 获取FIL用于抵押或支付：http://user.kittyhawk.wtf:9797

  - 获取mock FIL代币

- Dashboard: http://user.kittyhawk.wtf:8010

  - Network概览，最新区块信息
  - 区块浏览器链接

- Genesis File: http://user.kittyhawk.wtf:8020/genesis.car

  - 创始文件，用于初始化filecoin资源

- Prometheus Endpoint: http://user.kittyhawk.wtf:9082/metrics

  - 一些技术指标，比如内存、进程、线程等

- Connected Nodes PeerID's: http://user.kittyhawk.wtf:9082/nodes

  - 连接的节点信息


### 使用<a name="使用"></a>
#### 接入filecoin开发网络<a name="接入filecoin开发网络"></a>
- 初始化filecoin资源目录

> 如果之前有运行过filecoin，想重新开始，需要删除filecoin资源，同时重新初始化是需要重新花时间同步开发网区块信息的。

```
rm -rf ~/.filecoin
```

> 初始化资源目录，使用--devnet-user表示连接至开发网

```
waynewyang:Downloads waynewyang$ go-filecoin init --devnet-user --genesisfile=http://user.kittyhawk.wtf:8020/genesis.car
initializing filecoin node at ~/.filecoin
waynewyang:Downloads waynewyang$
```

- 启动filecoin进程，接入开发网
```
go-filecoin daemon

//如果开发者，需要接入nightly devnet，请设置环境变量后启动filecoin
env FIL_USE_SMALL_SECTORS=true go-filecoin daemon
```

- 检查连接性

> go-filecoin swarm peers 查看已经连接的节点

```
waynewyang:filecoin waynewyang$ go-filecoin swarm peers
/ip4/115.238.154.84/tcp/19109/ipfs/Qmb6ZYi7GLFAje3UekGZ2LZymck7RVHKSKb1bhPzzPTQkm
/ip4/115.238.154.84/tcp/41187/ipfs/QmZ9UHdU2fwDN7emWW8AeaUdkF9fT7RwJrnbbdcQFUq9X6
/ip4/123.134.67.81/tcp/6000/ipfs/QmccrEQsauwge4BZQeN1jBtFyd7dnTi4pSDvkikMWaFccw
/ip4/123.134.67.82/tcp/6000/ipfs/QmWuA1AW4qDqztDrwo2pBgT2au67BJbGtEzWRufbc8isgn
/ip4/123.134.67.83/tcp/6000/ipfs/QmbPCabGcngs3bCgMK8dC3w9pjoyPd1NFyDhbkgLyT2eJ7
/ip4/123.134.67.85/tcp/6000/ipfs/QmUqSSZrwfSUU3vfw7D1UyKaLvEv1Ykcvx3ntvSXWaA7kj
/ip4/123.134.67.86/tcp/6000/ipfs/QmPrz2z764AVaHivM7iX2JqRw5EdE3jcZTrjwVxS4VukyK
/ip4/123.134.67.87/tcp/6000/ipfs/QmTxVFq3u7qPxsXFQdoyqPrdh6meW6JBGkSJ8HJXAiMUfh
/ip4/123.134.67.88/tcp/6000/ipfs/QmXAVRPYu57XDwJHszn9U9x1KtTwPsJBaS1mTdNZzAQVyQ
/ip4/123.134.67.89/tcp/6000/ipfs/Qmc5umx9R3bpD5VxvUmfyLoDz5wtVT43p5xjSEmTe26qTD
```

> go-filecoin ping peerID 确认连通性

```
waynewyang:filecoin waynewyang$ go-filecoin ping QmW4Z8p7FCspLV1FeTRW6uCNApUXqkm8xYYw4yuBnqBGeB
PING <peer.ID Qm*nqBGeB>
Pong received: time=245.12 ms
Pong received: time=245.61 ms
Pong received: time=251.98 ms
Pong received: time=245.69 ms
Pong received: time=255.64 ms
```

- 给你的filecoin Node设置昵称
```
waynewyang:filecoin waynewyang$ go-filecoin config heartbeat.nickname "wwwarsyuncom"
"wwwarsyuncom"
waynewyang:filecoin waynewyang$ go-filecoin config heartbeat.nickname
"wwwarsyuncom"
```

- 激活节点

```
go-filecoin config heartbeat.beatTarget "/dns4/stats-infra.kittyhawk.wtf/tcp/8080/ipfs/QmUWmZnpZb6xFryNDeNU7KcJ1Af5oHy7fB9npU67sseEjR"
```

> 在 https://stats.kittyhawk.wtf/ 查看filecoin网络，节点已经激活

![](https://img.learnblockchain.cn/2019/active.png!wl)

#### 获取Mock FIL用于测试<a name="从faucet中获取mock代币"></a>

> FIL用于矿工抵押；或者作为客户进行交易需要

- 注意：开发网目前运行的都是全节点，获取mock FIL需要建立在本地区块数据同步完成的基础上进行，必须同步完区块之后才能生效，根据个人机器配置情况，这需要较长一段时间。
- go-filecoin message wait ${MESSAGE_CID}  本质上是转账交易，wiki上说明的是等待30s，但是这是在本地区块数据同步完成的基础上才行的。
- 笔者已提交建议给官方，在wiki上更为清晰地表述。

![](https://img.learnblockchain.cn/2019/wikiissue1.png!wl)


```
waynewyang:filecoin waynewyang$ go-filecoin wallet addrs ls
fcq09qtmrxgq5sdr95gs93tx79u9uymdwfdsaphpa

waynewyang:filecoin waynewyang$ export WALLET_ADDR=`go-filecoin wallet addrs ls`

waynewyang:filecoin waynewyang$ MESSAGE_CID=`curl -X POST -F "target=${WALLET_ADDR}" "http://user.kittyhawk.wtf:9797/tap" | cut -d" " -f4`
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   232  100    50  100   182     48    177  0:00:01  0:00:01 --:--:--   177

waynewyang:go-filecoin waynewyang$ go-filecoin message wait ${MESSAGE_CID}
{
	"meteredMessage": {
		"message": {
			"to": "fcqm0u932ja5thlsy4dgpz5urlapk8qhtd0clqv5e",
			"from": "fcq09sqhrd4gls86muuenzvqdc37mzscagapjveal",
			"nonce": "rQQ=",
			"value": "1000",
			"method": "",
			"params": null
		},
		"gasPrice": "0",
		"gasLimit": "AA=="
	},
	"signature": "WKA+eRY7XCQlSmallzoFu8Tps7NZ2AOAKLRFo21rTERFYJqXJT2qEWZ8sFvm6ZShR5syb7RSAJnDp4Am2Vzp0gE="
}
{
	"exitCode": 0,
	"return": null,
	"gasAttoFIL": "0"
}
waynewyang:filecoin waynewyang$ go-filecoin wallet balance  fcq09qtmrxgq5sdr95gs93tx79u9uymdwfdsaphpa
1000
waynewyang:filecoin waynewyang$ go-filecoin wallet balance  ${WALLET_ADDR}
1000
```

####   矿工操作<a name="矿工操作"></a>
####  存储矿工<a name="存储矿工"></a>
- 创建存储矿工示例，需要等待1分钟左右
  - 抵押10个扇区的存储空间（当前默认每个扇区256MiB）
  - 支付100个FIL为担保
  - gas价格为0
  - 限制gas消耗最大为1000个FIL



```
waynewyang:filecoin waynewyang$ go-filecoin miner create 10 100 --price=0 --limit=1000 --peerid `go-filecoin id | jq -r '.ID'`
fcqjge872spqrgtm8dhlndjgfhhuxzx0y3ujvxxsl //所返回的就是矿工地址minerAddress

```

-  启动挖矿
```
waynewyang:filecoin waynewyang$ go-filecoin mining start
Started mining
```

- 收益之一: 启动挖矿之后就可以参与挖区块奖励
> 查询区块头

```
waynewyang:go-filecoin waynewyang$ go-filecoin chain head
[{"/":"zDPWYqFD2mBqLx7bwQNdeVoMxj6SC5HxzorZAoXpT6xjaythnENw"}]
```

> 查询具体区块信息

```
go-filecoin show block <blockID>

waynewyang:go-filecoin waynewyang$ go-filecoin show block zDPWYqFD2mBqLx7bwQNdeVoMxj6SC5HxzorZAoXpT6xjaythnENw
Block Details
Miner:  fcq0y72meekgwnvchwml0uzx759q25nk0rqc47ret
Weight: 293567.552
Height: 10787
Nonce:  0
```

- 收益之二：创建报价单ask

```
1) 获取矿工地址
export MINER_ADDR=`go-filecoin config mining.minerAddress | tr -d \"` 

2) 设置矿机Owner
export MINER_OWNER_ADDR=`go-filecoin miner owner $MINER_ADDR`

3) 创建报价单，价格0.000000001 FIL/byte/block, 交易费0，gas限制1000，提供2880个block空间存储

go-filecoin miner set-price --from=$MINER_OWNER_ADDR --miner=$MINER_ADDR --price=0 --limit=1000 0.000000001 2880 # output: CID of the ask

发布报价单，需要打包进去区块

waynewyang:filecoin waynewyang$ go-filecoin miner set-price --from=$MINER_OWNER_ADDR --miner=$MINER_ADDR --price=0 --limit=1000 0.000000001 15315
Set price for miner fcqjge872spqrgtm8dhlndjgfhhuxzx0y3ujvxxsl to 0.000000001.
	Published ask, cid: zDPWYqFCxL3VW3xzmHhCBqPTvhoQa53pn6DzV3uY23jNL76za1Vt.
	Ask confirmed on chain in block: zDPWYqFD7wjnj74sdB9HqupDmWmpPPEvygB14Pbo6rQC7ho2687D.

4) 查询区块信息（第三步中是zDPWYqFD7wjnj74sdB9HqupDmWmpPPEvygB14Pbo6rQC7ho2687D）可以找到对应报价单信息

waynewyang:filecoin waynewyang$ go-filecoin show block zDPWYqFD7wjnj74sdB9HqupDmWmpPPEvygB14Pbo6rQC7ho2687D --enc=json
{"miner":"fcqnam6n2qml2eyngws25srzvhcdf0t8gcgrsvnrk","ticket":"AM0p5IC9ph+o9dTwd/MXYdeOJW25PfDwhTgonNRkSP4=","parents":[{"/":"zDPWYqFCwNWHJXdeXcjx7ipUvRKFq5WhLbtSm6ESuNufkLuGiAgW"}],"parentWeight":"kujBrQE=","height":"2Hc=","nonce":"AA==","messages":[{"meteredMessage":{"message":{"to":"fcqp606qfk5gwmq6ac24g4mhv3cr8zzf67vqkpulh","from":"fcqr89lj0lvduj475zw002j6q5yrl30ks7uep2p5e","nonce":"Ag==","value":"215.6046624","method":"createChannel","params":"glYAABXMs4C0hXqcW94YGyVKxii6SLQhQ6HoAg=="},"gasPrice":"0","gasLimit":"rAI="},"signature":"vHzwO73TvM8MW1FKg8Qgfy/IP+wfJIQkEK0ExBB75gBbPMhv6GiU4aBq1T2Gb2OeMfrch8Zg3EFOJd0uUJltwAE="},{"meteredMessage":{"message":{"to":"fcqafmqgvzkzpvc6wjxecm7gsweuawjv8t6falk6r","from":"fcqr89lj0lvduj475zw002j6q5yrl30ks7uep2p5e","nonce":"Aw==","value":"100","method":"createMiner","params":"g0EKWEEEiA8ArEoyzhjWwijpTWYqDsOFfwxa2F0pUfOyRI/6yY28OD4QHcwUdb3a9omX9DNxVzdS2a8pWgiLNowe9wYVcFgiEiD3rKfg/NyDnrLF9IGxfp6U72jZxuniXlPcv5SG5OZHrA=="},"gasPrice":"0","gasLimit":"6Ac="},"signature":"/X/87zil8InOeLeQ6kqkqnpg7mP/e5jMaaVS4LRMIdYN84HTbABBpvt6quRqVQsadJnqOW7mn+6NA+2d9FDjPAA="},{"meteredMessage":{"message":{"to":"fcqp606qfk5gwmq6ac24g4mhv3cr8zzf67vqkpulh","from":"fcqmqr5f2a5qnwnvftpuzd6sjfy5tcq5dd0k24h85","nonce":"Ug==","value":"0.008596","method":"createChannel","params":"glYAAIVV3axUhfe7OGwwSH/IIONRcbinQ/OWAQ=="},"gasPrice":"0","gasLimit":"rAI="},"signature":"dxhSaVRvFBtdrbnEByza7a5JqLzm6n6rVZYGuFN6zegCTMDKbGGh++EvVmWo0WSbdcUo2vB/jFTgqzATh9+1NQA="},{"meteredMessage":{"message":{"to":"fcqugc6nql2eqglfwq0dw7ep7l9a07jacqgstely7","from":"fcq0nmdcq7updgwc3uh2lz2rnjms7gprdggcvxjqj","nonce":"BA==","value":null,"method":"commitSector","params":"hUECWCCFzRGqHyJ3VWk3GueHzfkcWF218hOqRGtLxsJ0oJ3pXVgg6qrxCGo6SSjyUSbJWVKPKGaY/wrymC21t5LSScCNpQBYIOeZkdzp7lPt8Fh/Sdl9YqJ8BCaJ7etWEnDnLzRnV/geWQGAlTMp95t1Hh61eFBmzy6Ex/Ee1cso7Cethz+Z2EHCfhi5UzOMeLqeA/Wfypcnrw15mF4OrYR8648RXx6jp8svbgZ6Jg9fP/q0RukszZ/SD9f0pCMg2N/xt5hVIPG7jowSCfkj//CpdRj1GRPLzXvzyWmW4SgKR4lNpJNnmuiXSe8nYLsZgY2v8xy4NB448e/slxh7D4NQPanCoN3WO10oBR42ZxeCZY6stq+JfwucGr5OajgXSK2rGwz/Sj+GYpMbtgpfxSd4Z+jZ6mnoY03NaIHvwnDKchRz797lFL3so6AQRRnctN3Pl7LSn52YA0EOkmhJLMev6DKBWEqSfjXTY4AJSJ7RmGq88BXoHzwGjndRj0QHFtSTjHIoxF9uN86zB6gfSS+A7ZviuTvfturtKee243b9OIojIf2ne2hF8+7PSIwCp5FPLXEqR/UtXnJ6pxjBKhF36k3FRdzsxo52DMImgPhluGWI3xRhpIMmFNDMNynOBQ9F6mnR8fRBdPKB"},"gasPrice":"0","gasLimit":"rAI="},"signature":"hEluqbFG8TTSeeJyfOs10fZD/gOsrnFV8QgRAb4mhSFlzYpcijT9ye1yUYam5hcsW1eq1MFRfVGHhqYYUZ4LYwA="},{"meteredMessage":{"message":{"to":"fcqjge872spqrgtm8dhlndjgfhhuxzx0y3ujvxxsl","from":"fcqm0u932ja5thlsy4dgpz5urlapk8qhtd0clqv5e","nonce":"AQ==","value":"0","method":"addAsk","params":"gkWAlOvcA0I70w=="},"gasPrice":"0","gasLimit":"6Ac="},"signature":"IGUvf7CZ8lKDSTyzbg5kyArIPv8TIoFEWpA3ihRC7I86NFvgebCdEKQ6PqYhTJj1GQK/+JF28kCinXFN/9G8FgE="},{"meteredMessage":{"message":{"to":"fcqp606qfk5gwmq6ac24g4mhv3cr8zzf67vqkpulh","from":"fcqsvmdzpy5mjc9m0cuh6uhmprr6gk5w2zcrnjy02","nonce":"Aw==","value":"0.0000301989888","method":"createChannel","params":"glYAAGsLRe4dsJwsvfE2+dkEh1DPX11jQ+OdAQ=="},"gasPrice":"0","gasLimit":"rAI="},"signature":"Zg5kUOtEZ9Um+mGKicHaqTCaORppGv5KAaSlTpN/qTcoTptRUP3ZbQ5YOL7zjTG6aF7Y4r0Ck0NsnG0J/i2B0AA="},{"meteredMessage":{"message":{"to":"fcqp606qfk5gwmq6ac24g4mhv3cr8zzf67vqkpulh","from":"fcqrqtfcug5hlx7gugvwj0f2dyx6j9cxdn0ynmpu3","nonce":"Ag==","value":"0","method":"createChannel","params":"glYAAJsQ6e5i/M0X04YZwzl3VWckPu4RQ62HAQ=="},"gasPrice":"0","gasLimit":"rAI="},"signature":"oisXV83sTFkJw7y5KbO5fLhx2oa48qZKAVwX+1fIvWUDgm5PQNDddPeCkklPg2L+fmp4wL2fLF9R2qPRciLUfAA="}],"stateRoot":{"/":"zdpuAvwpuqNR4J6PJDqGfF5GbyjWarD1BhujTUfyREMHSY1eF"},"messageReceipts":[{"exitCode":0,"return":["Ag=="],"gasAttoFIL":"0"},{"exitCode":0,"return":["AAA2Qrupiubk6ljOMnMUrnnHKaVXmQ=="],"gasAttoFIL":"0"},{"exitCode":0,"return":["0gA="],"gasAttoFIL":"0"},{"exitCode":0,"return":null,"gasAttoFIL":"0"},{"exitCode":0,"return":[""],"gasAttoFIL":"0"},{"exitCode":0,"return":["Aw=="],"gasAttoFIL":"0"},{"exitCode":0,"return":["Ag=="],"gasAttoFIL":"0"}],"proof":[177,165,90,219,1,18,240,190,113,56,243,22,167,201,232,75,124,152,130,111,74,132,5,192,33,191,102,220,102,9,99,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}

//查询最新区块信息
waynewyang:go-filecoin waynewyang$ go-filecoin show block `go-filecoin chain head --repodir=~/.filecoin2/ |jq -r '.[0]'|jq -r '.["/"]'`
Block Details
Miner:  fcq973y2y7hvcce8zkwds7r2847xmfjvdecn98lws
Weight: 134386.836
Height: 5013
Nonce:  0

5) 获取所有矿工的报价信息
go-filecoin client list-asks --enc=json | jq
```

> 现在默认是只要客户出价高于矿工报价，默认接受交易。

- 停止挖矿

```
go-filecoin mining stop
rm -rf ~/.filecoin  //删除filecoin矿工实例，区块同步也被删除，再次实例化，需要再次同步区块
```

####  检索矿工<a name="检索矿工"></a>

> 暂未发现支持，目前可以自己的供应商（具体矿工）处获取；后面通过更深入的分析之后另行补充。

#### 修复矿工<a name="修复矿工"></a>

> 修复矿工的概念是白皮书之后提出的，后面继续深入分析之后再另行补充。

####  客户操作<a name="客户操作"></a>
####  存储客户<a name="存储客户"></a>

- filecoin 与IPFS数据结构是兼容的

```
//创建测试文件
waynewyang:test waynewyang$ echo "Hi my name is $USER"> hello.txt
waynewyang:test waynewyang$ cat hello.txt 
Hi my name is waynewyang

//导入filecoin本地资源库
waynewyang:test waynewyang$ export CID=`go-filecoin client import ./hello.txt`
waynewyang:test waynewyang$ echo $CID
Qmchgh3N3kxWiaZ2cp9PbV93i77H3K8KtQCBTeVR5Q7wzs

//这里会发现用IPFS上传得到的CID也是一样
waynewyang:test waynewyang$ ipfs add hello.txt 
added Qmchgh3N3kxWiaZ2cp9PbV93i77H3K8KtQCBTeVR5Q7wzs hello.txt
 25 B / 25 B [========================================================================] 100.00%

//用go-filecoin或者IPFS命令获取数据，结果一致
waynewyang:test waynewyang$ go-filecoin client cat $CID
Hi my name is waynewyang
waynewyang:test waynewyang$ ipfs block get $CID
Hi my name is waynewyang
```

- 导入测试数据
```
waynewyang:sample-data waynewyang$ export CID=`go-filecoin client import camel.jpg`
waynewyang:sample-data waynewyang$ go-filecoin client cat $CID > image.png && open image.png
waynewyang:sample-data waynewyang$ echo $CID
QmeubcGKFXpafFT4xRFGf3NqDRzJUVoAqe5sh1ugbRPZ7u
```

- 查询矿工的报价单

```
waynewyang:sample-data waynewyang$ go-filecoin client list-asks --enc=json | jq
{
  "Miner": "fcqvnwlanfu7ecflnp3rc5gm0ecdamvxgvlawref4",
  "Price": "0.000000001",
  "Expiry": 7079,
  "ID": 0,
  "Error": null
}
{
  "Miner": "fcqsmut6jnwchq0qlc3t6v44pzgf8l49lg6r8wl4a",
  "Price": "0.000000001",
  "Expiry": 16522,
  "ID": 0,
  "Error": null
}
{
  "Miner": "fcqsmut6jnwchq0qlc3t6v44pzgf8l49lg6r8wl4a",
  "Price": "0.000000000000000001",
  "Expiry": 18753,
  "ID": 1,
  "Error": null
}
{
  "Miner": "fcqghrce7vaf6czj54x5qke0mn2uzzg8ckvgvcjpe",
  "Price": "0.000000001",
  "Expiry": 14404,
  "ID": 0,
  "Error": null
}
......
```

- 下单

```
go-filecoin client propose-storage-deal <miner> <data> <ask> <duration>

<miner> address of the miner from list-asks
<data> CID of the imported data that you want to store
<ask> ID of the ask, also from list-asks (usually 0)
<duration> how long you want to store (in # of ~30sec blocks). For example, storing for 1 day (2 blocks/min * 60 min/hr * 24 hr/day) = 2880 blocks.
```

- 发送数据和支付

```
1 支付

1）支付到paych中
2）定期向矿工付款

2 数据

1）未密封完的数据称之为暂存区
2）密封完成后阶段性支付
```

####  检索客户<a name="检索客户"></a>

> 现在是指定所对应的存储矿工进行检索，暂未发现更多支持，在后面的深入分析中会继续跟进。

- 查询订单状态，必须是密封，posted交易结束后才能查询

```
go-filecoin client query-storage-deal < dealID >
```

- 检索

```
go-filecoin retrieval-client retrieve-piece < minerAddress >  < CID > 
```

###  filecoin合约<a name="filecoin合约"></a>
#### 文件合约<a name="文件合约"></a>

> 其实现在的创建存储矿工，以及矿工创建报价、存储客户提交订单存储，这些笔者认为属于filecoin文件合约的范畴。

> 与以太坊类似，以太坊抽象出了代币合约以及通用智能合约； 而filecoin则是抽象出了文件合约和通用智能合约。


####  智能合约<a name="智能合约"></a>

> 暂未发现支持，在后面的深入分析中会继续跟进。


### 单机运行多个filecoin节点<a name="单机运行多个filecoin节点"></a>
#### 修改资源目录和服务端口的方式<a name="修改资源目录和服务端口的方式"></a>

- go-filecoin init的时候，通过 ‘--repodir=所指定资源目录路径’ 命令进行初始化目录资源，后面的其他命令同样需要所指定资源目录路径进行操作。

- 修改资源目录下的config.json文件，将默认的端口予以修改，避免与另外的本机实例相冲突。


#### 容器部署方式<a name="容器部署方式"></a>

- 可以打包成docker镜像，有兴趣的朋友可以自行尝试。

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客
