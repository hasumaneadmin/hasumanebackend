import bcryptDefault from "bcryptjs";
import * as bcryptNamespace from "bcryptjs";
function resolveBcrypt() {
    const namespaceCandidate = bcryptNamespace;
    if (typeof namespaceCandidate.hash === "function" &&
        typeof namespaceCandidate.compare === "function") {
        return namespaceCandidate;
    }
    const defaultCandidate = (namespaceCandidate.default ?? bcryptDefault);
    if (typeof defaultCandidate.hash === "function" &&
        typeof defaultCandidate.compare === "function") {
        return defaultCandidate;
    }
    throw new Error("bcryptjs module did not expose hash and compare functions.");
}
export const bcrypt = resolveBcrypt();
//# sourceMappingURL=bcrypt.js.map