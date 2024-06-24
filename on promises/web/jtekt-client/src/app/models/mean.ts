export interface History {
  id: number;
  username: string;
  created_at: string;
  in_out: string;
  duration_out: number | null;
  duration_in: number | null;
}

export interface Mean {
  id: number;
  storage: number;
  serial_number: string;
  licence_number: string;
  type: string;
  name: string;
  in_out: string;
  lastDate: string;
  meanNumber: string;
  histories: History[];
}
