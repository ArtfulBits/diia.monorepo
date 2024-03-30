import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ReflectionService } from "@grpc/reflection";
import debug from "debug";
import fs from "node:fs";
import path from "node:path";

import { PingServer, PingService } from "./generated/ping";

const log = debug("ping-service");
const logError = log.extend("error");

log.enabled = true;
logError.enabled = true;

const SSL_CERTIFICATE_PATH =
  process.env.HOST_SSL_CA || path.resolve(`${__dirname}/../cert.pem`);
const SSL_KEY_PATH =
  process.env.HOST_SSL_KEY || path.resolve(`${__dirname}/../key.pem`);
const SSL_CLIENT = Boolean(process.env.HOST_CHECK_CLIENT_SSL) || false;
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50051;
const PROTO_FILE = `${__dirname}/../protos/ping.proto`;

type Resources = {
  // TODO (olku): add declaration of global resources, like: mongodb, redis, rabbitmq, etc.
};

const initializeResources = (): Resources => {
  log("Initializing global resources...");
  // TODO (olku): Implement resource initialization logic here
  //    e.g., database connections, file system setup, etc.
  log("Global resources initialized.");

  return {};
};

const shutdownResources = (_resource: Resources) => {
  log("Shutting down global resources...");
  // TODO (olku): Implement resource shutdown logic here. (can be called multiple times)
  //    e.g., closing database connections, cleaning up temp files, etc.
  log("Global resources shut down.");
};

const withReflectionService = (server: grpc.Server) => {
  const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };

  const pkg = protoLoader.loadSync(PROTO_FILE, loaderOptions);
  const reflection = new ReflectionService(pkg);
  reflection.addToServer(server);

  return server;
};

type PingMethod = PingServer["ping"];
type ErrorMethod = PingServer["error"];
type EchoMethod = PingServer["echo"];

const getServerImplementation = (_resources: Resources = {}): PingServer => {
  // TODO (olku): use provided resources or create new shaed in function scope

  const ping: PingMethod = async (call, callback) => {
    log("Ping request received.", call.getPath());

    callback(null, { message: "Pong" });
  };

  const error: ErrorMethod = async (call, callback) => {
    log("Error request received. Throwing an exception.", call.getPath());

    callback({
      code: grpc.status.INTERNAL,
      message: "Intentional error thrown",
    });
  };

  const echo: EchoMethod = async (call, callback) => {
    log("Echo request received.", call.getPath());

    callback(null, { message: call.request.message });
  };

  return { ping, error, echo };
};

const ERROR_BIND = "Failed to bind server";
const INTERRUPT = "Caught interrupt SIGINT signal. Shutting down...";
const TERMINATE = "Caught interrupt SIGTERM signal. Shutting down...";

const configureSslSupport = () => {
  if (fs.existsSync(SSL_CERTIFICATE_PATH) && fs.existsSync(SSL_KEY_PATH)) {
    log("SSL support enabled.", {
      key: path.relative(__dirname, path.resolve(SSL_KEY_PATH)),
      cert: path.relative(__dirname, path.resolve(SSL_CERTIFICATE_PATH)),
    });

    const privateKey = fs.readFileSync(SSL_KEY_PATH);
    const certificate = fs.readFileSync(SSL_CERTIFICATE_PATH);
    const rootCerts = null;
    const pairs = { private_key: privateKey, cert_chain: certificate };

    return grpc.ServerCredentials.createSsl(rootCerts, [pairs], SSL_CLIENT);
  }

  return grpc.ServerCredentials.createInsecure();
};

const main = () => {
  const resources = initializeResources();
  const gracefulResourcesShutdown = (message: string) => {
    log(message);

    server.tryShutdown((err) => {
      if (err) logError(`Error during shutdown: ${err.message}`);
      shutdownResources(resources);

      process.exit(err ? 1 : 0);
    });
  };

  const server = withReflectionService(new grpc.Server());
  server.addService(PingService, getServerImplementation(resources));

  const serverCredentials = configureSslSupport();
  server.bindAsync(`${HOST}:${PORT}`, serverCredentials, (error, port) => {
    if (error) {
      logError(`Server failed to bind: ${error.message}`, error);
      gracefulResourcesShutdown(ERROR_BIND);
      return;
    }

    const protocol = serverCredentials._isSecure() ? "https" : "http";
    log(`Server running at ${protocol}://${HOST}:${port}.`);

    process.on("SIGINT", () => gracefulResourcesShutdown(INTERRUPT));
    process.on("SIGTERM", () => gracefulResourcesShutdown(TERMINATE));
  });
};

main();
