#!/usr/bin/env bash

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null
then
    echo "mkcert could not be found, installing it using Homebrew..."
    brew install mkcert

    # Create a local CA
    mkcert -install
fi

if [ -f "key.pem" ] || [ -f "cert.pem" ]; then
    echo "SSL certificates already exist."
    exit 0
fi

# Generate certificates for localhost
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1 0.0.0.0

echo "SSL certificates generated successfully."
