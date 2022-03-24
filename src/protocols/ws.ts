import { JsonRpcV2Error, JsonRpcV2Request, ProtocolOptions } from './index';
import { exception, format, println } from '../utils';
import { isBrowser, isNode, isObjectString, noEmpArray } from 'comsvr-ast';
import * as Ws from 'ws';
import { RawData } from 'ws';

export class WsClient {
  private readonly url: string;
  private readonly options: ProtocolOptions;
  private client!: Ws | WebSocket;
  private sendCbPool!: Map<
    string | number,
    [(result: any) => void, (err: JsonRpcV2Error) => void]
  >;
  private subCbPool!: Map<
    string | number,
    [(result: any) => void, (err: JsonRpcV2Error) => void]
  >;

  constructor(url: string, options: ProtocolOptions) {
    this.url = format.getTokenUrl(format.getWsUrl(url), options);
    this.options = options;
    this.sendCbPool = new Map<
      string | number,
      [(result: any) => void, (err: JsonRpcV2Error) => void]
    >();
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
        'Environment exception: detected that the current environment is neither Node.js nor websocket-enabled browser. If you are using a browser, your current browser may not support native WebSockets and window.',
      );
    }
    this.onMessage();
    this.disConnect();
  }

  // *保留*
  private close() {
    switch (this.client.readyState) {
      case this.client.CONNECTING:
        setTimeout(() => {
          this.close();
        }, 1000);
        break;
      case this.client.OPEN:
        this.client.close();
        break;
    }
  }

  // **- 内部监听接口 -**
  private onMessage() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    function parseData(rawData: RawData) {
      const data = rawData.toString();

      if (isObjectString(data)) {
        const { id, error, result } = JSON.parse(data);
        // TODO: 更加详细的处理
        const cbArray = that.sendCbPool.get(id);
        if (noEmpArray(cbArray)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const [successFunc, failFunc] = cbArray;
          that.sendCbPool.delete(id);
          if (error) {
            failFunc(error.message);
          } else {
            successFunc(result);
          }
          return;
        }

        const subCbArray = that.subCbPool.get(id);
        if (noEmpArray(subCbArray)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const [successFunc, failFunc] = subCbArray;
          if (error) {
            failFunc(error.message);
          } else {
            successFunc(result);
          }
          return;
        }
        // TODO: 取消订阅
      }
      println.error('Invalid RPC response: ', data);
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
      this.open();
    };
  }

  // **- 外部接口 -**
  send(rpcRequest: JsonRpcV2Request) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    return new Promise((resolve, reject) => {
      this.client.send(JSON.stringify(rpcRequest));
      this.sendCbPool.set(rpcRequest.id, [
        (result: any) => {
          resolve(result);
        },
        (error: JsonRpcV2Error) => {
          reject(error);
        },
      ]);
    });
  }

  sendSubscription(
    rpcRequest: JsonRpcV2Request,
    callback: {
      func: (result: any) => void;
      err: (err: JsonRpcV2Error) => void;
    },
  ) {
    this.client.send(JSON.stringify(rpcRequest));
    this.sendCbPool.set(rpcRequest.id, [callback.func, callback.err]);
  }
}
