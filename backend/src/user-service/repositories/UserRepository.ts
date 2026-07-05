import { Cliente, type Usuario } from "../domain/User.js";

export type CustomerSnapshot = {
  id: string;
  email: string;
  profile: string;
  run: string;
  fullName: string;
  address: string;
  commune: string;
  province: string;
  region: string;
  birthDate: string;
  sex: string;
  phone: string;
  emailValidated: boolean;
};

export class UserRepository {
  private readonly users = new Map<string, Usuario>();

  async save(user: Usuario): Promise<Usuario> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<Usuario | undefined> {
    return this.users.get(id);
  }

  async findByEmail(email: string): Promise<Usuario | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async listCustomers(): Promise<Cliente[]> {
    return Array.from(this.users.values()).filter((user): user is Cliente => user instanceof Cliente);
  }
}

export interface UserPersistenceRepository {
  save(user: Usuario): Promise<Usuario>;
  findById(id: string): Promise<Usuario | undefined>;
  findByEmail(email: string): Promise<Usuario | undefined>;
  listCustomers(): Promise<Cliente[]>;
}

export function toCustomerSnapshot(customer: Cliente): CustomerSnapshot {
  return {
    id: customer.id,
    email: customer.email,
    profile: customer.profile,
    run: customer.run,
    fullName: customer.fullName,
    address: customer.address,
    commune: customer.commune,
    province: customer.province,
    region: customer.region,
    birthDate: customer.birthDate,
    sex: customer.sex,
    phone: customer.phone,
    emailValidated: customer.emailValidated
  };
}
