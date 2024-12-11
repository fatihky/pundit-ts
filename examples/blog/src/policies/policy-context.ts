import { User } from "../models";

export class PolicyContext {
  constructor(readonly actor: User | null = null) {}
}
