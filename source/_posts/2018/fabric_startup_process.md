---
title: Fabric 网络环境启动过程详解
permalink: fabric_startup_process
date: 2018-11-21 17:30:27
categories:
    - Fabric
    - 联盟链
tags:
    - Fabric
author: lgy
---


这篇文章对Fabric的网络环境启动过程进行讲解,也就是我们[上节](https://learnblockchain.cn/2018/11/21/fabric_introduction/)讲到的启动测试Fabric网络环境时运行network_setup.sh这个文件的执行流程

<!-- more -->



## Fabric网络环境启动过程详解

上一节我们讲到 fabric网络环境的启动测试，主要是使用 **./network_setup.sh  up** 这个命令，所以fabric网络环境启动的重点就在network_setup.sh这个文件中。接下来我们就分析一下network_setup.sh这个文件。
network_setup.sh其中包括两个部分，一个是利用generateArtifacts.sh脚本文件配置组织关系和颁发证书、公/私钥、通道证书等，另一个是docker-compose-cli.yaml用于根据配置启动集群并测试chaincode的示例代码。下面是具体的流程图介绍：

![](/images/startup _process.png)

**首先看下generateArtifacts.sh脚本文件，它包含三个函数，分别是：**

```
1.generateCerts：
 该函数使用cryptogen工具根据crypto-config.yaml来生成公私钥和证书信息等。

2.replacePrivateKey：
 将docker-compose-e2e-template.yaml文档中的ca私钥替换成具体的私钥。

3.generateChannelArtifacts：
 使用configtxgen工具根据configtx.yaml文件来生成创世区块和通道相关信息，更新锚节点。
```

**接着是docker-compose-cli.yaml文件**

docker-compose-cli.yaml文件根据组织关系启动docker集群，并在cli容器中执行command命令运行./scripts/script.sh脚本文件。 那./scripts/script.sh脚本具体做了什么呢？

```
1. createChannel：创建channel。
2. joinChannel：将每个peer节点加入channel。
3. updateAnchorPeers：更新锚节点
4. installChaincode：部署chaincode。
5. instantiateChaincode：初始化chaincode。
6. chaincodeQuery：chaincode查询
```

另外docker-compose-cli.yaml这个文件还有一个配置项是需要注意的地方，那就是：

```
file:  base/docker-compose-base.yaml
```

这里的docker-compose-base.yaml其实就是Orderer和peer的基础配置文件，包括指定端口等。

### 几个重要的配置文件

#### 1.crypto-config.yaml

基于crypto-config.yaml（此文件在../fabric/examples/e2e_cli中）**生成公、私钥和证书信息，并保存在crypto-config文件夹中**。另外crypto-config.yaml还定义了组织成员以及组织下的peer节点个数。

**crypto-config.yaml文件讲解：**

字段Name和Domain就是关于这个组织的名字和域名，这主要是用于生成证书的时候，证书内会包含该信息。而Template.Count=2是说我们要生成2套公私钥和证书，一套是peer0.org1的，还有一套是peer1.org1的（也就指定了org中存在peer0和peer1两个节点）。最后Users.Count=1是说每个Template下面会有几个普通User（注意，Admin是Admin，不包含在这个计数中），这里配置了1，也就是说我们只需要一个普通用户User1@org1.example.com 我们可以根据实际需要调整这个配置文件，增删Org Users等。文件内容如下：

```
  # ---------------------------------------------------------------------------
  # Orderer
  # ---------------------------------------------------------------------------
  - Name: Orderer
    Domain: example.com
    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete description
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer
# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org1
  # ---------------------------------------------------------------------------
  - Name: Org1
    Domain: org1.example.com
    # ---------------------------------------------------------------------------
    # "Specs"
    # ---------------------------------------------------------------------------
    # Uncomment this section to enable the explicit definition of hosts in your
    # configuration.  Most users will want to use Template, below
    #
    # Specs is an array of Spec entries.  Each Spec entry consists of two fields:
    #   - Hostname:   (Required) The desired hostname, sans the domain.
    #   - CommonName: (Optional) Specifies the template or explicit override for
    #                 the CN.  By default, this is the template:
    #
    #                              "{{.Hostname}}.{{.Domain}}"
    #
    #                 which obtains its values from the Spec.Hostname and
    #                 Org.Domain, respectively.
    # ---------------------------------------------------------------------------
    # Specs:
    #   - Hostname: foo # implicitly "foo.org1.example.com"
    #     CommonName: foo27.org5.example.com # overrides Hostname-based FQDN set above
    #   - Hostname: bar
    #   - Hostname: baz
    # ---------------------------------------------------------------------------
    # "Template"
    # ---------------------------------------------------------------------------
    # Allows for the definition of 1 or more hosts that are created sequentially
    # from a template. By default, this looks like "peer%d" from 0 to Count-1.
    # You may override the number of nodes (Count), the starting index (Start)
    # or the template used to construct the name (Hostname).
    #
    # Note: Template and Specs are not mutually exclusive.  You may define both
    # sections and the aggregate nodes will be created for you.  Take care with
    # name collisions
    # ---------------------------------------------------------------------------
    Template:
      Count: 2
      # Start: 5
      # Hostname: {{.Prefix}}{{.Index}} # default
    # ---------------------------------------------------------------------------
    # "Users"
    # ---------------------------------------------------------------------------
    # Count: The number of user accounts _in addition_ to Admin
    # ---------------------------------------------------------------------------
    Users:
      Count: 1
  # ---------------------------------------------------------------------------
  # Org2: See "Org1" for full specification
  # ---------------------------------------------------------------------------
  - Name: Org2
    Domain: org2.example.com
    Template:
      Count: 2
    Users:
      Count: 1

```
**注：**
peer：
Fabric 网络中的节点，表现为一个运行着的docker容器。可以与网络中的其他peer进行通信，每个peer都在本地保留一份ledger的副本。它是org下的组织成员。
org:
一个组织，它可以由一个或多个peer组成。
Orderer :
联盟成员共享的中心化节点。用来对交易进行排序，是 Fabric 共识机制的重要组成部分。

#### 2.configtx.yaml

基于configtx.yaml（此文件在../fabric/examples/e2e_cli中）**生成创世区块和通道相关信息，并保存在channel-artifacts文件夹。还可以指定背书策略。**

**configtx.yaml文件讲解：**

1. 官方提供的examples/e2e_cli/configtx.yaml这个文件里面配置了由2个Org参与的Orderer共识配置TwoOrgsOrdererGenesis，以及由2个Org参与的Channel配置：TwoOrgsChannel。
2. 另外我们可以在此文件的Orderer部分设置共识的算法是Solo还是Kafka，以及共识时区块大小，超时时间等，我们使用默认值即可，不用更改。而Peer节点的配置包含了MSP的配置，锚节点的配置。如果我们有更多的Org，或者有更多的Channel，那么就可以根据模板进行对应的修改。
3. Policies配置也要特别注意，该配置项定义了不同角色的权限,Reader,Writer以及Admin分别对应读，写，以及admin权限,读权限角色只能从别的peer节点同步账本而不能发起交易，只有writer定义项下的角色才拥有发起交易的也就是调用chaincode的invoke方法的权限(不一定都是invoke方案，只要涉及到chaincode中状态修改的方法，都只有拥有writer权限或admin权限的角色才能调用)。以该配置的Organizations配置下的Org1配置为例,"OR('Org1MSP.admin', 'Org1MSP.client')",表示org1的msp服务中的admin或者client角色拥有发起交易的权限。文件内容如下：

```
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

---
################################################################################
#
#   Profile
#
#   - Different configuration profiles may be encoded here to be specified
#   as parameters to the configtxgen tool
#
################################################################################
Profiles:

    TwoOrgsOrdererGenesis:
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Org1
                    - *Org2
    TwoOrgsChannel:
        Consortium: SampleConsortium
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
                - *Org2

################################################################################
#
#   Section: Organizations
#
#   - This section defines the different organizational identities which will
#   be referenced later in the configuration.
#
################################################################################
Organizations:

    # SampleOrg defines an MSP using the sampleconfig.  It should never be used
    # in production but may be used as a template for other definitions
    - &OrdererOrg
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment
        Name: OrdererOrg

        # ID to load the MSP definition as
        ID: OrdererMSP

        # MSPDir is the filesystem path which contains the MSP configuration
        MSPDir: crypto-config/ordererOrganizations/example.com/msp

    - &Org1
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment
        Name: Org1MSP

        # ID to load the MSP definition as
        ID: Org1MSP

        MSPDir: crypto-config/peerOrganizations/org1.example.com/msp

        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer0.org1.example.com
              Port: 7051

    - &Org2
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment
        Name: Org2MSP

        # ID to load the MSP definition as
        ID: Org2MSP

        MSPDir: crypto-config/peerOrganizations/org2.example.com/msp

        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer0.org2.example.com
              Port: 7051

################################################################################
#
#   SECTION: Orderer
#
#   - This section defines the values to encode into a config transaction or
#   genesis block for orderer related parameters
#
################################################################################
Orderer: &OrdererDefaults

    # Orderer Type: The orderer implementation to start
    # Available types are "solo" and "kafka"
    OrdererType: solo

    Addresses:
        - orderer.example.com:7050

    # Batch Timeout: The amount of time to wait before creating a batch
    BatchTimeout: 2s

    # Batch Size: Controls the number of messages batched into a block
    BatchSize:

        # Max Message Count: The maximum number of messages to permit in a batch
        MaxMessageCount: 10

        # Absolute Max Bytes: The absolute maximum number of bytes allowed for
        # the serialized messages in a batch.
        AbsoluteMaxBytes: 98 MB

        # Preferred Max Bytes: The preferred maximum number of bytes allowed for
        # the serialized messages in a batch. A message larger than the preferred
        # max bytes will result in a batch larger than preferred max bytes.
        PreferredMaxBytes: 512 KB

    Kafka:
        # Brokers: A list of Kafka brokers to which the orderer connects
        # NOTE: Use IP:port notation
        Brokers:
            - 127.0.0.1:9092

    # Organizations is the list of orgs which are defined as participants on
    # the orderer side of the network
    Organizations:

################################################################################
#
#   SECTION: Application
#
#   - This section defines the values to encode into a config transaction or
#   genesis block for application related parameters
#
################################################################################
Application: &ApplicationDefaults

    # Organizations is the list of orgs which are defined as participants on
    # the application side of the network
    Organizations:

```

本文的作者是lgy

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
