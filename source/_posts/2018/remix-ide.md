---
title: 搭建智能合约开发环境Remix IDE及使用
permalink: remix-ide
date: 2018-06-07 10:56:04
categories: 
    - 以太坊
    - 智能合约
tags:
    - IDE

author: Tiny熊

---


目前开发智能的IDE， 首推还是Remix, 而Remix[官网](https://remix.ethereum.org/), 总是由于各种各样的（网络）原因无法使用，本文就来介绍一下如何在本地搭建智能合约开发环境remix-ide并介绍Remix的使用。

<!-- more -->

## 写在前面

Remix 是以太坊智能合约编程语言Solidity IDE，阅读本文前，你应该对以太坊、智能合约有所了解，
如果还不了解，建议先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)。

## Remix IDE 介绍

Remix IDE 是一款基于浏览器的IDE，跟有些开发聊的时候，发现有一些同学对浏览器的IDE，有一些偏见，其实Atom编辑器就是基于web技术开发的一款编辑器（Atom可以看做一个没有地址栏的浏览器），其实基于浏览器的IDE，有一个很大的好处就是不用安装，打开即用。

Remix IDE的功能全面（传统IDE有的功能这里都有），比如：
1. 代码提示补全，代码高亮
2. 代码警告、错误提示
3. 运行日志输出
4. 代码调试
5. ...


## Remix IDE 安装


> 更新： Remix 现在提供了一个APP, 叫Remix APP， 如果是Mac 电脑，可以直接使用其提供的发布包，地址为：https://github.com/horizon-games/remix-app/releases

