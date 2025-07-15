import { Roles } from "@/types/globals";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata.role === role;
};

export const getRole = async () => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata.role;
};

export const isAdmin = async () => {
  // Check if the current user has the 'admin' role
  const { sessionClaims } = await auth();
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(sessionClaims?.sub || "");
    console.log("User :", user);
    return user.publicMetadata.role === "admin";
  } catch {
    return false;
  }
};
