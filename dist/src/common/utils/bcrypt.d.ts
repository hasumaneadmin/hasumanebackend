import bcryptDefault from "bcryptjs";
type BcryptApi = Pick<typeof bcryptDefault, "hash" | "compare">;
export declare const bcrypt: BcryptApi;
export {};
