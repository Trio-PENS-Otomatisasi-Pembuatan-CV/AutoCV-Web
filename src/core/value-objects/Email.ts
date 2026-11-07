const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Email {
    const value = raw.trim();
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email address: ${raw}`);
    }
    return new Email(value);
  }

  static isValid(value: string): boolean {
    return EMAIL_PATTERN.test(value);
  }

  get value(): string {
    return this._value;
  }
}
