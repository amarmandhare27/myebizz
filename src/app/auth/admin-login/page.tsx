import { redirect } from "next/navigation";

export default function AdminLoginRedirectPage() {
  redirect("/auth/login?callbackUrl=/admin");
}
