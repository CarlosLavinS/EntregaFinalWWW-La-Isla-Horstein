export interface EmailValidator {
  validateExists(email: string): Promise<boolean>;
}

export class SimulatedEmailValidator implements EmailValidator {
  async validateExists(email: string): Promise<boolean> {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
