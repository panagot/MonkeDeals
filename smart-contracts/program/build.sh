#!/bin/bash
set -e
set -x

# Source Rust environment
source ~/.cargo/env

# Add Solana tools to PATH
export PATH="$HOME/.cargo/bin:$HOME/solana-install/solana-release/bin:$PATH"

# Navigate to project directory
cd "$(dirname "$0")"

# Build the program
echo "Building Solana program..."
$HOME/solana-install/solana-release/bin/cargo-build-sbf \
    --manifest-path programs/dexgroup-program/Cargo.toml \
    --sbf-out-dir target/deploy

echo "Build complete!"
ls -la target/deploy/

