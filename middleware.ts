export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/portal/:path*"], // all customer portal routes
};

