const useIo = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected to the server");

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export default useIo;
