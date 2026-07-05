import { randomUUID } from "node:crypto";
import { Cliente, Usuario } from "../domain/User.js";
import { toCustomerSnapshot, type CustomerSnapshot, type UserPersistenceRepository } from "../repositories/UserRepository.js";
import type { EmailValidator } from "./EmailValidator.js";

export type CreateCustomerRequest = {
  run: string;
  fullName: string;
  address: string;
  commune: string;
  province: string;
  region: string;
  birthDate: string;
  sex: string;
  email: string;
  phone: string;
  password: string;
};

export class UserService {
  constructor(
    private readonly repository: UserPersistenceRepository,
    private readonly emailValidator: EmailValidator
  ) {}

  async createCustomer(input: CreateCustomerRequest): Promise<CustomerSnapshot> {
    this.require(input.run, "El RUN es obligatorio.");
    this.require(input.fullName, "El nombre completo es obligatorio.");
    this.require(input.email, "El correo es obligatorio.");
    this.require(input.password, "La clave es obligatoria.");

    if (await this.repository.findByEmail(input.email)) {
      throw new Error("Ya existe un usuario con ese correo.");
    }

    const emailValidated = await this.emailValidator.validateExists(input.email);
    if (!emailValidated) {
      throw new Error("El correo no tiene un formato valido o no pudo validarse.");
    }

    const customer = new Cliente(
      randomUUID(),
      input.email,
      Usuario.hashPassword(input.password),
      input.run,
      input.fullName,
      input.address,
      input.commune,
      input.province,
      input.region,
      input.birthDate,
      input.sex,
      input.phone,
      emailValidated
    );

    await this.repository.save(customer);
    return toCustomerSnapshot(customer);
  }

  async authenticate(email: string, password: string) {
    const user = await this.repository.findByEmail(email);
    if (!user || !user.authenticate(password)) {
      return { ok: false, userId: "", profile: "" };
    }
    return { ok: true, userId: user.id, profile: user.profile };
  }

  async getCustomer(id: string): Promise<CustomerSnapshot> {
    const user = await this.repository.findById(id);
    if (!(user instanceof Cliente)) {
      throw new Error("Cliente no encontrado.");
    }
    return toCustomerSnapshot(user);
  }

  async listCustomers(): Promise<CustomerSnapshot[]> {
    return (await this.repository.listCustomers()).map(toCustomerSnapshot);
  }

  private require(value: string, message: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(message);
    }
  }
}
