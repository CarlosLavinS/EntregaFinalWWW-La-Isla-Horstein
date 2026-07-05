import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import { Administrador, Cliente, Usuario, type UserProfile } from "../domain/User.js";
import type { UserPersistenceRepository } from "./UserRepository.js";

export class PrismaUserRepository implements UserPersistenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: Usuario): Promise<Usuario> {
    if (user instanceof Cliente) {
      await this.prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          passwordHash: user.passwordHash,
          profile: user.profile,
          run: user.run,
          fullName: user.fullName,
          address: user.address,
          commune: user.commune,
          province: user.province,
          region: user.region,
          birthDate: user.birthDate,
          sex: user.sex,
          phone: user.phone,
          emailValidated: user.emailValidated
        },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          profile: user.profile,
          run: user.run,
          fullName: user.fullName,
          address: user.address,
          commune: user.commune,
          province: user.province,
          region: user.region,
          birthDate: user.birthDate,
          sex: user.sex,
          phone: user.phone,
          emailValidated: user.emailValidated
        }
      });
      return user;
    }

    if (user instanceof Administrador) {
      await this.prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          passwordHash: user.passwordHash,
          profile: user.profile,
          employeeRun: user.employeeRun,
          position: user.position
        },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          profile: user.profile,
          employeeRun: user.employeeRun,
          position: user.position
        }
      });
      return user;
    }

    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        profile: user.profile
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        profile: user.profile
      }
    });
    return user;
  }

  async findById(id: string): Promise<Usuario | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomainUser(user) : undefined;
  }

  async findByEmail(email: string): Promise<Usuario | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? toDomainUser(user) : undefined;
  }

  async listCustomers(): Promise<Cliente[]> {
    const users = await this.prisma.user.findMany({ where: { profile: "CLIENTE" } });
    return users.map(toDomainUser).filter((user): user is Cliente => user instanceof Cliente);
  }
}

function toDomainUser(user: PrismaUser): Usuario {
  if (user.profile === "CLIENTE") {
    return new Cliente(
      user.id,
      user.email,
      user.passwordHash,
      user.run ?? "",
      user.fullName ?? "",
      user.address ?? "",
      user.commune ?? "",
      user.province ?? "",
      user.region ?? "",
      user.birthDate ?? "",
      user.sex ?? "",
      user.phone ?? "",
      user.emailValidated
    );
  }

  if (user.profile === "ADMIN") {
    return new Administrador(
      user.id,
      user.email,
      user.passwordHash,
      user.employeeRun ?? "",
      user.position ?? ""
    );
  }

  return new Usuario(user.id, user.email, user.passwordHash, user.profile as UserProfile);
}
