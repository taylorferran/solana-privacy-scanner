FROM node:20-alpine

# Install the CLI globally
RUN npm install -g solana-privacy-scanner@latest

# Set working directory
WORKDIR /workspace

# Default command
ENTRYPOINT ["solana-privacy-scanner"]

# Usage:
# docker run solana-privacy-scanner scan-wallet <ADDRESS>
# docker run -v $(pwd):/workspace solana-privacy-scanner scan-wallet <ADDRESS> --output /workspace/report.json
