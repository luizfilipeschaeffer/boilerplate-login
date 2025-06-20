import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Início",
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
  return null;
}
