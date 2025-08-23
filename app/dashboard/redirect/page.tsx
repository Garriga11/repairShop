"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectByRole() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const role = session.user.role;

    if (!role) {
      console.warn("No role found in session");
      return;
    }

    if (role === "Admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/user");
    }
  }, [session, status]);

  return <p className="text-center mt-10 text-gray-600">Redirecting...</p>;
}
