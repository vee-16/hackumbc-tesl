export type Role = "customer" | "staff";

export interface User {
  id: string;
  full_name: string;
  organization?: string;
  user_type: Role;
  async

  loginWithRedirect(callbackUrl: string): any;
}

export const UserEntity = {
  me: async (): Promise<User> => {
    return {
      id: "1",
      full_name: "Jane Doe",
      organization: "Acme Inc.",
      user_type: "customer", // change to "staff" to test different nav
    };
  },
  logout: async () => {
    console.log("User logged out");
  },
};
