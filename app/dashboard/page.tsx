import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to my-ads as the default dashboard view
  redirect("/dashboard/my-ads");
}
