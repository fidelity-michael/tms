/**
 * Interface for user sockets type.
 * Key: socketId, Value: userId
 */
export interface UserSockets {
  [socketId: string]: string;
}

export class UserSocketStore {
  private static instance: UserSocketStore;
  public userSockets: UserSockets = {};

  private constructor(){}

  /**
   * Returns the UserSocketStore instance 
   * @returns {UserSocketStore} class instance
   */
  static getInstance(): UserSocketStore {
    if(!UserSocketStore.instance)
      UserSocketStore.instance = new UserSocketStore();
    return UserSocketStore.instance;
  }

  /**
  * Adds key-value pair for socket to user pairing
  * @param userId {string} user id
  * @param socketId {string} socket id
  */
  addUserSocket(socketId: string, userId: string){
    this.userSockets[socketId] = userId;
  }

  /**
  * Remove key-value pair of socketId to user 
  * @param socketId {string} socket id
  */
  removeUserSocket(socketId: string){
    delete this.userSockets[socketId];
  }
}
