---
title: 联盟链初识以及Fabric环境搭建流程
permalink: fabric_introduction
date: 2018-11-21 17:30:27
categories:
  - Fabric
  - 联盟链
tags:
    - Fabric

author: lgy

---

这篇文章首先简单介绍了联盟链是什么，再详细的介绍了Fabric环境搭建的整个流程。
<!-- more -->


## 区块链分类
以参与方式分类，区块链可以分为：公有链、联盟链和私有链。

## 定义
我们知道区块链就是一个分布式的，去中心化的公共数据库（或称公共账本）。而联盟链是区块链的一个分支，所以它本身也是一个分布式的，去中心化的公共数据库，跟其他链的区别就是它是针对特定群体的成员和有限的第三方，其内部指定多个预选节点为记账人，其共识过程受到预选节点控制的区块链

## 本质
联盟链本质仍然是一种私有链，只不过它要比单个小组织开发的私有链更大，但是却没有公有链这么大的规模，可以理解为它是介于公有链和私有链的一种区块链。

## 联盟链的特点

 - 交易速度快
    我们知道对于公有链来说，要想达成共识，必须得由区块链中的所有节点来决定，本身公有链的节点数量就非常庞大，所以处理速度很慢。但对于联盟链来说，由于其节点不多的原因，而且只要当网络上2/3的节点达成共识，就可以完成交易，交易速度自然也就快很多。
 - 数据默认不会公开
    不同于公有链，联盟链上的信息并不是所有有访问条件的人就可以访问的，联盟链的数据只限于联盟里的机构及其用户才有权限进行访问。
 - 部分去中心化
  与公有链不同，联盟链某种程度上只属于联盟内部的所有成员所有，且很容易达成共识，因为其节点数毕竟是有限的。

### 联盟链项目

R3：由40多加银行参与的区块链联盟R3，包括世界著名的银行（如摩根大通、高盛、瑞信、伯克莱、汇丰银行等），IT巨头（如IBM、微软）。

超级账本（Hyperledger）:由 Linux基金会在2015年12月主导发起该项目， 成员包括金融，银行，物联网，供应链，制造和科技行业的领头羊。

## Fabric介绍
我们知道智能合约比较成功的就是以太坊了。以太坊主要是公有链，其实对企业应用来说并不是特别合适，而且本身并没有权限控制功能，面向企业的，主要还是HyperLedger Fabric，当然还有R3的Corda。这里我们主要是讲Fabric。
Fabric是一个面向企业应用的区块链框架，基于Fabric的开发可以粗略分为几个层面：

**1.** 参与Fabric的底层开发，这主要是fabric，fabric-ca和sdk等核心组件。
**2.** 参与Fabric周边生态的开发，如支持如支持fabric的工具explorer, composer等。
**3.** 利用fabric平台开发应用，这就是利用fabirc提供的各种sdk来为应用服务（应用开发）

大部分企业会参与2-3的内容，以3为主来服务应用场景，以2为辅。因为现在除了区块链核心功能尚未完善外，对区块链的管理，运维，监控，测试，优化，调试等工具非常匮乏。企业将不得不面对自己开发一些工作。

###  Fabric环境依赖

Fabric官方推荐的开发环境是基于docker搭建的,使用docker搭建需要一下前置条件：
 - docker一一Docker version 17.06.2-ce 或以上版本
 - Docker Compose一一1.14或以上版本
 - Go一一1.10或以上版本， Node.js一一8.9.x或以上版本
 - Python一一主要是python-pip

###  Fabric环境搭建具体步骤
这里使用的是Ubuntu 16.04.4版本

#### **1.安装go及环境变量配置**

(1)下载最新版本的go二进制文件

```
$ wget https://dl.google.com/go/go1.9.2.linux-amd64.tar.gz
```
(2)解压文件

```
$ sudo tar -C /usr/local -xzf go1.9.2.linux-amd64.tar.gz
```
(3)配置环境变量

```
vim ~/.profile
```
添加以下内容：

```
export PATH=$PATH:/usr/local/go/bin
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export PATH=$PATH:$HOME/go/bin
```
编辑保存并退出vi后，记得使这些环境变量生效

```
source ~/.profile
```

#### **2.安装Docker**

Fabric的chaincode是运行在docker里的。

**(1)** 由于apt官方库里的docker版本可能比较旧，所以先卸载可能存在的旧版本：

```
sudo apt-get remove docker docker-engine docker-ce docker.io
```

**(2)** 更新apt包索引：

```
sudo apt-get update
```

**(3)** 安装以下包以使apt可以通过HTTPS使用存储库（repository）：

```
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
```

