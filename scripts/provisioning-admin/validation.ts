export interface BatchUserAccount {
  email: string;
  name: string;
  password: string;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: unknown): void {
  if (typeof password !== "string" || password.trim().length === 0) {
    throw new Error("Mot de passe manquant ou vide.");
  }
  if (password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }
}

export function parseBatchEnvJson(envVarName: string): BatchUserAccount[] {
  const raw = process.env[envVarName];
  if (!raw || !raw.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`La variable d'environnement ${envVarName} contient un JSON invalide.`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`La variable d'environnement ${envVarName} doit être un tableau JSON.`);
  }

  const accounts: BatchUserAccount[] = [];
  const seenEmails = new Set<string>();

  for (const item of parsed) {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Élément invalide détecté dans ${envVarName}.`);
    }

    const record = item as Record<string, unknown>;
    const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const password = typeof record.password === "string" ? record.password : "";

    if (!isValidEmail(email)) {
      throw new Error(`Email invalide détecté dans ${envVarName} : "${email}"`);
    }
    if (!name) {
      throw new Error(`Nom manquant ou vide pour l'email ${email} dans ${envVarName}`);
    }
    validatePassword(password);

    if (seenEmails.has(email)) {
      throw new Error(`Email en double détecté dans ${envVarName} : ${email}`);
    }

    seenEmails.add(email);
    accounts.push({ email, name, password });
  }

  return accounts;
}
