import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ApiDocsClientView } from "@/components/ApiDocsClientView";

export default async function ApiDocsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <ApiDocsClientView user={user} />;
}
