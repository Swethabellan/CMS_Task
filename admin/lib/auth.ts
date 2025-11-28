// Hardcoded credentials - in production use your database
const ADMIN_CREDENTIALS = {
  email: "swetha@test.com",
  passwordHash: "$2a$10$slYQmyNdGzin7olVeZixHOpsBPwqPkBR6uYMKnvxNs8qIJvlWdUTe", // bcrypt hash of "12345"
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Simple direct comparison for testing - in production use proper bcrypt
  return password === "12345" && hash === ADMIN_CREDENTIALS.passwordHash
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  if (email !== ADMIN_CREDENTIALS.email) {
    return false
  }
  return verifyPassword(password, ADMIN_CREDENTIALS.passwordHash)
}

export function getAdminInfo() {
  return {
    email: ADMIN_CREDENTIALS.email,
    name: "Swetha Admin",
    phone: "+1234567890",
    role: "Administrator",
  }
}
