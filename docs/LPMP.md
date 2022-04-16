# Log Provider Management Protocol

- built on top of `WebSocket` connections
- data encoding: `JSON`
- authorization: `onConnect` via url-parameter token

## Messages

### List Streams

Get a list of all available log streams.

Strategy: Bidirectional; Pull

Request:
```json
{
  "opr": "GetStreams",
  "payload": {}
}
```
Response:
```json
{
  "opr": "StreamsList",
  "payload": {
    "value": [...]
  }
}
```

### Log

A Stream received a new log

Strategy: Push

Message:
```json
{
  "opr": "Log",
  "payload": {
    "stream": "<stream-id>",
    "value": "..."
  }
}
```

### Log Batch

A Stream received a new batch of logs

Strategy: Push

Message:
```json
{
  "opr": "LogBatch",
  "payload": {
    "stream": "<stream-id>",
    "value": [...]
  }
}
```

### Subscribe To Stream

Subscribe to a log stream to receive live updates

Strategy: send by client; no answer

Message:
```json
{
  "opr": "Subscribe",
  "payload": {
    "stream": "<stream-id>"
  }
}
```

### Unsubscribe From Stream

Unsubscribe from a log stream

Strategy: send by client; no answer

Message:
```json
{
  "opr": "Unsubscribe",
  "payload": {
    "stream": "<stream-id>"
  }
}
```

### Stream Closed

Notify, that a los stream was closed

Strategy: Push

Message:
```json
{
  "opr": "Close",
  "payload": {
    "stream": "<stream-id>"
  }
}
```

### Ping/Pong

Send Pings/Pongs between client or server

Strategy: Bidirectional from client/server; Push

Request:
```json
{
  "opr": "Ping",
  "payload": {}
}
```

Response:
```json
{
  "opr": "Pong",
  "payload": {}
}
```
