import { Logger } from "../../../api/shared/utils/logger";
/**
 * Interface for user sockets type.
 * Key: socketId, Value: userId
 */
export interface UserSockets {
  [socketId: string]: string;
}

export class UserSocketStore {
  private logger = Logger.getInstance();
  private static instance: UserSocketStore;
  private userSockets: UserSockets = {};

  private constructor() {}

  /**
   * Returns the UserSocketStore instance
   * @returns {UserSocketStore} class instance
   */
  static getInstance(): UserSocketStore {
    if (!UserSocketStore.instance)
      UserSocketStore.instance = new UserSocketStore();
    return UserSocketStore.instance;
  }

  public getUserSockets(): UserSockets {
    return this.userSockets;
  }

  /**
   * Adds key-value pair for socket to user pairing
   * @param userId {string} user id
   * @param socketId {string} socket id
   */
  addUserSocket(socketId: string, userId: string) {
    if (!this.userSockets[socketId]) this.userSockets[socketId] = userId;
    else
      this.logger.debug(
        `Socket ID ${socketId} already exists with user ID ${this.userSockets[socketId]}`,
      );
  }

  /**
   * Remove key-value pair of socketId to user
   * @param socketId {string} socket id
   */
  removeUserSocket(socketId: string) {
    delete this.userSockets[socketId];
  }
}
