import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/notes");
  }
  return (
    <main className="flex flex-col h-screen items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image
          src="/mainlogo.png"
          alt="ainotapp logo"
          width={100}
          height={100}
        />
        <span className="font-extrabold tracking-tight text-4xl lg:text-5xl">
          ainoteapp
        </span>
      </div>
      <p className=" max-w-prose text-center">
        An ai app to let you live a better life with your notes
      </p>
      <Button size="lg" asChild>
        <Link href={"/notes"}>Open</Link>
      </Button>
    </main>
  );
}
