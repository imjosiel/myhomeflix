// NextAuth type definitions
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    roles: string[];
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    roles?: string[];
  }
}
