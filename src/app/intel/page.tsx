import { redirect } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Redirect /intel to /intel/dashboard
export default async function IntelPage() {
  redirect("/intel/dashboard");
}
