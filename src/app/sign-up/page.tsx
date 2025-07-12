'use client';
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white py-16 px-4">
      <SignUp path="/sign-up" routing="path" signInUrl="/login" redirectUrl="/dashboard" />
    </main>
  );
}
