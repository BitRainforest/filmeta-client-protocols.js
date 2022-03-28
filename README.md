# @bitrainforest/filmeta-client-protocols.js

![standard-readme compliant](https://img.shields.io/badge/js--lotus--client--provider--browser-fork-yellow.svg?style=flat-square)
![standard-readme compliant](https://img.shields.io/badge/typescript-v4.5.2-green.svg?style=flat-square)

FilMeta 2.0 RPC api js client protocols. Can use Http or WebSocket.

## Table of Contents

- [Install](#install)
  - [CNPM](#cnpm)
  - [NPM](#npm)
  - [YARN](#yarn)
  - [PNPM](#pnpm)
- [Usage](#usage)
  - [Introduce](#introduce)
  - [Export](#export)
  - [Protocol Use](#protocol-use)
- [Example](#example)
  - [Javascript](#javascript)
  - [Typescript](#typescript)
- [Maintainers](#maintainers)

## Install

### CNPM

```
cnpm i @bitrainforest/filmeta-client-protocols.js --save
```

### NPM

```
npm i @bitrainforest/filmeta-client-protocols.js --save
```

### YARN

```
yarn add @bitrainforest/filmeta-client-protocols.js
```

### PNPM

```
pnpm add @bitrainforest/filmeta-client-protocols.js
```

## Usage

### Introduce

 本库为调用 `filMeta RPC` 的协议库，提供可被 `filmeta-client-rpc.js` 库调用的 `HTTP` 和 `WebSocket` 协议。

### Export

+ ProtocolType: 枚举字段，用于表明使用的是哪种协议类型，可选值为 `ProtocolType.HTTP` 和  `ProtocolType.WebSocket` 

  

+ ProtocolOptions: 类型字段，用于 `typescript`，初始化协议的选项，目前主要是传入权限信息。

  | Param  | Type | Description    | Sample                   |
  | ------ | ---- | -------------- | ------------------------ |
  | `auth` | `{}` | `权限相关信息` | `{"token":"test123123"}` |

  **ProtocolOptions.auth**

  | Param        | Type                        | Description                                                  | Sample                                                       |
  | ------------ | --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | `token`      | `(() => string)` | `string` | `token字符串 或 可以获取到 token字符串的 function。token 会自动加入请求头中，可被 authHeader 覆盖` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y` |
  | `authHeader` | `string`                    | `权限请求头，Bearer Token 格式。设置它后则权限请求头为它，会覆盖掉根据 token 生成的 权限请求头` | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y` |

   

+ Protocol: 协议基类，通过此类进行协议初始化。

  | Param          | Type              | Description    | Sample                                                       |
  | -------------- | ----------------- | -------------- | ------------------------------------------------------------ |
  | `url`          | `string`          | `RPC 目标 Url` | `ws://127.0.0.1:1234/rpc/v0`                                 |
  | `protocolType` | `ProtocolType`    | `协议类型`     | `ProtocolType.WebSocket`                                     |
  | `options`      | `ProtocolOptions` | ` 初始化选项`  | `{"auth":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y"}}` |

  

+ JsonRpcV2Error: 类型字段，用于 `typescript` ，RPC 异常返回的格式。

  + RPC 正常返回的话是直接返回 RPC 数据 ( 非 RPC 返回的全部数据，而是 RPC 返回数据的 result )，因为 RPC 数据无一致数据格式，所以正常返回无固定格式。



### Protocol Use

#### 初始化

```typescript
import { Protocol } from "@bitrainforest/filmeta-client-protocols.js";

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y"

const protocol = new Protocol("ws://127.0.0.1:1234/rpc/v0", ProtocolType.WebSocket,{auth: {token}})
```

初始化传参可参考上面的 [`[ Usage - Export - Protocol ]`](#export)。

在初始化的时候，如果你 `url` 传入的是 `http` 地址，但是 `ProtocolType` 选择的是 `WebSocket` ，则实际使用的是替换了 `url` 开头的 `WebSocket` 地址。



#### 发送请求并接受响应

```typescript
protocol.send("Filecoin.ChainHead",[]).then(
  (res: any)=>{
    console.log(res)
  },
  (err: JsonRpcV2Error)=>{
    console.log(err)
  },
)
```



不论你初始化的是 `HTTP` 短链接还是 `Websocket` 长链接，都是使用这个方法来发送请求并等待返回值。

正常的 `RPC` 响应，会直接返回给你 `RPC` 响应结构中的 `result`。

错误的 `RPC` 响应（包含带 `error` 的响应及结构不正确的响应），都会返回给你 `JsonRpcV2Error` 格式的错误信息。

数据交互采用的是 [JSON RPC 2.0 规范](https://www.jsonrpc.org/specification)。



#### 发送订阅事件及取消订阅

```typescript
const {cancel, promise} = protocol.sendSubscription("Filecoin.ChainNotify",[])

// cancel()

promise.then(
  (res: any)=>{
    console.log(res)
  },
  (err: JsonRpcV2Error)=>{
    console.log(err)
  },
)

```

使用 `sendSubscription` 来发送订阅请求，发送后会返回一个取消订阅调用函数 `cancel` 以及 接受订阅推送 Promise `promise`。



#### 关闭长链接

```typescript
protocol.destroy()
```

如你使用的是长链接，则可以使用 `destroy` 来进行关闭长链接。



#### 重建链接

```typescript
protocol.create()
```

你可以使用 `create` 来进行重新建立连接。

一般是用于 长链接关闭后打开的 场景下。



## Example

### Javascript

```javascript
const { Protocol, ProtocolType } = require("../lib");

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y"

const protocol = new Protocol("ws://127.0.0.1:1234/rpc/v0", ProtocolType.WebSocket,{auth: {token}})
protocol.send("Filecoin.ChainHead",[]).then(
  (res)=>{
    console.log(res)
  },
  (err)=>{
    console.log(err)
  },
)
```

### Typescript

```typescript
import { Protocol, ProtocolType, JsonRpcV2Error } from "@bitrainforest/filmeta-client-protocols.js";

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsImVtYWlsIjoiIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiY2x1c3RlciIsInNpZ24iLCJhZG1pbiJdLCJleHBpcmVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ.1GojU4WIhgQamPmwGA7szeHcJWlWYP5PE8BV-KdnW1Y"

const protocol = new Protocol("ws://127.0.0.1:1234/rpc/v0", ProtocolType.WebSocket,{auth: {token}})

protocol.send("Filecoin.ChainHead",[]).then(
  (res: any)=>{
    console.log(res)
  },
  (err: JsonRpcV2Error)=>{
    console.log(err)
  },
)
```

## Maintainers

[@eliassama](https://github.com/eliassama)