**(4)** 添加Docker官方的GPG密钥：

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
备注：可验证秘钥指纹 9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88
使用如下命令验证：
sudo apt-key fingerprint 0EBFCD88
```

**(5)** 使用下面的命令来设置stable存储库：

```
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

**(6)** 再更新一下apt包索引：

```
sudo apt-get update
```

**(7)** 安装最新版本的Docker CE：

```
sudo apt-get install -y docker-ce
注意：在生产系统上，可能会需要应该安装一个特定版本的Docker CE，而不是总是使用最新版本：
列出可用的版本：apt-cache madison docker-ce
选择要安装的特定版本，第二列是版本字符串，第三列是存储库名称，它指示包来自哪个存储库，以及扩展它的稳定性级别。要安装一个特定的版本，将版本字符串附加到包名中，并通过等号(=)分隔它们：
sudo apt-get install docker-ce=<VERSION>
```

**(8)** 测试是否安装成功

```
docker --version
```

**(9)** 使用阿里提供的镜像,否则后面下载Fabric镜像会非常慢
cd到/etc/docker目录下,创建文件daemon.json，输入下面的内容：

```
{
 "registry-mirrors": ["https://obou6wyb.mirror.aliyuncs.com"]
}
```

保存并退出，接着执行：

```
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**(10)** 查看docker服务是否启动：

```
systemctl status docker
```

**(11)** 若未启动，则启动docker服务：

```
sudo service docker start或者sudo systemctl start docker
```

#### **3.安装最新版本的Docker-compose**

**(1)** Docker-compose是支持通过模板脚本批量创建Docker容器的一个组件。在安装Docker-Compose之前，需要安装Python-pip，运行脚本：

```
sudo apt-get install python-pip
```

**(2)** 安装Docker-compose：

```
pip install docker-compose
```

**(3)** 验证是否成功：

```
sudo docker-compose --version
```
安装Docker还可以参考[此篇文章](https://blog.csdn.net/so5418418/article/details/78355868)

#### **4.Fabric源码下载**

**(1)** 新建存放测试、部署代码的目录。

```
mkdir -p ~/go/src/github.com/hyperledger/
```

**(2)** cd到刚创建的目录

```
cd ~/go/src/github.com/hyperledger
```

**(3)** 下载Fabric,这里使用使用git命令下载源码：

```
git clone https://github.com/hyperledger/fabric.git
```

**特别注意这里：**
直接使用上面的git clone下载会非常慢，因为github.global.ssl.fastly.Net域名被限制了。只要找到这个域名对应的ip地址，然后在hosts文件中加上ip–>域名的映射，刷新DNS缓存就可以了。
解决办法：
步骤【1】:查询域名`global-ssl.fastly.Net`和 `github.com` 公网地址
可以使用[https://www.ipaddress.com/](https://www.ipaddress.com/) 这个查。
分别查找下面这两个域名的ip地址：

```
	github.global.ssl.fastly.net
	github.com
