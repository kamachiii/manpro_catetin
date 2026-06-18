import { redirect } from "next/navigation";
import { getUser, getUserProfile } from "./get-user";

export async function requireAdmin() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(user.id);
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, profile };
}
