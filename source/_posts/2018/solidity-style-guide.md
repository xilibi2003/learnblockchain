---
title: 智能合约最佳实践 之 Solidity 编码规范
permalink: solidity-style-guide
date: 2018-05-04 10:22:08
categories: 
    - 以太坊
    - Solidity
tags:
    - Solidity手册
author: Tiny熊
---

每一门语言都有其相应的编码规范， Solidity 也一样， 下面官方推荐的规范及我的总结，供大家参考，希望可以帮助大家写出更好规范的智能合约。

<!-- more -->

## 命名规范

### 避免使用

小写的l，大写的I，大写的O 应该避免在命名中单独出现，因为很容易产生混淆。

### 合约、库、事件、枚举及结构体命名
  
  合约、库、事件及结构体命名应该使用单词首字母大写的方式，这个方式也称为：帕斯卡命名法或大驼峰式命名法，比如：SimpleToken， SmartBank， CertificateHashRepository，Player。
  
### 函数、参数、变量及修饰器

函数、参数、变量及修饰器应该使用首单词小写后面单词大写的方式，这个方式也称为：（小）驼峰式命名法，是一种混合大小写的方式，如：

* 函数名应该如：getBalance，transfer，verifyOwner，addMember。
* 参数和变量应该如：initialSupply，senderAddress，account，isPreSale。
* 修饰器应该如：onlyAfter，onlyOwner。


## 代码格式相关

### 缩进

使用空格（spaces）而不是Tab, 缩进应该是4个空格

### 空行

合约之间应该有空行，例如：

```js
contract A {
    ...
}
    
    
contract B {
    ...
}
    
    
contract C {
    ...
}
```
    
而不是使用：

```js
contract A {
    ...
}
contract B {
    ...
}
    
contract C {
    ...
}
```
    
* 函数之间应该有空行，例如：

```js
contract A {
    function spam() public {
        ...
    }
    
    function ham() public {
        ...
    }
}
```

没有实现的话，空行可以省去，如：

```js
contract A {
    function spam() public;
    function ham() public;
}
```

而不是：

```js
contract A {
    function spam() public {
        ...
    }
    function ham() public {
        ...
    }
}
```

### 左括号应该跟定义在一行

定义包括合约定义、函数定义、库定义、结构体定义等等，例如推荐使用：

```js
 contract Coin {
    struct Bank {
        address owner;
        uint balance;
    }
}
```

而不是：

```js
contract Coin
{
    struct Bank {
        address owner;
        uint balance;
    }
}
```

### 左括号应该跟条件控制在一行

在使用if, else, while, for 时，推荐的写法是：

```js
if (...) {
    ...
}

for (...) {
    ...
}
```

而不是：

```js
if (...)
{
    ...
}

while(...){
}

for (...) {
    ...;}
```

如果控制语句内只有一行，括号可省略，如：

```js
if (x < 10)
    x += 1;
```

但像下面一个语句有多方就不能省略，如：

```js
if (x < 10)
    someArray.push(Coin({
        name: 'spam',
        value: 42
    }));
```

### 表达式内的空格

* 一个单行的表达里，在小括号、中括号、大括号里应该避免不必要的空格，例如推荐使用：
    
    ```js
    spam(ham[1], Coin({name: "ham"}));
    ```
    
    而不是：
    
    ```js
    spam( ham[ 1 ], Coin( { name: "ham" } ) );
    ```
    
    有一种例外是，结尾的括号跟在结束的分号后面， 应该加一个空格，如下面的方式也是推荐的：
    
    ```js
    function singleLine() public { spam(); }
    ```

* 分号；前不应该有空格，例如推荐使用：
    
    ```js
    function spam(uint i, Coin coin) public;
    ```
    
    而不是：
    
    ```js
    function spam(uint i , Coin coin) public ;
    ```

* 不要为对齐添加不必要的空格，例如推荐使用：

    ```js
    x = 1;
    y = 2;
    long_variable = 3;
    ```
    
    而不是：
    
    ```js
    x             = 1;
    y             = 2;
    long_variable = 3;
    ```
    
* 回退函数不应该有空格，例如推荐使用：

    ```js
    function() public {
        ...
    }
    
    ``` 
    
    而不是：
    
    ```js
    function () public {
        ...
    }
    ```



### 控制每一行长度

每行不应该太长，最好在79（或99）个字符以内，函数的参数应该是单独的行，且只有一个缩进，例如推荐的方式是：

```js
thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3
);
```

