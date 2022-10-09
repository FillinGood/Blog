import { getDatabase } from '../db';
import Group from './groups';

/** user representation in database */
export interface IUser {
  id: number;
  login: string;
  hash: string;
  groupid: number;
}

/**
 * return type for {@link User.register}.
 * * User - registration completed successfully.
 * * 'login' - registration cancelled, login already exists.
 * * 'unknown' - registration cancelled, reasons unknown.
 */
export type RegisterResult = User | 'login' | 'unknown';

/** wrapper on IUser */
export default class User implements IUser {
  /** user id */
  get id() {
    return this._id;
  }
  /** user login */
  get login() {
    return this._login;
  }
  /** user's password hash */
  get hash() {
    return this._hash;
  }
  /** user group */
  get group() {
    return this._group;
  }
  /** user group id */
  get groupid() {
    return this._group.id;
  }

  /**
   * wrapper on IUser
   * @param user user to wrap
   */
  private constructor(
    private _id: number,
    private _login: string,
    private _hash: string,
    private _group: Group
  ) {}

  static async construct(user: IUser) {
    const group = await Group.get(user.groupid);
    if (!group) throw new Error('invalid group');
    return new User(user.id, user.login, user.hash, group);
  }

  /**
   * changes user login
   * @param login new login
   * @returns true if successful, false otherwise
   */
  async setLogin(login: string) {
    try {
      const result = await getDatabase().run(
        'UPDATE users SET login = ? WHERE id = ?',
        login,
        this.id
      );
      if (result.changes === 1) {
        this._login = login;
        return true;
      }
      return false;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  /**
   * changes user password hash
   * @param hash new password hash
   * @returns true if successful, false otherwise
   */
  async setHash(hash: string) {
    try {
      const result = await getDatabase().run(
        'UPDATE users SET hash = ? WHERE id = ?',
        hash,
        this.id
      );
      if (result.changes === 1) {
        this._hash = hash;
        return true;
      }
      return false;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  /**
   * get user by id
   * @param id user id
   * @returns user if found
   */
  static async get(id: number) {
    const user = await getDatabase().get<IUser>('SELECT * FROM users WHERE id = ?', id);
    return user ? User.construct(user) : undefined;
  }

  /**
   * get user by login
   * @param login user login
   * @returns user if found
   */
  static async find(login: string) {
    const user = await getDatabase().get<IUser>(
      'SELECT * FROM users WHERE login = ?',
      login
    );
    return user ? User.construct(user) : undefined;
  }

  /**
   * get user by login and password hash
   * @param login user login
   * @param hash user password hash
   * @returns user if found
   */
  static async auth(login: string, hash: string) {
    const user = await getDatabase().get<IUser>(
      'SELECT id FROM users WHERE login = ? AND hash = ?',
      login,
      hash
    );
    return user ? User.construct(user) : undefined;
  }

  /**
   * creates new user with specified login and password hash
   * @param login new user login
   * @param hash new user password hash
   * @returns {}{@link RegisterResult registration result}
   */
  static async register(login: string, hash: string): Promise<RegisterResult> {
    try {
      const user = await User.find(login);
      if (user) return 'login';
      const result = await getDatabase().run(
        'INSERT INTO users (login, hash, groupid) VALUES (?,?,?)',
        login,
        hash,
        1
      );
      return User.construct({ id: result.lastID, login, hash, groupid: 1 });
    } catch (e: any) {
      console.error(e);
      return 'unknown';
    }
  }

  /**
   * checks user access to page
   * @param page page to check
   * @returns true if successful, false otherwise
   */
  async checkAccess(page: string) {
    const access = await getDatabase().all<{ 1: 1 }>(
      'SELECT 1 FROM permissions WHERE userid = ? AND page = ?',
      this._id,
      page
    );
    return access.length > 0;
  }
}
