import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthButton from "@/app/auth-button";

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
      <nav className="bg-white shadow-md fixed-top">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link href="/admin/create" className="text-xl font-bold">
              Magic Link
            </Link>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
              <Link href="/admin/create" className="text-gray-600 hover:text-blue-500 font-medium transition-colors duration-200">Create</Link>
              <Link href="/admin/list" className="text-gray-600 hover:text-blue-500 font-medium transition-colors duration-200">List</Link>
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </>
  );
}