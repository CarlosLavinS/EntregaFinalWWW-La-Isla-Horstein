import { describe, expect, it } from "vitest";
import { UserRepository } from "../src/user-service/repositories/UserRepository.js";
import { UserService } from "../src/user-service/services/UserService.js";

describe("UserService", () => {
  it("registra un cliente con correo validado y clave cifrada", async () => {
    const service = new UserService(new UserRepository(), {
      validateExists: async () => true
    });

    const customer = await service.createCustomer({
      run: "11111111-1",
      fullName: "Cliente Demo",
      address: "Av. Pajaritos 123",
      commune: "Maipu",
      province: "Santiago",
      region: "Metropolitana",
      birthDate: "1998-01-10",
      sex: "F",
      email: "cliente@demo.cl",
      phone: "+56911111111",
      password: "secreta"
    });

    expect(customer.emailValidated).toBe(true);
    await expect(service.authenticate("cliente@demo.cl", "secreta")).resolves.toMatchObject({
      ok: true,
      userId: customer.id,
      profile: "CLIENTE"
    });
  });

  it("rechaza correos que la API externa no valida", async () => {
    const service = new UserService(new UserRepository(), {
      validateExists: async () => false
    });

    await expect(
      service.createCustomer({
        run: "11111111-1",
        fullName: "Cliente Demo",
        address: "Av. Pajaritos 123",
        commune: "Maipu",
        province: "Santiago",
        region: "Metropolitana",
        birthDate: "1998-01-10",
        sex: "F",
        email: "sin-correo",
        phone: "+56911111111",
        password: "secreta"
      })
    ).rejects.toThrow("correo");
  });
});
