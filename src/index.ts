import http from 'http';
import querystring from 'querystring';
import morganBody from 'morgan-body';
import express from 'express';
import bodyParser from 'body-parser';
import httpProxyMiddleware from 'http-proxy-middleware';

const onProxyReq = (
  proxyReq: http.ClientRequest,
  req: express.Request,
  res: http.ServerResponse
): void => {
  if (!req.body || !Object.keys(req.body).length) {
    return;
  }

  var contentType = proxyReq.getHeader('Content-Type');
  let bodyData: string = '';

  if (contentType === 'application/json') {
    bodyData = JSON.stringify(req.body);
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    bodyData = querystring.stringify(req.body);
  }

  if (bodyData) {
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
};

const onProxyRes = (
  proxyRes: http.IncomingMessage,
  req: http.IncomingMessage,
  res: express.Response & { __morgan_body_response: string }
): void => {
  const bodyBuffer: Buffer[] = [];
  proxyRes.on('data', (chunk: Buffer) => {
    bodyBuffer.push(chunk);
  });
  proxyRes.on('end', () => {
    const body = Buffer.concat(bodyBuffer).toString();
    res.__morgan_body_response = body;
    if (proxyRes.statusCode) {
      res.status(proxyRes.statusCode).send(body);
    } else {
      res.send(body);
    }
  });
};

const app = express();
app.use(bodyParser.json());
morganBody(app);
app.use(
  httpProxyMiddleware({
    target: 'http://localhost:3000',
    onProxyReq,
    onProxyRes,
    selfHandleResponse: true,
  })
);

const port = 1337;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