而不是：

```js
thisFunctionCallIsReallyLong(longArgument1,
                              longArgument2,
                              longArgument3
);

thisFunctionCallIsReallyLong(longArgument1,
    longArgument2,
    longArgument3
);

thisFunctionCallIsReallyLong(
    longArgument1, longArgument2,
    longArgument3
);

thisFunctionCallIsReallyLong(
longArgument1,
longArgument2,
longArgument3
);

thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3);
```

对应的赋值语句应该是这样写：

 ```js
 thisIsALongNestedMapping[being][set][to_some_value] = someFunction(
    argument1,
    argument2,
    argument3,
    argument4
);
 ```
 
而不是：

```js
thisIsALongNestedMapping[being][set][to_some_value] = someFunction(argument1,
                                                                   argument2,
                                                                   argument3,
                                                                   argument4);
```

事件定义也应该遵循同样的原则，例如应该使用：

```js
event LongAndLotsOfArgs(
    adress sender,
    adress recipient,
    uint256 publicKey,
    uint256 amount,
    bytes32[] options
);

LongAndLotsOfArgs(
    sender,
    recipient,
    publicKey,
    amount,
    options
);
```

而不是：

```js
event LongAndLotsOfArgs(adress sender,
                        adress recipient,
                        uint256 publicKey,
                        uint256 amount,
                        bytes32[] options);

LongAndLotsOfArgs(sender,
                  recipient,
                  publicKey,
                  amount,
                  options);
```

### 文件编码格式

推荐使用utf-8 及 ASCII 编码

### 引入文件应该在最上方

建议使用：

```js
import "owned";


contract A {
    ...
}


contract B is owned {
    ...
}
```

而不是：
 
```js
contract A {
    ...
}


import "owned";


contract B is owned {
    ...
}
```

## 函数编写规范

### 函数的顺序
在编写函数的时候，应该让大家容易找到构造函数，回退函数，官方推荐的的函数顺序是：

1. 构造函数
2. 回退函数 (如果有)
3. 外部函数（external）
4. 公有函数(public)
5. 内部函数(internal)
6. 私有函数（private）

同一类函数时，constant函数放在后面， 例如推荐方式为：

```js
 contract A {
    // 构造函数
    function A() public {
        ...
    }

    // 回退函数
    function() public {
        ...
    }

    // 外部函数
    // ...

    // 带有constant 外部函数 
    // ...

    // 公有函数
    // ...

    // 内部函数
    // ...

    // 私有函数
    // ...
}
```

而不是下面的函数顺序：

```js
 contract A {


    // 外部函数
    // ...

    // 公有函数
    // ...

    // 内部函数
    // ...
    
    function A() public {
        ...
    }

    function() public {
        ...
    }

    // 私有函数
    // ...
}
```

### 明确函数的可见性

所有的函数（包括构造函数）应该在定义的时候明确函数的可见性，例如应该使用：

```js
function explicitlyPublic(uint val) public {
    doSomething();
}
```

而不是

```js
function implicitlyPublic(uint val) {
    doSomething();
}
```

### 可见性应该在修饰符前面

函数的可见性应该写在自定义的函数修饰符前面，例如：

```js
function kill() public onlyowner {
    selfdestruct(owner);
}
```

而不是

```js
function kill() onlyowner public {
    selfdestruct(owner);
}
```

### 区分函数和事件

为了防止函数和事件（Event）产生混淆，声明一个事件使用大写并加入前缀（可使用LOG）。对于函数， 始终以小写字母开头，构造函数除外。
 
```js
// 不建议
event Transfer() {}
function transfer() {}

// 建议
event LogTransfer() {}
function transfer() external {}
```

### 常量

常量应该使用全大写及下划线分割大词的方式，如：MAX_BLOCKS，TOKEN_NAME， CONTRACT_VERSION。

强烈安利一门课程给大家：[深入详解以太坊智能合约语言Solidity](https://ke.qq.com/course/326528)

## 参考文献
[Solidity style-guide](https://solidity.readthedocs.io/en/v0.4.23/style-guide.html)

[深入浅出区块链](https://learnblockchain.cn/) - 系统学习区块链，打造最好的区块链技术博客。
如果你想和我有密切的联系，欢迎加入知识星球[深入浅出区块链](https://learnblockchain.cn/images/zsxq.png)，我会在星球为大家解答技术问题，作为星友福利，星友可加入我创建的区块链技术群，群内已经聚集了200多位区块链技术牛人和爱好者。


