---
title: 智能合约语言 Solidity 教程系列5 - 数组介绍
permalink: solidity-arrays
date: 2017-12-21 11:55:18
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

Solidity 教程系列第5篇 - Solidity 数组介绍。
Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

本文前半部分是参考Solidity官方文档（当前最新版本：0.4.20）进行翻译，后半部分对官方文档中没有提供代码的知识点补充代码说明（订阅[专栏](https://xiaozhuanlan.com/blockchaincore)阅读）。


## 数组（Arrays）
数组可以声明时指定长度，也可以是动态变长。对storage存储的数组来说，元素类型可以是任意的，类型可以是数组，映射类型，结构体等。但对于memory的数组来说。如果作为public函数的参数，它不能是映射类型的数组，只能是支持[ABI的类型](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI#types)。

一个元素类型为T，固定长度为k的数组，可以声明为**T[k]**，而一个动态大小（变长）的数组则声明为**T[]**。
还可以声明一个多维数组，如声明一个类型为uint的数组长度为5的变长数组（5个元素都是变长数组），可以声明为uint[][5]。（注意，相比非区块链语言，多维数组的长度声明是反的。）

要访问第三个动态数组的第二个元素，使用x[2][1]。数组的序号是从0开始的，序号顺序与定义相反。

**bytes**和**string**是一种特殊的数组。**bytes**类似**byte[]**，但在外部函数作为参数调用中，**bytes**会进行压缩打包。**string**类似**bytes**，但不提供长度和按序号的访问方式（目前）。
所以应该尽量使用**bytes**而不是**byte[]**。

> 可以将字符串s通过bytes(s)转为一个bytes，可以通过**bytes(s).length**获取长度，**bytes(s)[n]**获取对应的UTF-8编码。通过下标访问获取到的不是对应字符，而是UTF-8编码，比如中文编码是多字节，变长的，所以下标访问到的只是其中的一个编码。
类型为数组的状态变量，可以标记为**public**，从而让Solidity创建一个访问器，如果要访问数组的某个元素，指定数字下标就好了。（稍后代码事例）

## 创建内存数组
可使用new关键字创建一个memory的数组。与stroage数组不同的是，你不能通过.length的长度来修改数组大小属性。我们来看看下面的例子：
```js
pragma solidity ^0.4.16;

contract C {
    function f(uint len) public pure {
        uint[] memory a = new uint[](7);
                
        //a.length = 100;  // 错误
        bytes memory b = new bytes(len);
        // Here we have a.length == 7 and b.length == len
        a[6] = 8;
    }
}

```

## 数组常量及内联数组

数组常量，是一个数组表达式（还没有赋值到变量）。下面是一个简单的例子：
```js
pragma solidity ^0.4.16;

contract C {
    function f() public pure {
        g([uint(1), 2, 3]);
    }
    function g(uint[3] _data) public pure {
        // ...
    }
}
```

通过数组常量，创建的数组是memory的，同时还是定长的。元素类型则是使用刚好能存储的元素的能用类型，比如[1, 2, 3]，只需要uint8即可存储，它的类型是**uint8[3] memory**。

由于g()方法的参数需要的是uint（默认的uint表示的其实是uint256），所以需要对第一个元素进行类型转换，使用uint(1)来进行这个转换。

还需注意的一点是，定长数组，不能与变长数组相互赋值，我们来看下面的代码：
```js
//  无法编译
pragma solidity ^0.4.0;

contract C {
    function f() public {
        // The next line creates a type error because uint[3] memory
        // cannot be converted to uint[] memory.
        uint[] x = [uint(1), 3, 4];
    }
}
```
已经计划在未来移除这样的限制。当前因为ABI传递数组还有些问题。

## 成员

### length属性
数组有一个.length属性，表示当前的数组长度。storage的变长数组，可以通过给.length赋值调整数组长度。memory的变长数组不支持。
不能通过访问超出当前数组的长度的方式，来自动实现改变数组长度。memory数组虽然可以通过参数，灵活指定大小，但一旦创建，大小不可调整。

### push方法
storage的变长数组和bytes都有一个**push**方法（string没有），用于附加新元素到数据末端，返回值为新的长度。


## 限制情况
当前在external函数中，不能使用多维数组。

另外，基于EVM的限制，不能通过外部函数返回动态的内容。
```js
contract C {
     function f() returns (uint[]) { ... }
      }
```
在这个的例子中，如果通过web.js调用能返回数据，但从Solidity中调用不能返回数据。一种绕过这个问题的办法是使用一个非常大的静态数组。

```js

pragma solidity ^0.4.16;

contract ArrayContract {
    uint[2**20] m_aLotOfIntegers;
    // 这里不是两个动态数组的数组，而是一个动态数组里，每个元素是长度为二的数组。
    bool[2][] m_pairsOfFlags;
    // newPairs 存在 memory里，因为是函数参数
    function setAllFlagPairs(bool[2][] newPairs) public {
        m_pairsOfFlags = newPairs;
    }

    function setFlagPair(uint index, bool flagA, bool flagB) public {
        // 访问不存在的index会抛出异常
        m_pairsOfFlags[index][0] = flagA;
        m_pairsOfFlags[index][1] = flagB;
    }

    function changeFlagArraySize(uint newSize) public {
        // 如果新size更小, 移除的元素会被销毁
        m_pairsOfFlags.length = newSize;
    }

    function clear() public {
        // 销毁
        delete m_pairsOfFlags;
        delete m_aLotOfIntegers;
        // 同销毁一样的效果
        m_pairsOfFlags.length = 0;
    }

    bytes m_byteData;

    function byteArrays(bytes data) public {
        // byte arrays ("bytes") are different as they are stored without padding,
        // but can be treated identical to "uint8[]"
        m_byteData = data;
        m_byteData.length += 7;
        m_byteData[3] = byte(8);
        delete m_byteData[2];
    }

    function addFlag(bool[2] flag) public returns (uint) {
        return m_pairsOfFlags.push(flag);
    }

    function createMemoryArray(uint size) public pure returns (bytes) {
        // Dynamic memory arrays are created using `new`:
        uint[2][] memory arrayOfPairs = new uint[2][](size);
        // Create a dynamic byte array:
        bytes memory b = new bytes(200);
        for (uint i = 0; i < b.length; i++)
            b[i] = byte(i);
        return b;
    }
}

```

## 补充事例说明
事例代码及讲解，请订阅[区块链技术](https://xiaozhuanlan.com/blockchaincore)查看。

另外强烈安利一门课程给大家： [深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)。

## 参考文档
[Solidity官方文档-数组](https://solidity.readthedocs.io/en/develop/types.html#arrays)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
我的**[知识星球](https://learnblockchain.cn/images/zsxq.png)**为各位解答区块链技术问题，欢迎加入讨论。

<!---
```js
pragma solidity ^0.4.0;

contract C {
    
    uint [] public u = [1, 2, 3];    // 生成访问器
    string  s = "abcdefg";

    uint[] c;  //storage
    function g(){
        c = new uint[](7);
        c.length = 10;   //可以修改storage的数组
        c[9] = 100;
    }
    
    function h() public  returns (uint) {
        return bytes(s).length;
    }
    
    function f() public  returns (byte) {
        return bytes(s)[1];     // 转为数组访问
    }

}
```

打开[Remix - Solidity IDE](https://ethereum.github.io/browser-solidity),帖入代码，依次创建合约，如图：
![](https://img.learnblockchain.cn/2017/testarray.jpg!wl)

创建合约后，可以看到public的数组u，生成了对应访问器，可直接访问。


-->


