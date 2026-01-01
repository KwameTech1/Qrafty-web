import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.tsx";

export function ClerkProviderWithRouter({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
    | string
    | undefined;
  const clerkJSUrl = import.meta.env.VITE_CLERK_JS_URL as string | undefined;
  const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API as
    | string
    | undefined;

  if (!publishableKey) {
    throw new Error(
      "Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in your environment (Vercel) and redeploy."
    );
  }

  if (import.meta.env.DEV) {
    console.debug(
      `[clerk] publishable key set=${Boolean(publishableKey)} frontendApi=${
        frontendApi ?? "(unset)"
      } clerkJSUrl=${clerkJSUrl ?? "(default)"}`
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      frontendApi={frontendApi}
      clerkJSUrl={clerkJSUrl}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProviderWithRouter>
        <App />
      </ClerkProviderWithRouter>
    </BrowserRouter>
  </StrictMode>
);
