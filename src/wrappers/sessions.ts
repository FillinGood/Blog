import { v4 as uuid } from 'uuid';
import { getDatabase } from '../db';
import User from './users';

/** session representation in database */
export interface ISession {
  token: string;
  userid: number;
  timestamp: number;
}

/** session lifespan in seconds */
export const sessionLife = 24 * 60 * 60;

/** ISession wrapper */
export default class Session implements ISession {
  /** session token */
  get token() {
    return this._token;
  }
  /** user associated with session */
  get user() {
    return this._user;
  }
  /** user id */
  get userid() {
    return this.user.id;
  }
  /** timestamp of last refresh in seconds */
  get timestamp() {
    return this._timestamp;
  }
  /** timestamp of last refresh */
  get datetime() {
    return new Date(this._timestamp * 1000);
  }
  /** whether this session is past it's lifespan */
  get expired() {
    return Date.now() / 1000 - this._timestamp > sessionLife;
  }

  private constructor(
    private _token: string,
    private _user: User,
    private _timestamp: number
  ) {}

  /**
   * wrap ISession
   * @param s data to wrap
   * @returns wrapped session
   */
  static async construct(s: ISession) {
    const user = await User.get(s.userid);

    if (!user) throw new Error('user not found: ' + s.userid);
    return new Session(s.token, user, s.timestamp);
  }

  /**
   * create new session
   * @param user user for which to create session
   * @returns new session
   */
  static async create(user: User) {
    const token = uuid();
    const timestamp = Date.now() / 1000;
    const userid = user.id;

    const result = await getDatabase().run(
      'INSERT INTO sessions (token, userid, timestamp) VALUES (?,?,?)',
      token,
      userid,
      timestamp
    );
    if (result.changes !== 1) throw new Error('failed to insert new session');
    return new Session(token, user, timestamp);
  }

  /**
   * retrieve session by it's token
   * @param token session token
   * @returns session if found
   */
  static async get(token: string) {
    const s = await getDatabase().get<ISession>(
      'SELECT * FROM sessions WHERE token = ?',
      token
    );
    return s ? Session.construct(s) : undefined;
  }

  /**
   * retrieve all sessions associated with a user
   * @param user target user
   * @returns array of user sessions
   */
  static async getAll(user: User) {
    const sessions = await getDatabase().all<ISession>(
      'SELECT * FROM sessions WHERE userid = ?',
      user.id
    );
    return Promise.all(sessions.map((s) => Session.construct(s)));
  }

  /** refreshes session's timestamp */
  async refresh() {
    const timestamp = Date.now() / 1000;

    const result = await getDatabase().run(
      'UPDATE sessions SET timestamp = ? WHERE token = ?',
      timestamp,
      this.token
    );
    if (result.changes !== 1) throw new Error('failed to refresh session');
    this._timestamp = timestamp;
  }

  /** deletes this session */
  async delete() {
    await getDatabase().run('DELETE FROM sessions WHERE token = ?', this.token);
    this._token = '';
    this._timestamp = 0;
  }
}
