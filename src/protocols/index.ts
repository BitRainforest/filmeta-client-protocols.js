import { exception, format } from '../utils';
import { HttpClient } from './http';
import { WsClient } from './ws';
import { generateRandomStr, RandomType } from 'comsvr-random';

export enum ProtocolType {
  HTTP = 1,
  WebSocket,
}

export interface ProtocolOptions {
  auth?: {
    token?: (() => string) | string;
    authHeader?: string;
  }; // 用户权限标识符，用于请求时鉴权使用。
}

export interface JsonRpcV2Request {
  jsonrpc: string;
  id: number;
  method: string;
  params: any[];
}

export interface JsonRpcV2Error {
  code: number;
  message: string;
}

export class Protocol {
  private readonly url: string;
  private readonly protocolType: ProtocolType;
  private readonly options: ProtocolOptions;
  private readonly headers: { [index: string]: string };
  private readonly client: HttpClient | WsClient;

  constructor(
    url: string,
    protocolType: ProtocolType,
    options: ProtocolOptions,
  ) {
    this.url = format.getTokenUrl(format.getHttpUrl(url), options);
    this.protocolType = protocolType;
    this.options = options;
    this.headers = format.getHeader(options);
    switch (protocolType) {
      case ProtocolType.HTTP:
        this.client = new HttpClient(url, options);
        break;
      case ProtocolType.WebSocket:
        this.client = new WsClient(url, options);
        break;
      default:
        throw exception.error(
          '[filmeta-client-protocols.js-Error] Is not a valid protocolType, Please use ProtocolType.HTTP or ProtocolType.WebSocket.',
        );
    }
  }

  private static getJsonRpcRequest(
    method: string,
    params: any[],
  ): JsonRpcV2Request {
    return {
      jsonrpc: '2.0',
      id: parseInt(
        `${`${Date.now()}`.substring(2, 11)}${generateRandomStr(
          RandomType.IntRandom,
          4,
        )}`,
      ),
      method,
      params,
    };
  }

  // FIXME: 根据实际情况做进一步调整
  send(method: string, params: any[]) {
    return this.client.send(Protocol.getJsonRpcRequest(method, params));
  }

  sendSubscription(method: string, params: any[]) {
    if (this.client instanceof WsClient) {
      return this.client.sendSubscription(
        Protocol.getJsonRpcRequest(method, params),
      );
    } else {
      return [
        Promise,
        Promise.reject(
          '[filmeta-client-protocols.js-Error] Subscriptions only supported for WebSocket transport',
        ),
      ];
    }
  }

  create(url?: string, protocolType?: ProtocolType, options?: ProtocolOptions) {
    return new Protocol(
      url || this.url,
      protocolType || this.protocolType,
      options || this.options,
    );
  }

  async destroy(code = 1000) {
    // List of codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
    if (this.client instanceof WsClient) {
      this.client.close(code);
    }
  }
}
