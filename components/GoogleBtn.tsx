import { auth, signIn, signOut } from "@/auth";

export default async function GoogleBtn() {
  const session = await auth();
  console.log(session);
  const user = session?.user;

  return (
    <>
      {user ? (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit">SignOut</button>
        </form>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/notes" });
          }}
        >
          <button type="submit">SignIn with Google</button>
        </form>
      )}
    </>
  );
}
