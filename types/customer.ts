export interface Customer {
  code: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  birthDay: string | null;
  note: string | null;
  id: number;
  createdBy: string;
  createdDateTime: string;
  updatedBy: string | null;
  updatedDateTime: string | null;
}
