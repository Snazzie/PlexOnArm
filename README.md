# Plex On Tauri

<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="PlexOnTauri Logo" width="128" height="128">
</p>

A lightweight, cross-platform desktop application that provides a dedicated Plex Media Player experience optimized for ARM-based devices (and works great on x86 too!).

## Features

- **Native Desktop Experience**: Serves Plex Web Client in a native desktop application.
- **Fixes Plex Windows Arm's annoying bugs**: No more skipping and fluid UI!
- **Optimized Performance**: Built with Tauri for minimal resource usage and fast startup times.
- **Change Plex Url**: Change the Plex URL to any Plex server you want. i.e tailscale VPN or local network

## Installation

### Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/yourusername/plexontauri/releases) page.

### Building from Source

1. Clone this repository
2. Make sure you have [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/) installed
3. Install pnpm: `npm install -g pnpm`
4. Install dependencies: `pnpm install`
5. Build the application: `pnpm tauri build`

#### Building for Windows ARM64

To build for Windows ARM64 devices (like Surface Pro X, Windows Dev Kit, etc.):

1. Install the ARM64 build tools in Visual Studio
2. Add the ARM64 target to your Rust installation:
   ```
   rustup target add aarch64-pc-windows-msvc
   ```
3. Build with the ARM64 target:
   ```
   pnpm tauri build -- --target aarch64-pc-windows-msvc
   ```

The ARM64 build is also automatically created by our GitHub Actions workflow when pushing to the `release` branch.

## Usage

1. Launch the Plex On Tauri application
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
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## How It Works

Plex On Tauri uses Tauri to create a native desktop application that loads the Plex web interface.

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Windows ARM64 Build**: Automatically builds and releases Windows ARM64 versions when pushing to the `release` branch
- **Release Management**: Creates draft releases that can be reviewed before publishing

You can find the workflow configurations in the `.github/workflows` directory.

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
