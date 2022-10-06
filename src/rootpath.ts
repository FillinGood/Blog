import path from 'path';

const cwd = process.cwd();
export default function rootpath(...p: string[]) {
  return path.join(cwd, ...p);
}
