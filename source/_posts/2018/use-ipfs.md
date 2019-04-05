---
title: IPFS 使用入门
permalink: use-ipfs
date: 2018-12-25 19:16:27
categories:
    - IPFS
tags:
    - IPFS
author: Tiny熊
---

在[上一篇文章](https://learnblockchain.cn/2018/12/12/what-is-ipfs/)介绍了IPFS要做什么， 本篇文章介绍下IPFS怎么用， 按照本站的风格，我不会仅仅把一个个命令列出来，同时会说明命令在后面为我们做了什么。

<!-- more -->

## IPFS 安装

要使用IPFS， 第一步肯定是先把IPFS安装好，IPFS在Mac OS X 、Linux及Window平台均有提供， 可以通过这个[链接](https://dist.ipfs.io/#go-ipfs)下载对应平台可执行文件的压缩包。

对于Mac OS X 及 Linux 平台，使用一下命令进行安装：

```bash
$ tar xvfz go-ipfs.tar.gz
$ cd go-ipfs
$ ./install.sh
```

上面先使用tar 对压缩包进行解压，然后执行install.sh 进行安装，安装脚本install.sh其实就是把可执行文件`ipfs`移动到`$PATH`目录下。安装完成之后，可以在命令行终端敲入`ipfs`试试看，如果显示一堆命令说明，则说明IPFS安装成功。

在Windows平台也是类似，把`ipfs.exe`移动到环境变量`%PATH%`指定的目录下。


## IPFS 基本用法

### IPFS初始化

安装完成之后，要使用IPFS第一步是要对IPFS进行初始化，使用`ipfs init`进行初始化

```
> ipfs init
initializing ipfs node at /Users/Emmett/.ipfs
generating 2048-bit RSA keypair...done
peer identity: QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva
to get started, enter:

  ipfs cat /ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme
```

上面是执行命令即对应输出，在执行`ipfs init`进行初始化时，会有一下行为：

1. 生成一个秘钥对并产生对应的节点id， 即命令提示：`peer identity`后面的hash值。

  > 节点的id用来标识和连接一个节点，每个节点的id是独一无二的， 因此大家看到的提示也会和我的不一样。

2. 在当前用户的主目录（~ 目录）下产生一个.ipfs 的隐藏目录，这个目录称之为库（repository）目录，ipfs 所有相关的数据都会放在这个目录下。
  如同步文件数据块放在.ipfs/blocks 目录，秘钥在.ipfs/keystore 目录，ipfs配置文件为：.ipfs/config。



#### IPFS 配置修改

在IPFS初始化之后，可以根据需要修改配置（可选），修改方法如下：

```
cd ~/.ipfs
export EDITOR=/usr/bin/vim
ipfs config edit
```

或者直接编辑 ~/.ipfs/config 文件。


### 上传文件到IPFS

我们先创建一个upchain.pro.txt文件，可以使用如下方式：

```
> echo "登链学院：区块链教育领先品牌" >> upchain.pro.txt
```

ipfs 使用add 命令来添加内容到节点中，  在命令行输入：

```
> ipfs add upchain.pro.txt
added QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi upchain.pro.txt
 43 B / 43 B [=====================================================] 100%
```

当它文件添加到节点时，会为文件生成唯一的hash: QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi, 可以使用ipfs cat 查看文件的内容：

```
> ipfs cat QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi
登链学院：区块链教育领先品牌
```

注意，此时文件仅仅是上传在本地的IPFS节点中，如果需要把文件同步到网络，就需要开启 daemon 服务， 使用命令：

```
> ipfs daemon
Initializing daemon...
go-ipfs version: 0.4.18-
Repo version: 7
System version: amd64/darwin
Golang version: go1.11.1
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/192.168.8.105/tcp/4001
Swarm listening on /ip6/2408:84f3:82e:cfcd:409:fee2:e261:4dc3/tcp/4001
Swarm listening on /ip6/2408:84f3:82e:cfcd:a9c6:116b:349f:8c2b/tcp/4001
Swarm listening on /ip6/2408:84f3:82e:cfcd:ec89:145d:cf27:4/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
Swarm listening on /ip6/fd1d:43b:e89b:eb9b:c405:56af:8f52:67df/tcp/4001
Swarm listening on /p2p-circuit
Swarm announcing /ip4/127.0.0.1/tcp/4001
Swarm announcing /ip4/192.168.8.105/tcp/4001
Swarm announcing /ip6/2408:84f3:82e:cfcd:409:fee2:e261:4dc3/tcp/4001
Swarm announcing /ip6/2408:84f3:82e:cfcd:a9c6:116b:349f:8c2b/tcp/4001
Swarm announcing /ip6/2408:84f3:82e:cfcd:ec89:145d:cf27:4/tcp/4001
Swarm announcing /ip6/::1/tcp/4001
Swarm announcing /ip6/fd1d:43b:e89b:eb9b:c405:56af:8f52:67df/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready

```

开启 daemon 之后，Swarm 就会尝试连接其他的节点，同步数据，同时在本地还会开启两个服务：API服务及Web网关服务，下面分别介绍下：

1. API服务，默认在5001端口，可以通过 http://localhost:5001/webui 进行访问，界面如：

![](https://img.learnblockchain.cn/2018/15458049832966.jpg!wl)

这也是IPFS的一个Web版的管理控制台， 可以通过这个控制台添加文件，查看节点连接情况等等。

2.  网关服务，默认在8080端口， 由于当前浏览器还不支持通过IPFS协议（ipfs://）来访问文件，如果我们要在浏览器里访问文件的话，就需要借助于IPFS 提供的网关服务，由浏览器先访问到网关，网关去获取IPFS网络杀过了的文件。 有了网关服务，就可以通过这个链接：`http://localhost:8080/ipfs/QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi` 来访问刚刚上传到ipfs 的文件。

> ipfs 也提供了官方的网关服务：https://ipfs.io/， 因此也可以通过 https://ipfs.io/ipfs/QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi （需要翻墙）来访问刚刚上传到ipfs 的文件。



### 上传目录到IPFS

我们先创建一个文件夹upchain, 并把之前的 upchain.pro.txt 放进目录。

```
> mkdir upchain
> mv upchain.pro.txt  upchain
```

上传目录到IPFS 需要在使用 add 命令时加上 -r ，如下：

```
> ipfs add -r upchain
added QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi upchain/upchain.pro.txt
added QmQYpGRFBpHVzoShpwU5C3XgGAxJKqY83X8VXfMbyktdbP upchain
 43 B / 43 B [===========================================================================] 100.00%
```

在上传时文件夹，文件夹也会生成一个对应的hash，可以通过hash后接文件名来进行访问， 如：

```
>ipfs cat QmQYpGRFBpHVzoShpwU5C3XgGAxJKqY83X8VXfMbyktdbP/upchain.pro.txt
登链学院：区块链教育领先品牌
```

在浏览器可以链接：`http://127.0.0.1:8080/ipfs/QmQYpGRFBpHVzoShpwU5C3XgGAxJKqY83X8VXfMbyktdbP/upchain.pro.txt` 来访问。

通过上传目录的方式，可以把整个静态网站的根目录上传到IPFS网络，这样就可以省去托管服务器，例如可以直接通过以下链接访问深入浅出区块链博客：
https://ipfs.io/ipfs/QmaFWgfpRNzeLgfDrH33BuBdiauRTejnF3Yw9AuCphq2ua/index.html


## 使用IPNS解决文件更新问题

因为IPFS在IPFS中，对一个文件的内容修改后（如升级），会生成一个完全不同的新Hash，使用IPNS就可以利用同一个链接总是指向更新的内容，其实使用也很简单，只需要每次在内容更新之后使用ipfs name publish `hash` 发布到节点。 

例如把upchain.pro.txt发布到节点，使用下面的命令:
```
> ipfs name publish QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi
Published to QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva: /ipfs/QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi
```

命令中的`QmQgMZKqHzyEdyJja5ioF8WaXrbUDVjqhJDoaUKDymgioi`是`upchain.pro.txt`的hash, 命令提示中的`QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva`是当前节点id(大家可以回看一个前面ipfs init 的输出)。

发布之后就可以使用http://127.0.0.1:8080/ipns/QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva 或 https://ipfs.io/ipns/QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva 来访问upchain.pro.txt的内容，如图：

![](https://img.learnblockchain.cn/2018/15458309509991.jpg!wl)

其实理想下是使用 ipns://QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva 来访问，通过网站还是前面提到的浏览器暂不支持ipfs协议。

现在我们来更新一下upchain.pro.txt 加入文字："创办人：Tiny熊"

```
> echo "创办人：Tiny熊" >>  upchain.pro.txt
> ipfs add upchain.pro.txt
added QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5S upchain.pro.txt
 63 B / 63 B [=============================================================] 100.00%
```

重新发布一下：

```
> ipfs name publish QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5S
Published to QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva: /ipfs/QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5S
```

再次访问 http://127.0.0.1:8080/ipns/QmYM36s4ut2TiufVvVUABSVWmx8VvmDU7xKUiVeswBuTva （这个链接和上面的链接一样）可以看到内容更新了。

![](https://img.learnblockchain.cn/2018/15458322289639.jpg!wl)


如果我们要查询 节点id 指向的hash 可以使用 `ipfs name resolve ` 进行查询：
```
> ipfs name resolve
/ipfs/QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5
```

有一点值得大家注意： 节点id其实是公钥的hash，它的关联信息是需要经过私钥签名才可以发布，因此只有我们自己才可以更新节点的指向。

如果我们有多个站点需要更新，可以新产生一个秘钥对，使用新的key 发布，如：

```
> ipfs key gen --type=rsa --size=2048 mykey
QmVZvdYEsdfHSR43Qm1fY8eDFrhB3UNZ2oVyEuVUH3VHrg
> ipfs name publish --key=mykey  hashxxx 
```

## Pinning


Pinning 在IPFS里是一个很重要的概念，当我们每次请求一个网络上的内容的时候，IPFS总是会把内容先同步的本地提供服务，而为了防止 IPFS 存储空间不停增长，实际上使用cache 机制来处理文件， 如果文件在一段时间内没有被使用，文件会被”回收“。 Pinning 的作用就是把文件”钉“住，确保文件在本地不被”回收“。 如果是重要的文件，就可以使用 Pinning 防止文件被删除。

当我们使用ipfs add 添加文件时，默认会进行Pinning(使用其他命令获取的文件不会进行pinning），

IPFS 提供了pin命令进行Pinning操作, 比如我们查询下某一个hash 是否被pin:

```
> ipfs pin ls QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5S
QmUUiDN6tWtj89xmUw1iCK2NczBqE6m3zH9QnbhHoMvZ5S recursive

> ipfs pin ls QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7
Error: path 'QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7' is not pinned
```

可以使用 pin add 手动钉住一个文件，如：

```
> ipfs pin add QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7
pinned QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7 recursively
```

如果要删除pin的状态，使用pin rm ， 如:

```
> ipfs pin rm -r QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7
unpinned QmWnrAEKyDVUQ1jh9vDtQhtBSNEgUnQhAJyMmo3JjwJZK7
```

pin rm 的参数 -r 表示递归的删除pin 状态，对于没有pin住的文件， 如果执行GC操作 `ipfs repo gc` 文件会被删除。



欢迎来[知识星球](https://learnblockchain.cn/images/zsxq.png)提问，星球内已经聚集了300多位区块链技术爱好者。
[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。


