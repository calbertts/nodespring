# Sockets

**NodeSpring** is integrated with Socket.io, so you can handle the events on the server-side in this way:

```
@SocketListener
onServerEvent(name) {
  return "Hi " + name
}
```