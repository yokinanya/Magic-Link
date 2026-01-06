import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthButton from "@/app/auth-button";
import ThemeToggle from "@/app/components/ThemeToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }


  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 w-full z-10 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link href="/admin" className="text-xl font-bold dark:text-white">
              Magic Link
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-20 bg-gray-50 dark:bg-gray-900 transition-colors h-screen overflow-hidden box-border">
          {children}
      </main>
    </>
  );
}