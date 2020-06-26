'use strict';

const http = require('http');
const net = require('net');
const url = require('url');

const roundRobin = require('./utils/roundrobin');
const proxies_array = require('./private/forwarded-proxies');
const nextProxy = roundRobin(proxies_array);

const server = http.createServer((req, res) => {
  res.end("Only HTTPS supported at the moment");
});

server.on('connect', (client_req, client_socket, client_head) => {
  console.log(client_socket.remoteAddress, client_req.url);

  const proxyErrorHandler = (err) => {
    console.error(err.message);
    client_socket && client_socket.end(`HTTP/1.1 500 ${err.message}\r\n`);
  };

  const proxy_params = nextProxy();
  
  const options = {
    port: proxy_params.port,
    host: proxy_params.host,
    method: 'CONNECT',
    path: client_req.url
  };

  const proxy_req = http.request(options);
  proxy_req.end();

  proxy_req.on('error', proxyErrorHandler);
  proxy_req.on('connect', (proxy_res, proxy_socket, proxy_head) => {
    proxy_socket.on('error', proxyErrorHandler);
    client_socket.on('error', (err) => console.error(err) && proxy_socket.end());

    client_socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    proxy_socket.write(client_head);

    proxy_socket.pipe(client_socket);
    client_socket.pipe(proxy_socket);
  });  
});

server.listen(13082);
