A p2p-WebRTC sevice with Node.js
=======================================================

## Work in progress

Simple video chat service with WebRTC on top of a peer-to-peer network

```shell
npm run node1
```

```shell
└── src
    ├── app
    │   ├── index.js
    │   ├── routes
    │   │   ├── messages.js
    │   │   └── peers.js
    │   └── views
    │       ├── index.ejs
    │       └── video-chat.ejs
    ├── config
    │   ├── dev.js
    │   ├── index.js
    │   └── prod.js
    ├── index.js
    ├── js-scripts
    │   ├── homepage.js
    │   └── video-chat.js
    └── p2p-network
        ├── index.js
        ├── p2p-server.js
        ├── signature-tools.js
        └── utils.js
```
