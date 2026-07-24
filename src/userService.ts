import { findAllUsers, findUserById } from "./userRepository";
import type { PublicUser, User } from "./types";

export function toPublicUser(user: User): PublicUser;
export function toPublicUser(user: User | undefined): PublicUser | undefined;
export function toPublicUser(user: User | undefined): PublicUser | undefined {
  if (!user) {
    return undefined;
  }

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function listPublicUsers(): PublicUser[] {
  return findAllUsers().map((user) => toPublicUser(user));
}

export function getPublicUser(id: string): PublicUser | undefined {
  return toPublicUser(findUserById(id));
}
