import { getSMJSession } from "lib/auth/auth";
import CenteredBox from "lib/components/auth/CenteredBox";
import SignInClientPage from "lib/components/auth/SignInClientPage";
import { redirect } from "next/navigation";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function SignInPage({ searchParams }: Props) {
  const session = await getSMJSession();
  if (searchParams?.callbackUrl && session) {
    if (typeof searchParams.callbackUrl === "string") {
      redirect(searchParams.callbackUrl);
    }
    redirect(searchParams.callbackUrl[0]);
  } else if (session) {
    redirect("/");
  }

  return (
    <CenteredBox>
      <SignInClientPage />
    </CenteredBox>
  );
}
