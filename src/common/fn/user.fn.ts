import faker from 'faker';
import { IServerState } from '../interface/server-state.interface';
import { IUserDto } from '../interface/user-dto.interface';
import { IUser } from "../interface/user.interface";

export const User = {
  /**
   * Get user by id
   * Assert exists
   *
   * @param state
   * @param user_id
   */
  byId(state: IServerState, user_id: string): IUser {
    const game = state.usersById[user_id];
    if (!game) throw new ReferenceError(`User ${user_id} not found`);
    return game;
  },

  /**
   * Transform the User to a UserDto
   *
   * @param user
   */
  dto(user: IUser): IUserDto {
    const dto: IUserDto = {
      id: user.id,
      name: user.name,
    };

    return dto;
  },

  /**
   * Is the user registered?
   */
  isRegistered(state: IServerState, user_id: string): boolean {
    return Object.prototype.hasOwnProperty.call(state.usersById, user_id);
  },
}