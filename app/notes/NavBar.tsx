import GoogleBtn from "@/components/GoogleBtn";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <div className="p-4 shadow">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
        <Link href="/notes" className="flex items-center gap-1">
          <Image src="/mainlogo.png" alt="ainotelogo" width={33} height={33} />
          <span className="font-bold">ainoteapp</span>
        </Link>
        <div className="flex items-center gap-2">
          <GoogleBtn />
          <Button>
            <Plus size={20} className="mr-2" />
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
