# Sockets

**NodeSpring** is integrated with Socket.io, so you can handle the events on the server-side in this way:

```
@SocketListener
getGreet(name) {
  return "Hi " + name
}
```