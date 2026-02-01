import { auth } from "@/lib/auth/authConfig";

/**
 * Check if the current user is an admin
 * Returns the session if admin, null otherwise
 */
export async function checkIsAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL environment variable not set");
    return null;
  }

  // Support multiple admin emails separated by comma
  const adminEmails = adminEmail.split(',').map(email => email.trim().toLowerCase());
  const isAdmin = adminEmails.includes(session.user.email.toLowerCase());

  return isAdmin ? session : null;
}
