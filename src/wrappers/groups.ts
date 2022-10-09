import { getDatabase } from '../db';
import User, { IUser } from './users';

/** group representation in database */
export interface IGroup {
  id: number;
  name: string;
}

/** wrapper on IGroup */
export default class Group implements IGroup {
  private _id: number;
  private _name: string;

  /** group id */
  get id() {
    return this._id;
  }
  /** group name */
  get name() {
    return this._name;
  }

  /**
   * wrapper on IGroup
   * @param group group to wrap
   */
  constructor(group: IGroup) {
    this._id = group.id;
    this._name = group.name;
  }

  /**
   * changes group name
   * @param name new name
   * @returns true if successful, false otherwise
   */
  async setName(name: string) {
    try {
      const result = await getDatabase().run(
        'UPDATE groups SET name = ? WHERE id = ?',
        name,
        this.id
      );
      if (result.changes === 1) {
        this._name = name;
        return true;
      }
      return false;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  /**
   * retrieves all users in this group
   * @returns array of users
   */
  async getAllUsers() {
    const users = await getDatabase().all<IUser>(
      'SELECT * FROM users WHERE groupid = ?',
      this.id
    );
    return Promise.all(users.map((u) => User.construct(u)));
  }

  /**
   * checks group access to page
   * @param page page to check
   * @returns true if successful, false otherwise
   */
  async checkAccess(page: string) {
    const access = await getDatabase().all<{ 1: 1 }>(
      'SELECT 1 FROM permissions WHERE groupid = ? AND page = ?',
      this._id,
      page
    );
    return access.length > 0;
  }

  /**
   * get group by id
   * @param id group id
   * @returns group if found
   */
  static async get(id: number) {
    const group = await getDatabase().get<IGroup>(
      'SELECT * FROM groups WHERE id = ?',
      id
    );
    return group ? new Group(group) : undefined;
  }

  /**
   * creates a new group
   * @param name group name
   * @returns new group
   */
  static async create(name: string) {
    const result = await getDatabase().run('INSERT INTO groups (name) VALUES (?)', name);
    return new Group({ id: result.lastID, name });
  }
}
