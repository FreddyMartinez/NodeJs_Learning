import { pbkdf2, randomBytes } from 'crypto';

export function generateSalt(): string {
  return generateToken(16);
}

export function encrypt(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

export function validatePassword(password: string, salt: string, hash: string): Promise<boolean> {
  return encrypt(password, salt).then((derivedKey) => derivedKey === hash);
}

export function generateToken(length: number): string {
  return randomBytes(length).toString('hex');
}
