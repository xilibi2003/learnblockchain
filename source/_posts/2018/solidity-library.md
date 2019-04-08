---
title: 智能合约语言 Solidity 教程系列12 -  库的使用
permalink: solidity-library
date: 2018-08-09 10:40:56
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

这是Solidity教程系列文章第12篇介绍库的使用：库与合约的不同，使用库的正姿势。

Solidity 系列完整的文章列表请查看[分类-Solidity](https://learnblockchain.cn/categories/ethereum/Solidity/)。

<!-- more -->

## 写在前面

Solidity 是以太坊智能合约编程语言，阅读本文前，你应该对以太坊、智能合约有所了解，
如果你还不了解，建议你先看[以太坊是什么](https://learnblockchain.cn/2017/11/20/whatiseth/)

欢迎订阅[区块链技术专栏](https://xiaozhuanlan.com/blockchaincore)阅读更全面的分析文章。


## 库

库与合约类似，它也部署在一个指定的地址上（仅被部署一次，当代码在不同的合约可反复使用），然后通过EVM的特性DELEGATECALL (Homestead之前是用CALLCODE)来复用代码。库函数在被调用时，库代码是在发起合约（下文称**主调合约**：主动发起DELEGATECALL调用的合约）的上下文中执行的，使用this将会指向到主调合约，而且库代码可以访问主调合约的存储(storage)。

因为库合约是一个独立的代码，它仅可以访问主调合约明确提供的状态变量，否则，没办法法去知道这些状态变量。

对比普通合约来说，库存在以下的限制（这些限制将来也可能在将来的版本被解除）：

1. 无状态变量(state variables)。
2. 不能继承或被继承
3. 不能接收以太币
4. 不能销毁一个库

不会修改状态变量（例如被声明**view**或**pure**）库函数只能通过直接调用（如不用**DELEGATECALL**），是因为其被认为是状态无关的。

库有许多使用场景。两个主要的场景如下：

1. 如果有许多合约，它们有一些共同代码，则可以把共同代码部署成一个库。这将节省gas，因为gas也依赖于合约的规模。因此，可以把库想象成使用其合约的父合约。使用父合约（而非库）切分共同代码不会节省gas，因为在Solidity中，继承通过复制代码工作。

2. 库可用于给数据类型添加成员函数。（参见下一节Using for）

由于库被当作隐式的父合约（不过它们不会显式的出现在继承关系中，但调用库函数和调用父合约的方式是非常类似的，如库L有函数f()，使用L.f()即可访问）。库里面的内部（internal）函数被复制给使用它的合约；
同样按调用内部函数的调用方式，这意味着所有内部类型可以传进去，memory类型则通过引用传递，而不是拷贝的方式。 同样库里面的结构体structs和枚举enums也会被复制给使用它的合约。
因此，如果一个库里只包含内部函数或结构体或枚举，则不需要部署库，因为库里面的所有内容都被复制给使用它的合约。

下面的例子展示了如何使用库。

```js
pragma solidity ^0.4.16;

library Set {
  // 定义了一个结构体，保存主调函数的数据（本身并未实际存储的数据）。
  struct Data { mapping(uint => bool) flags; }

  // self是一个存储类型的引用（传入的会是一个引用，而不是拷贝的值），这是库函数的特点。
  // 参数名定为self 也是一个惯例，就像调用一个对象的方法一样.
  function insert(Data storage self, uint value)
      public
      returns (bool)
  {
      if (self.flags[value])
          return false; // 已存在
      self.flags[value] = true;
      return true;
  }

  function remove(Data storage self, uint value)
      public
      returns (bool)
  {
      if (!self.flags[value])
          return false; 
      self.flags[value] = false;
      return true;
  }

  function contains(Data storage self, uint value)
      public
      view
      returns (bool)
  {
      return self.flags[value];
  }
}

contract C {
    Set.Data knownValues;

    function register(uint value) public {
        // 库函数不需要实例化就可以调用，因为实例就是当前的合约
        require(Set.insert(knownValues, value));
    }
    // 在这个合约中，如果需要的话可以直接访问knownValues.flags，
}
```

当然，我们也可以不按上面的方式来使用库函数，可以不定义结构体，可以不使用storage类型引用的参数，还可以在任何位置有多个storage的引用类型的参数。

调用**Set.contains**，**Set.remove**，**Set.insert**都会编译为以DELEGATECALL的方式调用外部合约和库。如果使用库，需要注意的是一个真实的外部函数调用发生了。尽管msg.sender，msg.value，this还会保持它们在主调合约中的值（在Homestead之前，由于实际使用的是CALLCODE，msg.sender，msg.value会变化）。

下面的例子演示了在库中如何使用memory类型和内部函数(inernal function)来实现一个自定义类型，而不会用到外部函数调用(external function)。

```js
pragma solidity ^0.4.16;

library BigInt {
    struct bigint {
        uint[] limbs;
    }

    function fromUint(uint x) internal pure returns (bigint r) {
        r.limbs = new uint[](1);
        r.limbs[0] = x;
    }

    function add(bigint _a, bigint _b) internal pure returns (bigint r) {
        r.limbs = new uint[](max(_a.limbs.length, _b.limbs.length));
        uint carry = 0;
        for (uint i = 0; i < r.limbs.length; ++i) {
            uint a = limb(_a, i);
            uint b = limb(_b, i);
            r.limbs[i] = a + b + carry;
            if (a + b < a || (a + b == uint(-1) && carry > 0))
                carry = 1;
            else
                carry = 0;
        }
        if (carry > 0) {
            // too bad, we have to add a limb
            uint[] memory newLimbs = new uint[](r.limbs.length + 1);
            for (i = 0; i < r.limbs.length; ++i)
                newLimbs[i] = r.limbs[i];
            newLimbs[i] = carry;
            r.limbs = newLimbs;
        }
    }

    function limb(bigint _a, uint _limb) internal pure returns (uint) {
        return _limb < _a.limbs.length ? _a.limbs[_limb] : 0;
    }

    function max(uint a, uint b) private pure returns (uint) {
        return a > b ? a : b;
    }
}

contract C {
    using BigInt for BigInt.bigint;

    function f() public pure {
        var x = BigInt.fromUint(7);
        var y = BigInt.fromUint(uint(-1));
        var z = x.add(y);
    }
}
```

合约的源码中不能添加库地址，它是在编译时向编译器以参数形式提供的（这些地址须由链接器（linker）填进最终的字节码中，使用命令行编译器来进行联接 TODO）。如果地址没有以参数的方式正确给到编译器，编译后的字节码将会仍包含一个这样格式的占们符_Set___(其中Set是库的名称)。可以通过手动将所有的40个符号替换为库的十六进制地址。


## Using for 指令


指令**using A for B;**用来把库函数(从库A)关联到类型B。这些函数将会把调用函数的实例作为第一个参数。语法类似，python中的self变量一样。例如：A库有函数 **add(B b1, B b2)**，则使用**Using A for B**指令后，如果有B b1就可以使用**b1.add(b2)**。

using A for *  表示库A中的函数可以关联到任意的类型上。

在这两种情形中，所有函数，即使第一个参数的类型与调用函数的对象类型不匹配的，也会被关联上。类型检查是在函数被调用时执行，以及函数重载是也会执行检查。


**using A for B;** 指令仅在当前的作用域有效，且暂时仅仅支持当前的合约这个作用域，后续也非常有可能解除这个限制，允许作用到全局范围。如果能作用到全局范围，通过引入一些模块(module)，数据类型将能通过库函数扩展功能，而不需要每个地方都得写一遍类似的代码了。

下面我们使用Using for 指令方式重写上一节Set的例子：


```js
 pragma solidity ^0.4.16;

// 库合约代码和上一节一样
library Set {
  struct Data { mapping(uint => bool) flags; }

  function insert(Data storage self, uint value)
      public
      returns (bool)
  {
      if (self.flags[value])
        return false; // already there
      self.flags[value] = true;
      return true;
  }

  function remove(Data storage self, uint value)
      public
      returns (bool)
  {
      if (!self.flags[value])
          return false; // not there
      self.flags[value] = false;
      return true;
  }

  function contains(Data storage self, uint value)
      public
      view
      returns (bool)
  {
      return self.flags[value];
  }
}

contract C {
    using Set for Set.Data; // 这是一个关键的变化
    Set.Data knownValues;

    function register(uint value) public {
        // 现在 Set.Data都对应的成员方法
        // 效果和Set.insert(knownValues, value)相同
        require(knownValues.insert(value));
    }
}

```

同样可以使用Using for的方式来对基本类型（elementary types）进行扩展： 
 
```js
pragma solidity ^0.4.16;

library Search {
    function indexOf(uint[] storage self, uint value)
        public
        view
        returns (uint)
    {
        for (uint i = 0; i < self.length; i++)
            if (self[i] == value) return i;
        return uint(-1);
    }
}

contract C {
    using Search for uint[];
    uint[] data;

    function append(uint value) public {
        data.push(value);
    }

    function replace(uint _old, uint _new) public {
        // 进行库调用
        uint index = data.indexOf(_old);
        if (index == uint(-1))
            data.push(_new);
        else
            data[index] = _new;
    }
}
```

需要注意的是所有库调用都实际上是EVM函数调用。这意味着，如果传的是memory类型的，或者是值类型，那么进行一次拷贝，即使是self变量，解决方法是使用存储(storage)类型的引用来避免拷贝内容。


强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果想与我有更密切的交流可以选择加入我的[知识星球](https://learnblockchain.cn/images/zsxq.png)（星球成员可加入微信技术交流群）


