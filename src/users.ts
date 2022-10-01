import { getDatabase } from './db';

export interface IUser {
  id: number;
  login: string;
  hash: string;
}

export type RegisterResult = User | 'login' | 'unknown';

export default class User implements IUser {
  private _id: number;
  private _login: string;
  private _hash: string;

  get id() {
    return this._id;
  }
  get login() {
    return this._login;
  }
  get hash() {
    return this._hash;
  }

  constructor(user: IUser) {
    this._id = user.id;
    this._login = user.login;
    this._hash = user.hash;
  }

  async setLogin(login: string) {
    try {
      const result = await getDatabase().run(
        'UPDATE users SET login = ? WHERE id = ?',
        login,
        this.id
      );
      return result.changes === 1;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  async setHash(hash: string) {
    try {
      const result = await getDatabase().run(
        'UPDATE users SET hash = ? WHERE id = ?',
        hash,
        this.id
      );
      return result.changes === 1;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  static async get(id: number) {
    const user = await getDatabase().get<IUser>('SELECT * FROM users WHERE id = ?', id);
    return user ? new User(user) : undefined;
  }

  static async find(login: string) {
    const user = await getDatabase().get<IUser>(
      'SELECT * FROM users WHERE login = ?',
      login
    );
    return user ? new User(user) : undefined;
  }

  static async auth(login: string, hash: string) {
    const user = await getDatabase().get<IUser>(
      'SELECT id FROM users WHERE login = ? AND hash = ?',
      login,
      hash
    );
    return user ? new User(user) : undefined;
  }

  static async register(login: string, hash: string): Promise<RegisterResult> {
    try {
      const user = await User.find(login);
      if (user) return 'login';
      const result = await getDatabase().run(
        'INSERT INTO users (login, hash) VALUES (?,?)',
        login,
        hash
      );
      console.log(result);
      return new User({ id: result.lastID, login, hash });
    } catch (e: any) {
      console.error(e);
      return 'unknown';
    }
  }
}
