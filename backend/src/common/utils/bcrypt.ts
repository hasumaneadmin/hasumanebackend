import bcryptDefault from "bcryptjs";
import * as bcryptNamespace from "bcryptjs";

type BcryptApi = Pick<typeof bcryptDefault, "hash" | "compare">;

function resolveBcrypt(): BcryptApi {
  const namespaceCandidate = bcryptNamespace as unknown as Partial<BcryptApi> & {
    default?: Partial<BcryptApi>;
  };

  if (
    typeof namespaceCandidate.hash === "function" &&
    typeof namespaceCandidate.compare === "function"
  ) {
    return namespaceCandidate as BcryptApi;
  }

  const defaultCandidate = (namespaceCandidate.default ?? bcryptDefault) as Partial<BcryptApi>;
  if (
    typeof defaultCandidate.hash === "function" &&
    typeof defaultCandidate.compare === "function"
  ) {
    return defaultCandidate as BcryptApi;
  }

  throw new Error("bcryptjs module did not expose hash and compare functions.");
}

export const bcrypt = resolveBcrypt();
