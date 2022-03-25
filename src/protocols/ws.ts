import { JsonRpcV2Error, JsonRpcV2Request, ProtocolOptions } from './index';
import { exception, format, println } from '../utils';
import { isBrowser, isNode, isObjectString, noEmpArray } from 'comsvr-ast';
import * as Ws from 'ws';
import { RawData } from 'ws';
import { generateRandomStr, RandomType } from 'comsvr-random';

export class WsClient {
  private readonly url: string;
  private readonly options: ProtocolOptions;
  private client!: Ws | WebSocket;
  private cbPool!: Map<
    string | number,
    [(result: any) => void, (err: JsonRpcV2Error) => void]
  >;
  private subPool!: Map<
    string | number,
    [(result: any) => void, (err: JsonRpcV2Error) => void]
  >;
  private destroyed!: boolean;

  constructor(url: string, options: ProtocolOptions) {
    this.url = format.getTokenUrl(format.getWsUrl(url), options);
    this.options = options;
    this.cbPool = new Map<
      string | number,
      [(result: any) => void, (err: JsonRpcV2Error) => void]
    >();
    this.subPool = new Map<
      string | number,
      [(result: any) => void, (err: JsonRpcV2Error) => void]
    >();
    this.destroyed = false;
    this.open();
  }

  // **- 内部操作接口 -**
  private open() {
    if (isNode()) {
      this.client = new Ws(this.url);
    } else if (
      isBrowser() &&
      window.WebSocket &&
      Object.prototype.toString.call(window.WebSocket.prototype) ===
        '[object WebSocket]'
    ) {
      this.client = new WebSocket(this.url);
    } else {
      throw exception.error(
        '[filmeta-client-protocols.js-Error] Environment exception: detected that the current environment is neither Node.js nor websocket-enabled browser. If you are using a browser, your current browser may not support native WebSockets and window.',
      );
    }
    this.addListen();
  }

  // **- 内部监听接口 -**
  private addListen() {
    this.onMessage();
    this.disConnect();
  }

  private onMessage() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    function parseData(rawData: RawData) {
      const data = rawData.toString();

      if (isObjectString(data)) {
        const { id, error, result } = JSON.parse(data);
        // FIXME: 更加详细的处理 + 简化代码
        const cbArray = that.cbPool.get(id);
        if (noEmpArray(cbArray)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const [successFunc, failFunc] = cbArray;
          that.cbPool.delete(id);
          if (error) {
            failFunc(error);
          } else {
            successFunc(result);
          }
          return;
        }

        const subArray = that.subPool.get(id);
        if (noEmpArray(subArray)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const [successFunc, failFunc] = subArray;
          if (error) {
            failFunc(error);
          } else {
            successFunc(result);
          }
          return;
        }
      }
      println.error(
        '[filmeta-client-protocols.js-Error] Invalid RPC response: ',
        data,
      );
    }

    if (this.client instanceof Ws) {
      this.client.on('message', parseData);
    } else if (this.client instanceof WebSocket) {
      this.client.onmessage = function (event: MessageEvent) {
        parseData(event.data);
      };
    }
  }

  private disConnect() {
    this.client.onclose = () => {
      if (!this.destroyed) {
        this.open();
      }
    };
  }

  // **- 外部接口 -**
  // FIXME: 简化代码
  send(rpcRequest: JsonRpcV2Request) {
    return new Promise((resolve, reject) => {
      if (this.client.OPEN !== this.client.readyState) {
        if (this.destroyed) {
          reject('[filmeta-client-protocols.js-Error] this connect is closed.');
        }
        if (this.client instanceof Ws) {
          this.client.on('open', () => {
            resolve(this.send(rpcRequest));
          });
        } else if (this.client instanceof WebSocket) {
          this.client.addEventListener('open', () => {
            resolve(this.send(rpcRequest));
          });
        }
      } else {
        this.client.send(JSON.stringify(rpcRequest));
        this.cbPool.set(rpcRequest.id, [
          (result: any) => {
            resolve(result);
          },
          (error: JsonRpcV2Error) => {
            reject(error);
          },
        ]);
      }
    });
  }

  sendSubscription(rpcRequest: JsonRpcV2Request) {
    const promise = new Promise((resolve, reject) => {
      if (this.client.OPEN !== this.client.readyState) {
        if (this.client instanceof Ws) {
          this.client.on('open', () => {
            resolve(this.sendSubscription(rpcRequest));
          });
        } else if (this.client instanceof WebSocket) {
          this.client.addEventListener('open', () => {
            resolve(this.sendSubscription(rpcRequest));
          });
        }
      } else {
        this.client.send(JSON.stringify(rpcRequest));
        this.subPool.set(rpcRequest.id, [
          (result: any) => {
            resolve(result);
          },
          (error: JsonRpcV2Error) => {
            reject(error);
          },
        ]);
      }
    });
    async function cancel() {
      await promise;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.subPool.delete(rpcRequest.id);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.send({
        id: parseInt(
          `${`${Date.now()}`.substring(2, 11)}${generateRandomStr(
            RandomType.IntRandom,
            4,
          )}`,
        ),
        jsonrpc: '2.0',
        method: 'xrpc.cancel',
        params: [rpcRequest.id],
      });
    }
    return [cancel.bind(this), promise];
  }

  close(code: number) {
    const {
      client: { close },
    } = this;
    this.destroyed = true;
    switch (this.client.readyState) {
      case this.client.CONNECTING:
        if (this.client instanceof Ws) {
          this.client.on('open', () => {
            close(code);
          });
        } else if (this.client instanceof WebSocket) {
          this.client.addEventListener('open', () => {
            close(code);
          });
        }
        break;
      case this.client.OPEN:
        this.client.close(code);
        break;
    }
  }
}