```

步骤【2】:将ip地址添加到hosts文件

```
sudo vim /etc/hosts
```
在文件下方输入下面内容并保存，前面两个ip就是我们刚才上面查找到的ip：

```
151.101.185.194 github.global.ssl.fastly.net
192.30.253.113 github.com
```
步骤【3】：修改完hosts还不会立即生效，你需要刷新DNS缓存，告诉电脑我的hosts文件已经修改了。
输入指令：
sudo /etc/init.d/networking restart 即可，如果不行也可以尝试重启一下电脑。
接下来再去git clone就快很多了。

**(4)** 由于Fabric一直在更新，新版本的并不稳定，所有我们并不需要最新的源码，需要切换到v1.0.0版本的源码：

```
git checkout v1.0.0
```

#### **5.下载Fabric  Docker镜像**

**(1)** 前面步骤4下载完成后，我们可以看到当前工作目录(~/go/src/github.com/hyperledger/)下多了一个fabric的文件夹,
接下来我们cd到~/go/src/github.com/hyperledger/fabric/examples/e2e_cli目录下执行：

```
source download-dockerimages.sh -c x86_64-1.0.0 -f x86_64-1.0.0
```

(注：一定要下载完所有镜像并且镜像版本要和Fabric版本一致如何没有下载问继续执行source download-dockerimages.sh命令直到在完如图所有镜像)，执行完所有会用到的Fabric docker镜像都会下载下来了。
运行以下命令检查下载的镜像列表：

```
docker images
```

**注意**：如果下载时遇到权限问题，需要切换到root用户下：su root
**(2)** 重启Docker

```
service docker restart
```

#### **6.测试Fabric环境是否成功**
在~/go/src/github.com/hyperledger/fabric/examples/e2e_cli下执行如下命令启动测试

```
./network_setup.sh up
```

这个指令具体进行了如下操作：
  1. 编译生成Fabric公私钥、证书的程序，程序在目录：fabric/release/linux-amd64/bin
  2. 基于configtx.yaml生成创世区块和通道相关信息，并保存在channel-artifacts文件夹。基于configtx.yaml生成创世区块和通道相关信息，并保存在channel-artifacts文件夹。
  3. 基于crypto-config.yaml生成公私钥和证书信息，并保存在crypto-config文件夹中。基于crypto-config.yaml生成公私钥和证书信息，并保存在crypto-config文件夹中。
  4. 基于docker-compose-cli.yaml启动1Orderer+4Peer+1CLI的Fabric容器。基于docker-compose-cli.yaml启动1Orderer+4Peer+1CLI的Fabric容器。
  在CLI启动的时候，会运行scripts/script.sh文件，这个脚本文件包含了创建Channel，加入Channel，安装Example02，运行Example02等功能。

运行完如果出现下图所示，说明整个Fabric网络已经通了。
![在这里插入图片描述](https://img.learnblockchain.cn/2018/fabric_test.png!wl)

#### 这里记录本人测试Fabric环境是否成功时遇到的问题
**1.** 如果发现运行 **./network_setup.sh up**命令 后提示在...fabric/release/linux-amd64/bin文件夹下找不到指定文件
**解决办法**：
可以在~/go/src/github.com/hyperledger/fabric/scripts文件下找到 **bootstrap.1.0.0.sh**文件，手动运行它    **./bootstrap.1.0.0.sh**， 此时可以在当前文件夹生成一个**bin**文件夹，bin里面的文件就是我们需要的，将它拷贝到前面的...fabric/release/linux-amd64/bin文件夹下

**2.** 如果出现：Error on outputBlock: Error writing genesis block: open ./channel-artifacts/genesis.block: is a directory不能生成创世块的错误。
**解决办法：**
可以在~/go/src/github.com/hyperledger/fabric/examples/e2e_cli/channel-artifacts目录下，将genesis.block这个目录删除，**rm -rf genesis.block/**

**3.** 如果出现：.ERROR: for orderer.example.com  Cannot start service orderer.example.com: b'OCI runtime create failed: container_linux.go:348: starting container process caused "process_linux.go:402: container init caused \\"rootfs_linux.go:58:
**解决办法：**
执行./network_setup.sh down 清除网络后再启动即可


### 测试Fabric网络

接下来我们手动测试下Fabric网络，Fabric提供了SDK和CLI两种交互方式，这里我们使用的是CLI。
这里我们使用官方提供的小例子进行测试，在官方例子中，channel名字是mychannel，链码（智能合约）的名字是mycc。
首先要登录到CLI这个容器中，才能执行Fabric的CLI命令：

```
docker exec -it cli bash
```

这时用户名变为root@caa22f87a5bf，当前目录变为/opt/go/src/github.com/hyperledger/fabric/peer#，接着可执行peer命令，体验区块链的命令行使用方式。

**1.查看a账户的余额**

```
peer chaincode query -C mychannel -n mycc -c '{"Args":["query","a"]}'
```

此时我们可以看到控制台输出有：

```
Query Result: 90
```

这里90就是a账户的余额

**2.调用链码，转账**

这里我们让b账户向a账户转账10：

```
peer chaincode invoke -o orderer.example.com:7050  --tls true --cafile /opt/go/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C mychannel -n mycc -c '{"Args":["invoke","b","a","10"]}'
```

转账成功后，我们可以看到有输出如下提示：

```
DEBU 009 ESCC invoke result: version:1 response:<status:200 message:"OK"
```

接下来我们使用前面的命令继续查看a账户的余额，输出结果如下：

```
Query Result: 100
```

很明显我们已经转账成功了。

**退出cli容器：**

直接执行

```
exit
```

最后如果我们要关闭Fabric网络，cd到`~/go/src/github.com/hyperledger/fabric/examples/e2e_cli`下（注意这里的路径按自己前面创建的，不一定要和我一样），执行：

```
./network_setup.sh down
```

## 参考文章

https://blog.csdn.net/github_34965845/article/details/80610060
https://www.cnblogs.com/preminem/p/7729497.html
https://www.cnblogs.com/gao90/p/8692642.html
https://blog.csdn.net/so5418418/article/details/78355868
https://blog.csdn.net/iflow/article/details/77951610
https://blog.csdn.net/vivian_ll/article/details/79966210

本文的作者是lgy

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。

[深入浅出区块链知识星球](https://learnblockchain.cn/images/zsxq.png)最专业技术问答社区，加入社区还可以在微信群里和300多位区块链技术爱好者一起交流。
