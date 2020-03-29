export interface User {
  name: string;
  id: string;
}

export interface Message {
  txt: string;
  time: number;
  user: User;
}
