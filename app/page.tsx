import { redirect } from "next/navigation";

// A gyökér URL mindig a dashboardra irányít (Clerk middleware védi azt)
export default function Home() {
  redirect("/dashboard");
}
