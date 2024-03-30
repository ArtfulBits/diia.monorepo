/* eslint-disable */
import { ChannelCredentials, Client, makeGenericClientConstructor, Metadata } from "@grpc/grpc-js";
import type {
  CallOptions,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "diia";

export interface PingRequest {
}

export interface PingResponse {
  message: string;
}

export interface ErrorRequest {
}

export interface ErrorResponse {
  code: number;
}

export interface EchoRequest {
  message: string;
}

export interface EchoResponse {
  message: string;
}

function createBasePingRequest(): PingRequest {
  return {};
}

export const PingRequest = {
  encode(_: PingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): PingRequest {
    return {};
  },

  toJSON(_: PingRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<PingRequest>, I>>(base?: I): PingRequest {
    return PingRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PingRequest>, I>>(_: I): PingRequest {
    const message = createBasePingRequest();
    return message;
  },
};

function createBasePingResponse(): PingResponse {
  return { message: "" };
}

export const PingResponse = {
  encode(message: PingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PingResponse {
    return { message: isSet(object.message) ? globalThis.String(object.message) : "" };
  },

  toJSON(message: PingResponse): unknown {
    const obj: any = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PingResponse>, I>>(base?: I): PingResponse {
    return PingResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PingResponse>, I>>(object: I): PingResponse {
    const message = createBasePingResponse();
    message.message = object.message ?? "";
    return message;
  },
};

function createBaseErrorRequest(): ErrorRequest {
  return {};
}

export const ErrorRequest = {
  encode(_: ErrorRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ErrorRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseErrorRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ErrorRequest {
    return {};
  },

  toJSON(_: ErrorRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ErrorRequest>, I>>(base?: I): ErrorRequest {
    return ErrorRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ErrorRequest>, I>>(_: I): ErrorRequest {
    const message = createBaseErrorRequest();
    return message;
  },
};

function createBaseErrorResponse(): ErrorResponse {
  return { code: 0 };
}

export const ErrorResponse = {
  encode(message: ErrorResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ErrorResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseErrorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ErrorResponse {
    return { code: isSet(object.code) ? globalThis.Number(object.code) : 0 };
  },

  toJSON(message: ErrorResponse): unknown {
    const obj: any = {};
    if (message.code !== 0) {
      obj.code = Math.round(message.code);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ErrorResponse>, I>>(base?: I): ErrorResponse {
    return ErrorResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ErrorResponse>, I>>(object: I): ErrorResponse {
    const message = createBaseErrorResponse();
    message.code = object.code ?? 0;
    return message;
  },
};

function createBaseEchoRequest(): EchoRequest {
  return { message: "" };
}

export const EchoRequest = {
  encode(message: EchoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EchoRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEchoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EchoRequest {
    return { message: isSet(object.message) ? globalThis.String(object.message) : "" };
  },

  toJSON(message: EchoRequest): unknown {
    const obj: any = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EchoRequest>, I>>(base?: I): EchoRequest {
    return EchoRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EchoRequest>, I>>(object: I): EchoRequest {
    const message = createBaseEchoRequest();
    message.message = object.message ?? "";
    return message;
  },
};

function createBaseEchoResponse(): EchoResponse {
  return { message: "" };
}

export const EchoResponse = {
  encode(message: EchoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EchoResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEchoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EchoResponse {
    return { message: isSet(object.message) ? globalThis.String(object.message) : "" };
  },

  toJSON(message: EchoResponse): unknown {
    const obj: any = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EchoResponse>, I>>(base?: I): EchoResponse {
    return EchoResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EchoResponse>, I>>(object: I): EchoResponse {
    const message = createBaseEchoResponse();
    message.message = object.message ?? "";
    return message;
  },
};

export type PingService = typeof PingService;
export const PingService = {
  ping: {
    path: "/diia.Ping/ping",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PingRequest) => Buffer.from(PingRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PingRequest.decode(value),
    responseSerialize: (value: PingResponse) => Buffer.from(PingResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => PingResponse.decode(value),
  },
  error: {
    path: "/diia.Ping/error",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ErrorRequest) => Buffer.from(ErrorRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ErrorRequest.decode(value),
    responseSerialize: (value: ErrorResponse) => Buffer.from(ErrorResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ErrorResponse.decode(value),
  },
  echo: {
    path: "/diia.Ping/echo",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: EchoRequest) => Buffer.from(EchoRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => EchoRequest.decode(value),
    responseSerialize: (value: EchoResponse) => Buffer.from(EchoResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => EchoResponse.decode(value),
  },
} as const;

export interface PingServer extends UntypedServiceImplementation {
  ping: handleUnaryCall<PingRequest, PingResponse>;
  error: handleUnaryCall<ErrorRequest, ErrorResponse>;
  echo: handleUnaryCall<EchoRequest, EchoResponse>;
}

export interface PingClient extends Client {
  ping(request: PingRequest, callback: (error: ServiceError | null, response: PingResponse) => void): ClientUnaryCall;
  ping(
    request: PingRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: PingResponse) => void,
  ): ClientUnaryCall;
  ping(
    request: PingRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: PingResponse) => void,
  ): ClientUnaryCall;
  error(
    request: ErrorRequest,
    callback: (error: ServiceError | null, response: ErrorResponse) => void,
  ): ClientUnaryCall;
  error(
    request: ErrorRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ErrorResponse) => void,
  ): ClientUnaryCall;
  error(
    request: ErrorRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ErrorResponse) => void,
  ): ClientUnaryCall;
  echo(request: EchoRequest, callback: (error: ServiceError | null, response: EchoResponse) => void): ClientUnaryCall;
  echo(
    request: EchoRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: EchoResponse) => void,
  ): ClientUnaryCall;
  echo(
    request: EchoRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: EchoResponse) => void,
  ): ClientUnaryCall;
}

export const PingClient = makeGenericClientConstructor(PingService, "diia.Ping") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PingClient;
  service: typeof PingService;
  serviceName: string;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
