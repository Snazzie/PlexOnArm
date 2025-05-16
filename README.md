# PlexOnArm

<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="PlexOnArm Logo" width="128" height="128">
</p>

A lightweight, cross-platform desktop application that provides a dedicated Plex Media Player experience optimized for ARM-based devices (and works great on x86 too!).

## Features

- **Native Desktop Experience**: Runs Plex in a dedicated desktop application instead of a browser tab
- **Fullscreen Support**: Automatically detects when Plex enters fullscreen mode and adjusts the application window accordingly
- **Optimized Performance**: Built with Tauri for minimal resource usage and fast startup times
- **Cross-Platform**: Works on Windows, macOS, and Linux, with special optimizations for ARM devices
- **Secure**: Uses Tauri's security model to provide a sandboxed environment

## Installation

### Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/yourusername/PlexOnArm/releases) page.

### Building from Source

1. Clone this repository
2. Make sure you have [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/) installed
3. Install pnpm: `npm install -g pnpm`
4. Install dependencies: `pnpm install`
5. Build the application: `pnpm tauri build`

## Usage

1. Launch the PlexOnArm application
2. Click "Continue to Plex" on the welcome screen
3. Log in to your Plex account
4. Enjoy your media in a dedicated desktop application!

## Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/PlexOnArm.git
cd PlexOnArm

# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## How It Works

PlexOnArm uses Tauri to create a native desktop application that loads the Plex web interface. 

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tauri](https://tauri.app/) for providing the framework to build this application
- [Plex](https://www.plex.tv/) for their amazing media server and player

---

<p align="center">
  Made with ❤️ for the Plex community
</p>
