import { useSearchParams } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";

import Footer from "../components/Footer";

export default function Signup() {
  const [searchParams] = useSearchParams();

  const next = searchParams.get("next") || "/app";

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 p-6">
        <div className="mx-auto w-full max-w-md">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl={`/login?next=${encodeURIComponent(next)}`}
            fallbackRedirectUrl={next}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
