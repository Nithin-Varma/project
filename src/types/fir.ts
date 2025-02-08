export interface FIR {
  id: number;
  complainant: string;
  title: string;
  description: string;
  location: string;
  timestamp: number;
  isResolved: boolean;
  status: string;
}

export interface NewFIR {
  title: string;
  description: string;
  location: string;
}