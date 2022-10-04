export interface UserInfo {
  id: number;
  name: string;
}

export interface PageContext {
  title: string;
  page: string;
  script: string;
  user?: UserInfo;
}
