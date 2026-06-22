import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hasumane" },
      { name: "description", content: "A farmer entrepreneurship and organic dairy initiative" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Hasumane" },
      {
        property: "og:description",
        content: "A farmer entrepreneurship and organic dairy initiative",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Hasumane" },
      {
        name: "twitter:description",
        content: "A farmer entrepreneurship and organic dairy initiative",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4a38885c-2e65-4a7c-8bd0-ce2ad95a408f/id-preview-3c5434af--ec1b7ee2-fc79-45c1-a0d7-8f22f15c3779.lovable.app-1781732528553.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4a38885c-2e65-4a7c-8bd0-ce2ad95a408f/id-preview-3c5434af--ec1b7ee2-fc79-45c1-a0d7-8f22f15c3779.lovable.app-1781732528553.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Inter:wght@100;200;300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const [fadeOutPreloader, setFadeOutPreloader] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleVideoReady = () => {
      setVideoReady(true);
    };
    window.addEventListener("hasumane-video-ready", handleVideoReady);

    // Safety fallback: fade out anyway after 2.5s if event isn't received (e.g. slow network / other page)
    const safetyTimeout = setTimeout(() => {
      setVideoReady(true);
    }, 2500);

    return () => {
      lenis.destroy();
      window.removeEventListener("hasumane-video-ready", handleVideoReady);
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    if (!videoReady) return;

    const fadeTimeout = setTimeout(() => {
      setFadeOutPreloader(true);
    }, 100);

    const hideTimeout = setTimeout(() => {
      setShowPreloader(false);
    }, 500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [videoReady]);

  return (
    <QueryClientProvider client={queryClient}>
      {showPreloader && (
        <div className={`preloader-screen ${fadeOutPreloader ? "fade-out" : ""}`}>
          <div className="flex flex-col items-center gap-20 select-none animate-fade-in duration-700">
            <div className="relative flex items-center justify-center h-80 w-80 rounded-full bg-vivid-lime/10 border border-vivid-lime/20 text-vivid-lime shadow-xl">
              <svg
                viewBox="0 0 24 24"
                className="h-40 w-40 animate-pulse"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M4 20c0-9 7-16 16-16-0.5 9-7.5 16-16 16Z" />
                <path d="M4 20c4-4 8-7 14-12" />
              </svg>
              <div
                className="absolute inset-0 rounded-full border border-vivid-lime animate-spin"
                style={{
                  borderRightColor: "transparent",
                  borderBottomColor: "transparent",
                  borderLeftColor: "transparent",
                  animationDuration: "1s",
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="font-reckless text-[36px] text-pure-white leading-tight tracking-tight">
                HasuMane
              </h1>
              <p className="font-sans text-[12px] text-vivid-lime/75 uppercase tracking-[0.2em] mt-5">
                Halliyinda Nimma Manege
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
