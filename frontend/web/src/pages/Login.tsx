import { useSearchParams } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";

import Footer from "../components/Footer";

export default function Login() {
  const [searchParams] = useSearchParams();

  const next = searchParams.get("next") || "/app";

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 p-6">
        <div className="mx-auto w-full max-w-md">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl={`/signup?next=${encodeURIComponent(next)}`}
            fallbackRedirectUrl={next}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
