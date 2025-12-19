import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";

function HeroIllustration() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-md bg-slate-50" />
      <div className="absolute inset-0 rounded-md border border-slate-200" />
      <div className="qrafty-hero-scanline text-blue-700" aria-hidden="true" />

      <svg
        viewBox="0 0 800 450"
        className="relative h-full w-full"
        role="img"
        aria-label="Phone scanning a QR code"
      >
        <defs>
          <linearGradient id="qraftyHeroGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.10" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="800"
          height="450"
          fill="url(#qraftyHeroGlow)"
          className="text-blue-900"
        />

        {/* Phone */}
        <g
          className="text-slate-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinejoin="round"
        >
          <rect x="470" y="70" width="240" height="330" rx="34" />
          <rect
            x="500"
            y="110"
            width="180"
            height="240"
            rx="18"
            className="text-slate-200"
          />
          <line x1="555" y1="95" x2="625" y2="95" className="text-slate-200" />
          <circle cx="590" cy="370" r="10" className="text-slate-200" />
        </g>

        {/* QR card */}
        <g>
          <rect
            x="100"
            y="110"
            width="310"
            height="230"
            rx="24"
            className="text-white"
            fill="currentColor"
          />
          <rect
            x="100"
            y="110"
            width="310"
            height="230"
            rx="24"
            className="text-slate-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />

          {/* QR code grid */}
          <g transform="translate(165 145)">
            <rect
              x="0"
              y="0"
              width="180"
              height="180"
              rx="18"
              className="text-slate-100"
              fill="currentColor"
            />
            <rect
              x="0"
              y="0"
              width="180"
              height="180"
              rx="18"
              className="text-slate-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
            />

            {/* Finder patterns */}
            <g className="text-slate-900" fill="currentColor">
              <rect x="16" y="16" width="44" height="44" rx="6" />
              <rect x="120" y="16" width="44" height="44" rx="6" />
              <rect x="16" y="120" width="44" height="44" rx="6" />
              <rect
                x="28"
                y="28"
                width="20"
                height="20"
                rx="4"
                className="text-white"
              />
              <rect
                x="132"
                y="28"
                width="20"
                height="20"
                rx="4"
                className="text-white"
              />
              <rect
                x="28"
                y="132"
                width="20"
                height="20"
                rx="4"
                className="text-white"
              />
            </g>

            {/* Random modules */}
            <g className="text-slate-900" fill="currentColor" opacity="0.9">
              <rect x="80" y="34" width="14" height="14" rx="3" />
              <rect x="98" y="34" width="14" height="14" rx="3" />
              <rect x="80" y="52" width="14" height="14" rx="3" />
              <rect x="98" y="70" width="14" height="14" rx="3" />
              <rect x="116" y="70" width="14" height="14" rx="3" />

              <rect x="72" y="100" width="14" height="14" rx="3" />
              <rect x="90" y="100" width="14" height="14" rx="3" />
              <rect x="108" y="100" width="14" height="14" rx="3" />
              <rect x="126" y="100" width="14" height="14" rx="3" />

              <rect x="72" y="118" width="14" height="14" rx="3" />
              <rect x="108" y="118" width="14" height="14" rx="3" />
              <rect x="126" y="118" width="14" height="14" rx="3" />

              <rect x="80" y="144" width="14" height="14" rx="3" />
              <rect x="98" y="144" width="14" height="14" rx="3" />
              <rect x="116" y="144" width="14" height="14" rx="3" />
            </g>
          </g>
        </g>

        {/* Scan beam */}
        <g
          className="text-slate-900"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.25"
        >
          <path d="M420 230 C 470 210, 510 190, 560 170" />
          <path d="M420 255 C 470 235, 510 215, 560 195" />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col bg-linear-to-b from-white to-blue-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-900">
              Q
            </div>
            <p className="text-sm font-semibold tracking-wide text-slate-900">
              QRAFTY
            </p>
          </div>

          {user ? (
            <Link
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/app"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/signup"
            >
              Get Started
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
        <section>
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6">
                <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Scan → profile → interaction
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  QR profiles that turn scans into real business interactions.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Create a shareable QR identity, track engagement, and build a
                  presence that works everywhere—from events to storefronts.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {user ? (
                    <>
                      <Link
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        to="/app"
                      >
                        Go to dashboard
                      </Link>
                      <button
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        type="button"
                        onClick={() => void logout()}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        to="/signup"
                      >
                        Get Started
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        to="/login"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    <HeroIllustration />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                QR Card Options
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Choose how you want to share—public profiles, interaction
                tracking, and inventory-friendly QR cards.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Public QR profile
              </p>
              <p className="mt-1 text-sm text-slate-600">
                A fast, shareable page that works without an app.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Track interactions
              </p>
              <p className="mt-1 text-sm text-slate-600">
                See scans and contact events in one place.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Manage inventory
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Keep your QR cards organized across campaigns.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                How it works
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Go from setup to results in minutes.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    1) Create your profile
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Add your details once and publish a public QR page.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    2) Generate your QR card
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Create QR cards for events, products, or your storefront.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    3) Track engagement
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    See scans and contact taps in your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Benefits
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Built to feel simple, look sharp, and convert.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    One link for everything
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Share a single QR that works on any phone browser.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Built for business
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage inventory, marketplace listings, and your profile.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Clear analytics
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Understand what gets attention and what converts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Video walkthrough
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Watch a quick demo showing how to create your profile,
                  generate a QR card, and track engagement.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="aspect-video w-full">
                <video
                  className="h-full w-full"
                  controls
                  preload="metadata"
                  aria-label="QRAFTY platform walkthrough video"
                >
                  <source src="/videos/walkthrough.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
