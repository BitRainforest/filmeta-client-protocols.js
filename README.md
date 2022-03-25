# @bit-rainforest/filmeta-client-protocols.js

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
  - [Function](#function)
- [Example](#example)
  - [Javascript](#javascript)
  - [Typescript](#typescript)
- [Maintainers](#maintainers)

## Install

### CNPM

```
cnpm i @bit-rainforest/filmeta-client-protocols.js --save
```

### NPM

```
npm i @bit-rainforest/filmeta-client-protocols.js --save
```

### YARN

```
yarn add @bit-rainforest/filmeta-client-protocols.js
```

### PNPM

```
pnpm add @bit-rainforest/filmeta-client-protocols.js
```

## Usage

### Introduce

 本库为调用 `filMeta RPC` 的协议库，提供可被 `filmeta-client-rpc.js` 库调用的 `HTTP` 和 `WebSocket` 协议。

### Export

+ ProtocolType: 协议类型，可选值为 `ProtocolType.HTTP` 和  `ProtocolType.WebSocket` 

+ ProtocolOptions: 初始化协议的选项，目前主要是传入权限信息。

  | Param  | Type | Description    | Sample                   |
  | ------ | ---- | -------------- | ------------------------ |
  | `auth` | `{}` | `权限相关信息` | `{"token":"test123123"}` |

  **ProtocolOptions.auth**

  | Param        | Type                        | Description                                                  | Sample              |
  | ------------ | --------------------------- | ------------------------------------------------------------ | ------------------- |
  | `token`      | `(() => string)` | `string` | `token字符串 或 可以获取到 token字符串的 function。token 会自动加入请求头中，可被 authHeader 覆盖` | `test123123`        |
  | `authHeader` | `string`                    | `权限请求头，Bearer Token 格式。设置它后则权限请求头为它，会覆盖掉根据 token 生成的 权限请求头` | `Bearer test123123` |

   

+ Protocol: 协议基类，通过此类进行协议初始化。

  | Param          | Type              | Description    | Sample                            |
  | -------------- | ----------------- | -------------- | --------------------------------- |
  | `url`          | `string`          | `RPC 目标 Url` | `ws://127.0.0.1:8090`             |
  | `protocolType` | `ProtocolType`    | `协议类型`     | `ProtocolType.WebSocket`          |
  | `options`      | `ProtocolOptions` | ` 初始化选项`  | `{"auth":{"token":"test123123"}}` |

+ JsonRpcV2Error: RPC 异常返回的格式信息。

  + RPC 正常返回的话是直接返回 RPC 数据 ( 非 RPC 返回的全部数据，而是 RPC 返回数据的 result )，因为 RPC 数据无一致数据格式，所以正常返回无固定格式。





## Example

### Javascript

```javascript

```

### Typescript

```typescript

```

## Maintainers

[@eliassama](https://github.com/eliassama)
