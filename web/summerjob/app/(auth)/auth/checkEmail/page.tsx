import { getSession } from "lib/auth/auth";
import CenteredBox from "lib/components/auth/CenteredBox";
import { redirect } from "next/navigation";
import Image from "next/image";
import logoImage from "public/logo-smj-yellow.png";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
  return (
    <CenteredBox>
      <div className="container maxwidth-500">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between gap-5">
              <h2>Přihlásit se</h2>
              <Image
                src={logoImage}
                className="smj-logo"
                alt="SummerJob logo"
                quality={98}
                priority={true}
              />
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-12 text-wrap">
            <p>Zaslali jsme Vám e-mail s odkazem pro přihlášení.</p> Pokud
            e-mail neobdržíte, zkontrolujte prosím složku SPAM.
          </div>
        </div>
      </div>
    </CenteredBox>
  );
}
