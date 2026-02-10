# GrassServer - A MCPE Server Software using JavaScript

GrassServer is a lightweight and efficient Minecraft Pocket Edition (MCPE) server software built using JavaScript. It aims to provide a simple and customizable platform for hosting MCPE servers with ease.

This project is built on the foundation laid by [DirtServer](https://github.com/Falkirks/DirtServer) and can run servers that players can actually connect to using the MCPE client, but it has nothing to do with the original source code of the author.

## Status

**Under Development**: This project is currently in the early stages of development. Many features are yet to be implemented.

## Version

- Server Version: 0.1.090226-dev
- MCPE Version Supported: 0.12.1 to 0.12.3 (With RakNet Protocol 7, Bedrock Protocol 34)
- Node.js Version: 14.x or higher

## Todo List

- [ ] Core World & Entities (world handling, entity management, world gen)
- [ ] Player Systems (connection, movement, inventory, auth)
- [ ] Block Interaction (place/break, physics handling)
- [x] Networking & Packets (ping/pong, packet handling, sync)
- [ ] Chat & Commands
- [ ] Plugin/Extension System
- [ ] Performance & Documentation

## Installation

1. Ensure you have Node.js installed on your system.

2. Clone the repository:

```git
git clone https://github.com/datahihi1/GrassServer.git
```

3. Navigate to the project directory:

```bash
cd GrassServer
```

4. Install the required dependencies:

```bash
npm install
```

5. Start the server:

```bash
node main.js
```

6. Connect to your server using your MCPE client.

## Contributing

Contributions are welcome! If you have any ideas, bug fixes, or improvements, feel free to open a pull request or issue on the GitHub repository.
Please make sure to follow the coding style and include tests for any new features.
