// TODO: Need changes for socket events
import http, { Server } from "http";
import io from "socket.io";
import { Logger } from "../../../api/shared/utils/logger";
import { config, getHostDomain } from "../../../config/environment";
import { UserSockets } from "../../../api/v1/users/user-controller";
import { RateLimiterMemory } from "rate-limiter-flexible";

export class SocketServer {
  private logger: Logger = Logger.getInstance();
  public io!: io.Server;
  public users: UserSockets; // For notifications

  constructor() {
    this.users = {};
  }

  /**
   * Start the Socket Server.
   *
   * @param {http.Server} server
   */
  public async start(server: http.Server) {
    try {
      // create socket io server
      this.io = new io.Server(server, { path: "", cors: { origin: "*" } });

      // register events on connect
      this.onConnect();

      this.logger.success(
        `Sockets are established on path: ${getHostDomain()}`,
      );
    } catch (e) {
      this.logger.error("Socket server failed to start", e);
    }
  }

  //#region Private methods

  /**
   * On server connection.
   */
  private onConnect() {
    this.io.on("connection", (socket) => {
      // same as: `.of("/")`
      this.logger.debug("Connection event triggered");
      this.logger.debug("New client has connected");
      //emit welcome message from server to user handshake verify function
      socket.emit("welcome", {
        message: "connection was successful",
      });
      this.onSubscribe(socket);
      this.onUnsubscribe(socket);
      this.onDisconnect(socket);
      this.onClientEvent(socket);
    });

    this.io.of("/notification").on("connection", (socket) => {
      this.logger.debug("Connection event (notification) triggered");
      socket.emit("welcome", {
        message: "connection to notification socket was successful",
      });

      this.onMap(socket);
      this.onNotificationEvent(socket);
      this.onDisconnect(socket);
    });

    this.io.of("/chat").on("connection", (socket) => {
      this.logger.debug("Connection event (chat) triggered");
      socket.emit("welcome", {
        message: "connection to chat was successful",
      });

      //for ddos attack prevention
      const msgRateLimiter = new RateLimiterMemory({
        points: 3, // 3 messages
        duration: 1, // per second
      });

      this.onMap(socket);
      this.onPrivateMessage(socket, msgRateLimiter);
      this.onChatEvent(socket);
      this.onDisconnect(socket);
    });
  }
  /**
   * On subscribe to a channel.
   *
   * @param {io.Socket} socket
   */
  private onSubscribe(socket: io.Socket): void {
    socket.on("subscribe", (data: any) => {
      this.logger.debug("subscribe");
    });
  }

  /**
   * On unsubscribe from a channel.
   *
   * @param {io.Socket} socket
   */
  private onUnsubscribe(socket: io.Socket): void {
    socket.on("unsubscribe", (data: any) => {
      this.logger.debug("unsubscribe");
    });
  }

  /**
   * On socket disconnecting.
   *
   * @param {io.Socket} socket
   */
  private onDisconnect(socket: io.Socket): void {
    socket.on("disconnect", (reason: any) => {
      this.removeUser(socket);
    });
  }

  /**
   * On client events.
   *
   * @param {io.Socket} socket
   */
  private onClientEvent(socket: io.Socket): void {
    socket.on("client:event", (data: any) => {
      this.logger.debug("client event");
      this.io.emit(data.event, data.data);
    });
  }

  private onNotificationEvent(socket: io.Socket): void {
    socket.on("notification:event", (data: any) => {
      this.logger.debug("notification event");
      this.io.emit(data.event, data.data);
    });
  }

  private onChatEvent(socket: io.Socket): void {
    socket.on("chat:event", (data: any) => {
      this.logger.debug("chat event");
      this.io.emit(data.event, data.data);
    });
  }

  /**
   * On UpdateWall event to a channel.
   *
   * @param {io.Socket} socket
   */
  private onUpdateWall(socket: io.Socket): void {
    socket.on("updateWall", (data: any) => {
      this.logger.debug("On updateWall event");
      this.io.emit("updateWall", data);
    });
  }

  /**
   * On UpdateWall event to a channel.
   *
   * @param {io.Socket} socket
   */
  private onUpdateTable(socket: io.Socket): void {
    socket.on("updateTable", (data: any) => {
      this.logger.debug("On updateTable event");
      this.io.emit("updateTable", data);
    });
  }

  /**
   * On Map event to a channel for notification/chat use
   *
   * @param {io.Socket} socket
   */
  private onMap(socket: io.Socket): void {
    socket.on("map", (userId: string) => {
      this.logger.debug("On map event");
      this.users[socket.id] = userId;
      this.logger.debug(userId, " connected");
    });
  }

  /**
   * On onPrivateMessage event for chat usage
   *
   * @param {io.Socket} socket
   * @param msgRateLimiter object of RateLimiterMemory class
   */
  private onPrivateMessage(
    socket: io.Socket,
    msgRateLimiter: RateLimiterMemory,
  ): void {
    socket.on("privateMessage", (data) => {
      msgRateLimiter
        .consume(socket.id) // consume 1 point per event
        .then(() => {
          var receiverSocketIds: string[] = [];
          var senderOtherSocketIds: string[] = [];

          //we get all the current socketIds of the receiver and the sender
          Object.keys(this.users).forEach((key) => {
            //key is the socket.id of the receiver

            //for receiver
            if (this.users[key] === data.receiverId) {
              receiverSocketIds.push(key);
            }

            //for sender
            if (this.users[key] === data.senderId && key !== socket.id) {
              senderOtherSocketIds.push(key);
            }
          });

          //emit to all of the receiver sockets
          if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach((socketId) => {
              socket.to(socketId).emit("privateMessage", data);
            });
          }

          //emit to the other sockets of the sender (px. open multiple tabs)
          if (senderOtherSocketIds.length > 0) {
            senderOtherSocketIds.forEach((socketId) => {
              socket.to(socketId).emit("myMessage", data);
            });
          }
        })
        .catch((err) => {
          console.log("Tooo many messages sent (DDoS prevention)");
        });
    });
  }
  // #region Helper methods
  private removeUser(socket: io.Socket) {
    const user = this.users[socket.id];
    this.logger.debug(user + " disconnected");
    delete this.users[socket.id]; // remove from mapping
  }
  // #endregion Helper methods
  // --------------------------------

  //#endregion Private methods
  // --------------------------------
}
