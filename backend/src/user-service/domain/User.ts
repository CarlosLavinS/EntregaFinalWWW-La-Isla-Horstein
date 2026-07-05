export type UserProfile = "CLIENTE" | "ADMIN" | "DESPACHO" | "DUENO" | "CAJERO_VIRTUAL";

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly profile: UserProfile
  ) {}

  authenticate(password: string): boolean {
    return this.passwordHash === Usuario.hashPassword(password);
  }

  static hashPassword(password: string): string {
    return Buffer.from(`fukusuke:${password}`).toString("base64");
  }
}

export class Cliente extends Usuario {
  constructor(
    id: string,
    email: string,
    passwordHash: string,
    public readonly run: string,
    public readonly fullName: string,
    public readonly address: string,
    public readonly commune: string,
    public readonly province: string,
    public readonly region: string,
    public readonly birthDate: string,
    public readonly sex: string,
    public readonly phone: string,
    public readonly emailValidated: boolean
  ) {
    super(id, email, passwordHash, "CLIENTE");
  }
}

export class Administrador extends Usuario {
  constructor(
    id: string,
    email: string,
    passwordHash: string,
    public readonly employeeRun: string,
    public readonly position: string
  ) {
    super(id, email, passwordHash, "ADMIN");
  }
}