如果你有很好的网络环境，可以直接访问Remix[官网](https://remix.ethereum.org/)。
要不能还是还是像我一样老老实实把Remix IDE安装在本地，我发现要想成功安装选择对应的版本很关键，具体的版本要求如下：

```js
$ node --version
v7.10.1
$ npm --version
4.2.0
$ nvm --version
0.33.11
```

### nvm 安装
nvm 是一个node 版本工具，我们可以使用nvm来安装不同版本的node。
nvm 官方[安装方法](https://github.com/creationix/nvm/blob/master/README.md)如下：

1. 命令行中输入：

    ```bash
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    ```
2. 在当前用户profile文件，如（~/.bash_profile, ~/.zshrc, ~/.profile, or ~/.bashrc）添加加载nvm的脚本：

    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```

3. 重启下命令行，输入nvm 试试，应该可以看到 nvm 命令的帮助


### 使用nvm 安装node

因为Remix IDE 要求使用node 7.10.1, 命令行输入一下命令进行安装：

```bash
nvm install 7
```

安装完成之后，使用node --version 和 npm --version检查下版本号，是否和刚刚列出版本要求一致，在版本一值的qing

### 命令行安装Remix ide

**方法1**
直接使用npm安装，这也是我安装使用的方法。
```bash
npm install remix-ide -g
remix-ide
```

如果出现错误：
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
可以尝试用以下方法解决：
```js
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```
如果我们使用的是正确的node 和npm 版本的话，应该都可以安装成功，安装成功之后，remix-ide命令用来启动ide.


**方法2**
remix-ide的github 上还提供了另一个方法进行安装，通过clone 代码来安装，方法如下：

```bash
git clone https://github.com/ethereum/remix-ide.git
cd remix-ide
npm install
npm run setupremix  # this will clone https://github.com/ethereum/remix for you and link it to remix-ide
npm start
```

## Remix ide 使用

Remix IDE 默认是使用8080端口启动的，启动之后在浏览器打开：`http://localhost:8080/`, 如图：

![](https://img.learnblockchain.cn/2018/remix-setup.jpg!wl)

和大多数IDE一样，最左边是文件浏览，中间是代码编辑区域，右边是功能区域，下边是日志区域。
在右侧的功能区域，常用的是`Compile`、`Run`及`Debuger`几个标签页（Tab）。

在`Compile`页，会动态的显示当前编辑区域合约的编译信息，如显示错误和警告。编译的直接码信息及ABI接口可以通过点击`Details`查看到。
在[这篇文章里](https://learnblockchain.cn/2017/11/24/init-env/) 也有截图说明。
在`Run`页，可以部署合约，以及调用合约函数等，使用非常简单，我们前面也有多篇文章讲解。
`Debuger`页在下面调试一节单独讲解。

### Remix ide 加载本地磁盘文件

这是一个非常用的功能，但发现使用的人非常少，通过加载本地磁盘文件，就可以方便代码管理工具（如 git）管理我们的合约代码。
我详细介绍下如何这个功能怎么使用？

> 使用在线版本的Remix可以使用这个功能， 不过需要安装一下[remixd](https://github.com/ethereum/remixd), 安装使用命令`npm install -g remixd`。

1. 在需要的本地合约代码的目录下启动`remix-ide`, Remix IDE 会自动把当前目录做为共享目录。如果是使用在线的Remix，需要使用命令`remixd -s shared-folder` 来指定共享目录。

2. 加载共享目录，在文件浏览区域上有，有这样一个图标，他用来加载本地共享目录，如图：
![](https://img.learnblockchain.cn/2018/remixd_connectionok.png!wl)


## 调试

在合约编写过程中，合约调试是必不可少的一部分，为了模拟调试的过程，我故意在代码中加入一ge错误的逻辑代码如下：

```js
pragma solidity ^0.4.0;
​
contract SimpleStorage {
    
    uint storedData;
    
    function set(uint x) public {
        storedData += x;    // 错误的，多加了一个加号
    }
​
    function get() public constant returns (uint) {
        return storedData;
    }
}
```

加入了错误的逻辑之后，我第2次调用set函数，合约状态变量的值，可能会出错（如果第一次不是用参数0去调用的话）。
注意如果需要调试合约，在部署合约的环境应该选择：JavaScript VM。

### 开始调试

在我们每次执行一个交易（不管是方式调用还是函数执行）的时候，在日志都会输出一条记录，如图：
![](https://img.learnblockchain.cn/2018/remix-debug-console.png!wl)

点击上图中的“Debug”按钮，在Remix右侧的功能区域会切换到调试面板，如下图：
![](https://img.learnblockchain.cn/2018/remix-debug-panel.png!wl)
调试过程过程中，有下面几项需要重点关注：

* Transactions: 可以查看交易及交易的执行过程，并且提供了7个调试的按钮，如下图：
![](https://img.learnblockchain.cn/2018/remix-debug-buttons.png!wl)

    为了方便介绍，我为每个按钮编了号，每个按钮的含义是：
    1. 后退一步（不进入函数内部）
    2. 后退一步（进入函数内部）
    3. 前进一步（进入函数内部）
    4. 前进一步（不进入函数内部）
    5. 跳到上一个断点
    6. 跳出当前调用
    7. 跳到下一个断点
* Solidity Locals：显示当前上下文的局部变量的值， 如图：

![](https://img.learnblockchain.cn/2018/remix-debug-locals.png!wl)


* Solidity State： 显示当前执行合约的状态变量，如下图:
![](https://img.learnblockchain.cn/2018/remix-debug-state.png!wl)

在本例中，我们跟踪运行步骤的时候，可以看到局部变量的值为2，赋值给状态变量之后，状态变量的值更改为了3，所以可以判断运行当前语句的时候出错了。

* Step detail： 显示当前步骤的gas详情等，如下图:
![](https://img.learnblockchain.cn/2018/remix-debug-gas.png!wl)


###  设置断点
这部分为小专栏读者准备，欢迎订阅小专栏[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。


## 参考链接

1. [remix-ide github](https://github.com/ethereum/remix-ide)
2. [Remix Document](http://remix.readthedocs.io/en/latest/index.html)

给大家推荐两门特别好的区块链技术学习课程:
* [精讲以太坊智能合约开发](https://ke.qq.com/course/326528) - Solidity 语言面面俱到
* [以太坊DAPP开发实战](https://ke.qq.com/course/335169) - 轻轻松松学会DAPP开发


[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果你学习区块链中遇到问题，欢迎加入知识星球[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)问答社区，作为星友福利，星友可加入我创建的区块链技术群，群内已经聚集了300多位区块链技术牛人和爱好者。


<!---
在本例中，我们的代码比较简单，执行的不多，可以不用设置断点，如果代码比较多，这可以设置断点，利用上面介绍的第7个按钮快速的调转到断点处，设置断点的方法很简单，在编辑区域，点击代码的行号，就可以在当前行设置一个断点，如下图：
![](https://img.learnblockchain.cn/2018/remix-debug-break.png!wl)

上图在第8行出设置了一个断点，成功设置断点会在行号处，加上一个色块来标示断点。取消断点的方式是，再次点击断点处。
有一点需要注意一下，如果在声明变量的地方设置断点，这断点可能会触发两次，第一次是初始化为0，第二次是赋实际的值。

-->


