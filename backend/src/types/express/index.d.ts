// src/types/index.d.ts
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
