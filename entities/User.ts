// entities/User.ts

export type Role = "customer" | "staff";

export interface User {
  id: string;
  full_name: string;
  organization?: string;
  user_type: Role;

  loginWithRedirect(callbackUrl: string): Promise<any>;
}

export const UserEntity = {
  me: async (): Promise<User> => {
    return {
      id: "1",
      full_name: "Jane Doe",
      organization: "Acme Inc.",
      user_type: "customer",
      loginWithRedirect: async (callbackUrl: string) => {
        console.log(`Redirecting to login with callback: ${callbackUrl}`);
        // In real implementation you'd trigger OAuth/NextAuth redirect here
        return Promise.resolve(true);
      },
    };
  },

  logout: async (): Promise<void> => {
    console.log("User logged out");
  },
};
