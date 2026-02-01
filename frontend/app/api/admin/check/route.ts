import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/authConfig";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("ADMIN_EMAIL environment variable not set");
      return NextResponse.json({ isAdmin: false });
    }

    // Support multiple admin emails separated by comma
    const adminEmails = adminEmail.split(',').map(email => email.trim().toLowerCase());
    const isAdmin = adminEmails.includes(session.user.email.toLowerCase());

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
