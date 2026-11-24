import { LINKEDIN_URL_PATTERN } from "../constants/validationPatterns";

export class LinkedInUrl {
  private constructor(private readonly _value: string) {}

  static create(raw: string): LinkedInUrl {
    const value = raw.trim();
    if (!LinkedInUrl.isValid(value)) {
      throw new Error(`Invalid LinkedIn URL: ${raw}`);
    }
    return new LinkedInUrl(value);
  }

  static isValid(value: string): boolean {
    return LINKEDIN_URL_PATTERN.test(value);
  }

  get value(): string {
    return this._value;
  }
}
