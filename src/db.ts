import sqlite3 from 'sqlite3';

class Database {
  private constructor(private db: sqlite3.Database) {
    // db.on('trace', this.trace.bind(this));
  }

  private trace(sql: string) {
    console.debug('>', sql);
  }

  static create(filename: string) {
    return new Promise<Database>((res, rej) => {
      const db = new Database(
        new sqlite3.Database(filename, (err) => {
          if (err) rej(err);
          else res(db);
        })
      );
    });
  }

  close() {
    return new Promise<void>((res, rej) => {
      this.db.close((err) => {
        if (err) rej(err);
        else res();
      });
    });
  }

  run(sql: string, ...params: any[]) {
    return new Promise<sqlite3.RunResult>((res, rej) => {
      this.db.run(sql, params, function (err) {
        if (err) rej(err);
        else res(this);
      });
    });
  }

  get<T>(sql: string, ...params: any[]) {
    return new Promise<T | undefined>((res, rej) => {
      this.db.get(sql, params, (err, row) => {
        if (err) rej(err);
        else res(row);
      });
    });
  }

  all<T>(sql: string, ...params: any[]) {
    return new Promise<T[]>((res, rej) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) rej(err);
        else res(rows);
      });
    });
  }
}

let db: Database = null!;
export async function open(filename: string) {
  db = await Database.create(filename);
}

export function getDatabase() {
  return db;
}
