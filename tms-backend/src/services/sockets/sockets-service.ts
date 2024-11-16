import "reflect-metadata";
import http from "http";
import { injectable } from "inversify";
import { SocketServer } from "./socket-server";

export class SocketsService {
  private socketServer!: SocketServer;

  constructor() {}

  /**
   * Init and start socket server
   *
   * @param {http.Server} server
   * @returns
   */
  public async start(server: http.Server) {
    if (this.socketServer) {
      return;
    }

    this.socketServer = new SocketServer();
    await this.socketServer.start(server);
  }

  /**
   * Emits an event that's registered in the frontend
   *
   * @param {string} event name of the event
   * @param {any} data data to be sent
   */
  public publish(event: string, data: any) {
    /**
     * "server:event" is predefined channel for every server event.
     * Every socket-client in the frontend has subscribed in this event
     */
    this.socketServer.io.emit(event, data);
  }

  /**
   * Emits an event that's registered in the frontend
   *
   * Consider to prefix the event with its namespace on the event variable. For
   * example if the namespace name is "admin", then the event name should be "admin:eventName"
   * @param {string} event name of the event
   * @param {string} receiver room name or SocketId (used for private messaging)
   * @param {string} namespace namespace name
   *
   */
  public publishTo(namespace: string, receiver: string, event: string) {
    this.socketServer.io.of(namespace).to(receiver).emit(event);
  }
}
