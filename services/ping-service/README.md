# Simplest gRPC service skeleton (Ping/Echo/Error)

- [Simplest gRPC service skeleton (Ping/Echo/Error)](#simplest-grpc-service-skeleton-pingechoerror)
  - [gRPC testing](#grpc-testing)
  - [Running the Docker Container Locally](#running-the-docker-container-locally)
  - [Test gRPC service by grpcurl tool calls](#test-grpc-service-by-grpcurl-tool-calls)
- [References](#references)

## gRPC testing

## Running the Docker Container Locally

To build and run the Docker container for the ping service locally, follow these steps:

1. Navigate to the `services/ping-service` directory.
2. Build the Docker image:

```bash
# Build the container
docker build -t ping-service .

# Run the Docker container
docker run -p 50051:50051 ping-service
```

This will expose the gRPC service on port 50051 of your local machine.

Note: Ensure you have Docker installed and running on your machine before executing these commands.

## Test gRPC service by grpcurl tool calls

```bash
# list available services (may fail: `Failed to list services: server does not support the reflection API`)
grpcurl -vv -plaintext localhost:50051 list
# diia.Ping

# describe service
grpcurl -vv -plaintext localhost:50051 describe
# diia.Ping is a service:
# service Ping {
#   rpc echo ( .diia.EchoRequest ) returns ( .diia.EchoResponse );
#   rpc error ( .diia.ErrorRequest ) returns ( .diia.ErrorResponse );
#   rpc ping ( .diia.PingRequest ) returns ( .diia.PingResponse );
# }

# call ping method
grpcurl -plaintext localhost:50051 diia.Ping.ping
# {
#   "message": "Pong"
# }

# un-implemented response sample
grpcurl -plaintext -d '{ "message": "test" }' localhost:50051 diia.Ping.echo2
# ERROR:
#   Code: Unimplemented
#   Message: The server does not implement the method /diia.Ping/echo2
```

# References

- https://rsbh.dev/blogs/grpc-with-nodejs-typescript