import argon2 from "argon2";

export async function hashPassword(plainTextPassword: string) {
  return argon2.hash(plainTextPassword);
}

export async function verifyPassword(hash: string, plainTextPassword: string) {
  return argon2.verify(hash, plainTextPassword);
}
