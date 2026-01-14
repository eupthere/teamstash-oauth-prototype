import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

@Injectable()
export class UserStore {
  private users: Map<string, User> = new Map();

  /**
   * Create a new user with a unique UUID
   */
  createUser(email: string, passwordHash: string): User {
    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  /**
   * Find a user by email (case-insensitive)
   */
  findByEmail(email: string): User | undefined {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Find a user by ID
   */
  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Check if a user with the given email already exists
   */
  emailExists(email: string): boolean {
    return this.findByEmail(email) !== undefined;
  }

  /**
   * Get all users (for debugging purposes)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Clear all users (for testing purposes)
   */
  clear(): void {
    this.users.clear();
  }
}
