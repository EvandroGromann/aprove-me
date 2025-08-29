export interface AssignorEntity {
  id: string;
  document: string;
  email: string;
  phone: string;
  name: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
