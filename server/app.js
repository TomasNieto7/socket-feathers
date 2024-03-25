import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';

const app = feathers();
const port = 5000;


let onlineUsers = []

const addNewUser = (username, rol, socketId) => {
  !onlineUsers.some((user) => user.username === username && user.rol === rol) &&
    onlineUsers.push({
      username,
      rol,
      socketId
    })
}

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
}

const getUser = (username, rol) => {
  return onlineUsers.find(user => user.username === username && user.rol === rol)
}

// Maneja las conexiones de Socket.io
app.configure(

  socketio({
      cors: {
        origin: 'http://localhost:3000',
      }
    },
    (io) => {
      io.on("connection", (socket) => {

        socket.on("newUser", (username, rol) => {
          addNewUser(username, rol, socket.id)
        })

        socket.on("sendNotification", ({ senderName, receiverName, receiverRol, text }) => {
          const receiver = getUser(receiverName, receiverRol);
          if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit("getNotification", {
              senderName,
              text
            });
          } else {
            console.error("Receiver or receiver.socketId is undefined.");
          }
        })

        socket.on("disconnect", () => {
          removeUser(socket.id)
        })

      })
    }
  )

)

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
})