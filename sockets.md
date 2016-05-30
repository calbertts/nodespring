# Sockets

**NodeSpring** is integrated with Socket.io, so you can handle the events on the server-side in this way:

```javascript
@SocketListener
onServerEvent(data, socket, io) {
  // your code here
  
  socket.emit('clientEvent', responseData)
}
```

You can use the **`io`** object to access to the rest of the namespaces.