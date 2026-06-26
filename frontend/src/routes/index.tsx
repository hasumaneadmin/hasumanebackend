import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, type FormEvent } from "react";
import heroCattle from "@/assets/hero-cattle.jpeg.asset.json";
import grazingCow from "@/assets/grazing-cow.jpeg.asset.json";
import brownCow from "@/assets/brown-cow.jpeg.asset.json";
import calf from "@/assets/calf.jpeg.asset.json";
import raviTeja from "@/assets/ravi-teja.jpeg.asset.json";
import sujan from "@/assets/sujan.png.asset.json";
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Cpu,
  Download,
  Droplets,
  Flame,
  HandCoins,
  HeartHandshake,
  Instagram,
  Leaf,
  Linkedin,
  MapPin,
  Milk,
  PackageCheck,
  Recycle,
  Send,
  ShieldCheck,
  Smartphone,
  Sprout,
  Stethoscope,
  Truck,
  Wheat,
  User,
  Phone,
  CalendarDays,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HasuMane - The Cow's Home. From Our Fields to Your Home." },
      {
        name: "description",
        content:
          "HasuMane is a farmer entrepreneurship initiative producing chemical-free milk, curd, butter, and ghee - delivered fresh across Bengaluru.",
      },
      { property: "og:title", content: "HasuMane - From Our Fields to Your Home" },
      {
        property: "og:description",
        content:
          "A farmer entrepreneurship initiative. Chemical-free dairy, restorative agriculture, fresh to your door.",
      },
      { property: "og:image", content: heroCattle.url },
      { name: "twitter:title", content: "HasuMane - The Cow's Home" },
      {
        name: "twitter:description",
        content:
          "Chemical-free dairy and farmer entrepreneurship from Krishnagiri to Bengaluru homes.",
      },
      { name: "twitter:image", content: heroCattle.url },
    ],
    links: [{ rel: "canonical", href: "https://hasumane.com/" }],
  }),
  component: Index,
});

const HERO_VIDEO_SRC = "/hasumane-video.mp4";
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const MARQUEE = [
  "Now Delivering Fresh, Daily, Across Bengaluru",
  "Chemical-Free, Always",
  "A Farmer Entrepreneurship Initiative",
  "From the Village, to Your Home",
];

const missionCards = [
  {
    eyebrow: "01 - For Farmers",
    title: "Earn With Dignity",
    bgColor: "bg-sky-card",
    icon: HandCoins,
    body: "Better incomes, guaranteed procurement, and real ownership of their dairy business.",
  },
  {
    eyebrow: "02 - For Consumers",
    title: "Genuinely Clean Food",
    bgColor: "bg-peach-card",
    icon: ShieldCheck,
    body: "Chemical-free milk, curd, butter, and ghee - nothing added, nothing compromised.",
  },
  {
    eyebrow: "03 - For the Land",
    title: "Restore, Don't Deplete",
    bgColor: "bg-sage-card",
    icon: Sprout,
    body: "Organic methods that revive soil, water, and biodiversity instead of mining them.",
  },
];

const sustainabilityCards = [
  {
    eyebrow: "01",
    title: "Chemical-Free Fodder",
    bgColor: "bg-sky-card",
    icon: Wheat,
    body: "What the cows eat shapes everything they produce.",
  },
  {
    eyebrow: "02",
    title: "No Antibiotics or Hormones",
    bgColor: "bg-peach-card",
    icon: ShieldCheck,
    body: "Ever, on any partner farm, in any season.",
  },
  {
    eyebrow: "03",
    title: "Free-Range, Humane Care",
    bgColor: "bg-sage-card",
    icon: HeartHandshake,
    body: "Cattle are treated as living beings, not production units.",
  },
  {
    eyebrow: "04",
    title: "Dung to Biogas",
    bgColor: "bg-ash-gray",
    icon: Recycle,
    body: "Farm waste becomes farm fuel and organic fertilizer - closing the loop.",
  },
];

type ApiProduct = {
  id: string;
  code: string;
  name: string;
  productType: string;
  unit: string;
  defaultQuantity: number;
  defaultSchedule: string;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
};

type ApiProductResponse = {
  success?: boolean;
  products?: ApiProduct[];
  data?: ApiProduct[] | { products?: ApiProduct[]; data?: ApiProduct[] };
};

type SiteProduct = {
  code: string;
  name: string;
  value: string;
  bgColor: string;
  icon: LucideIcon;
  unit: ProductOrderUnit;
  desc: string;
};

type ProductOrderUnit = "litre" | "gram" | "kg";

const productCardTones = ["bg-sky-card", "bg-peach-card", "bg-sage-card", "bg-ash-gray"];

function normalizeProductOrderUnit(product: Pick<ApiProduct, "name" | "productType" | "unit">) {
  const label = `${product.name} ${product.productType}`.toLowerCase();
  const unit = (product.unit || "").toLowerCase();

  if (label.includes("milk") || label.includes("curd")) return "litre" as const;
  if (label.includes("ghee")) return "kg" as const;
  if (
    label.includes("butter") ||
    label.includes("paneer") ||
    label.includes("panner") ||
    label.includes("cheese")
  ) {
    return "gram" as const;
  }
  if (["litre", "liter", "l", "lt"].includes(unit)) return "litre" as const;
  if (["kg", "kilogram", "kilograms"].includes(unit)) return "kg" as const;
  if (["g", "gram", "grams"].includes(unit)) return "gram" as const;
  return "kg" as const;
}

function formatOrderUnitLabel(unit: ProductOrderUnit) {
  if (unit === "litre") return "Litre";
  if (unit === "gram") return "Gram";
  return "Kg";
}

const fallbackProducts: SiteProduct[] = [
  {
    code: "MK-01",
    name: "Milk",
    value: "milk",
    bgColor: "bg-sky-card",
    icon: Milk,
    unit: "litre",
    desc: "Free-range, antibiotic-free, hormone-free - chilled at source.",
  },
  {
    code: "CD-02",
    name: "Curd",
    value: "curd",
    bgColor: "bg-peach-card",
    icon: Droplets,
    unit: "litre",
    desc: "Traditional set curd, made fresh from our own pure milk.",
  },
  {
    code: "BT-03",
    name: "Butter",
    value: "butter",
    bgColor: "bg-sage-card",
    icon: PackageCheck,
    unit: "gram",
    desc: "Churned the traditional way. No additives, ever.",
  },
  {
    code: "GH-05",
    name: "Ghee",
    value: "ghee",
    bgColor: "bg-ash-gray",
    icon: Flame,
    unit: "kg",
    desc: "Slow-cooked in small batches for purity and aroma.",
  },
  {
    code: "PN-04",
    name: "Paneer",
    value: "paneer",
    bgColor: "bg-ash-gray",
    icon: PackageCheck,
    unit: "gram",
    desc: "Fresh paneer blocks for cooking, grilling, and rich meals.",
  },
  {
    code: "CH-06",
    name: "Cheese",
    value: "cheese",
    bgColor: "bg-sky-card",
    icon: PackageCheck,
    unit: "gram",
    desc: "Soft fresh cheese for slices, cooking, and everyday use.",
  },
];

function getProductIcon(product: Pick<ApiProduct, "name" | "productType">): LucideIcon {
  const label = `${product.name} ${product.productType}`.toLowerCase();

  if (label.includes("milk")) return Milk;
  if (label.includes("curd") || label.includes("yogurt")) return Droplets;
  if (label.includes("ghee")) return Flame;
  if (label.includes("butter")) return PackageCheck;
  if (label.includes("paneer") || label.includes("panner")) return PackageCheck;
  if (label.includes("cheese")) return PackageCheck;

  return PackageCheck;
}

function mapProductToSiteProduct(product: ApiProduct, index: number): SiteProduct {
  const unit = normalizeProductOrderUnit(product);
  return {
    code: product.code,
    name: product.name,
    value: product.productType || product.code || product.name,
    bgColor: productCardTones[index % productCardTones.length],
    icon: getProductIcon(product),
    unit,
    desc:
      product.description ||
      `${product.defaultQuantity || 1} ${formatOrderUnitLabel(unit).toLowerCase()} available on ${product.defaultSchedule || "custom"} plans.`,
  };
}

function getApiProducts(result: ApiProductResponse) {
  if (Array.isArray(result.products)) return result.products;
  if (Array.isArray(result.data)) return result.data;
  if (result.data && !Array.isArray(result.data)) {
    if (Array.isArray(result.data.products)) return result.data.products;
    if (Array.isArray(result.data.data)) return result.data.data;
  }
  return [];
}

function IconBadge({
  icon: Icon,
  tone = "light",
  className = "",
}: {
  icon: LucideIcon;
  tone?: "light" | "dark" | "soft";
  className?: string;
}) {
  const toneClass =
    tone === "dark"
      ? "border-pure-white/15 bg-pure-white text-forest-ink group-hover:bg-vivid-lime"
      : tone === "soft"
        ? "border-forest-ink/10 bg-pure-white/70 text-forest-ink group-hover:bg-vivid-lime"
        : "border-forest-ink/10 bg-forest-ink text-pure-white group-hover:bg-vivid-lime group-hover:text-forest-ink";

  return (
    <span
      className={`inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-110 ${toneClass} ${className}`}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
function WhatsAppIcon({
  className = "h-[18px] w-[18px]",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Index() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");
  const [siteProducts, setSiteProducts] = useState<SiteProduct[]>(fallbackProducts);
  const [selectedProduct, setSelectedProduct] = useState(fallbackProducts[0]?.value ?? "milk");
  const [requestType, setRequestType] = useState<"subscription" | "order">("subscription");
  const videoRef = useRef<HTMLVideoElement>(null);
  const productOptionsKey = siteProducts.map((product) => product.value).join("|");
  const selectedProductUnit =
    siteProducts.find((product) => product.value === selectedProduct)?.unit ?? "litre";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay failed or was prevented:", err);
      });
    }
  }, []);

  // Handle hash scrolling on page load (e.g. direct access to #order)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const timer = setTimeout(() => {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Intercept all hash link clicks to scroll smoothly
  useEffect(() => {
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
          // Update URL hash without causing a page jump
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleHashClick, { capture: true });
    return () => document.removeEventListener("click", handleHashClick, { capture: true });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/v1/products`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as ApiProductResponse;
        const products = getApiProducts(result);

        if (!response.ok || result.success === false || products.length === 0) {
          throw new Error("Product catalog unavailable.");
        }

        const activeProducts = products
          .filter((product) => product.isActive ?? product.active ?? true)
          .map(mapProductToSiteProduct);

        if (isMounted && activeProducts.length > 0) {
          setSiteProducts(activeProducts);
        }
      } catch (error) {
        console.warn("Using fallback product catalog:", error);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!siteProducts.some((product) => product.value === selectedProduct)) {
      setSelectedProduct(siteProducts[0]?.value ?? "milk");
    }
  }, [selectedProduct, siteProducts]);

  function handleProductSelect(productValue: string) {
    setSelectedProduct(productValue);
    const orderSection = document.getElementById("order");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    orderSection?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-fade-in-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = document.querySelectorAll(".scroll-fade-in");
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLeadStatus("submitting");
    setLeadMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          area: formData.get("area"),
          product: formData.get("product"),
          requestType: formData.get("requestType"),
          quantity: formData.get("quantity"),
          plan: formData.get("plan") || "daily",
          source: `website-${String(formData.get("requestType") || "subscription")}`,
          notes: formData.get("notes") || "",
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Please check the form and try again.");
      }

      form.reset();
      setSelectedProduct(siteProducts[0]?.value ?? "milk");
      setRequestType("subscription");
      setLeadStatus("success");
      setLeadMessage(result.message ?? "Thanks. We received your request.");

      // Direct WhatsApp redirect with pre-filled details
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const area = formData.get("area") as string;
      const product = formData.get("product") as string;
      const requestTypeValue = (formData.get("requestType") as string) || "subscription";
      const quantity = formData.get("quantity") as string;
      const plan = formData.get("plan") as string;
      const notes = (formData.get("notes") as string) || "None";
      const requestLabel = requestTypeValue === "order" ? "one-time order" : "subscription";
      const text = `Hi HasuMane, I'm ${name}. I'd like to request details for a ${requestLabel}.\n\n*My Details*:\n- Phone: ${phone}\n- Area: ${area}\n- Product: ${product}\n- Quantity: ${quantity}\n- Plan: ${plan}\n- Notes: ${notes}`;// @ts-ignore
      const whatsappUrl = `https://wa.me/919344259815?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      setLeadStatus("error");
      setLeadMessage(
        error instanceof Error
          ? error.message
          : "We could not submit your request right now. Please try again.",
      );
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bone text-charcoal font-inter selection:bg-vivid-lime selection:text-forest-ink">
      <div className="pointer-events-none fixed left-0 right-0 top-[48px] z-0 h-[calc(100svh-48px)] bg-pure-white p-[10px]">
        <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-black bg-cover bg-center">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            className="hero-video absolute inset-0 h-full w-full object-cover object-center bg-black"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.28)_34%,rgba(0,0,0,0.05)_66%,rgba(0,0,0,0.34)_100%)]" />
        </div>
      </div>

      <div className="fixed left-0 top-0 z-[70] flex h-[48px] w-full items-center overflow-hidden bg-vivid-lime text-charcoal">
        <div className="flex marquee-track whitespace-nowrap text-caption font-medium uppercase tracking-wider">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-30 pr-30">
              {MARQUEE.concat(MARQUEE).map((text, j) => (
                <span key={`${i}-${j}`} className="flex items-center gap-10">
                  <span>{text}</span>
                  <CheckCircle2
                    className="h-[15px] w-[15px] shrink-0 text-forest-ink"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={`fixed left-0 right-0 top-[48px] z-[60] flex items-center transition-all duration-300 ${
          isScrolled
            ? "h-[64px] bg-forest-ink/95 shadow-md backdrop-blur-sm"
            : "h-[92px] bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-24">
          <nav className="hidden items-center gap-24 text-[15px] font-medium md:flex">
            <a
              href="#farmers"
              className="text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime"
            >
              For Farmers
            </a>
            <a
              href="#consumers"
              className="text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime"
            >
              For Consumers
            </a>
            <a
              href="#products"
              className="text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime"
            >
              Our Products
            </a>
            <a
              href="#story"
              className="text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime"
            >
              Our Story
            </a>
          </nav>

          <a
            href="#"
            className={`flex origin-center items-center gap-4 transition-all duration-300 ${isScrolled ? "scale-[0.78]" : "scale-100"}`}
          >
            <Leaf
              size={36}
              className="shrink-0 text-pure-white"
              style={{ width: "36px", height: "36px" }}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="font-reckless text-[36px] font-medium tracking-tight text-pure-white leading-none">
              HasuMane
            </span>
          </a>

          <div className="flex min-w-[150px] items-center justify-end">
            <a
              href="#order"
              className="rounded-nav-pills bg-pure-white px-20 py-10 text-[13px] font-medium uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 hover:scale-105 hover:bg-vivid-lime hover:text-forest-ink active:scale-95"
            >
              Order Now
              <ArrowRight
                className="ml-8 inline h-[14px] w-[14px]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10 h-[100svh] min-h-[650px] w-full bg-transparent px-[10px] pt-[48px]">
        <div className="mx-auto flex h-full max-w-[1320px] flex-col items-center justify-center px-24 pt-[48px] pb-[48px] text-center text-pure-white">
          <p className="hero-kicker mb-20 text-[12px] font-medium uppercase tracking-[0.25em] text-vivid-lime">
            Halliyinda Nimma Manege
          </p>
          <h1 className="hero-title max-w-[25ch] font-reckless text-heading-lg font-light leading-[1.04] sm:text-[68px] md:text-display">
            The Cow's Home
            <span className="block">to Your Home</span>
          </h1>

          <p className="sr-only">
            HasuMane is a farmer entrepreneurship initiative, not just a dairy company. We build
            sustainable livelihoods, one farm at a time.
          </p>

          <div className="hero-cta mt-30 flex flex-wrap items-center justify-center gap-15">
            <a
              href="#farmers"
              className="rounded-buttons border border-sky-card bg-sky-card px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-charcoal transition-all duration-300 hover:scale-[1.03] hover:border-pure-white hover:bg-pure-white active:scale-[0.98]"
            >
              I'm a Farmer
              <ArrowRight
                className="ml-8 inline h-[14px] w-[14px]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
            <a
              href="#consumers"
              className="rounded-buttons border border-forest-ink bg-forest-ink px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-pure-white transition-all duration-300 hover:scale-[1.03] hover:border-pure-white hover:bg-pure-white hover:text-forest-ink active:scale-[0.98]"
            >
              I'm a Consumer
              <ArrowRight
                className="ml-8 inline h-[14px] w-[14px]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="absolute bottom-[56px] left-0 right-0 text-center text-[12px] tracking-wider opacity-90">
            <a
              href="#story"
              className="inline-flex translate-y-0 text-pure-white transition-transform duration-300 hover:translate-y-[3px] hover:text-vivid-lime"
            >
              Scroll to Explore
            </a>
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-[44px] rounded-t-[38px] border-t border-moss/50 bg-bone shadow-[0_-18px_42px_rgba(0,0,0,0.08)] md:rounded-t-[54px]">
        <section id="story" className="scroll-fade-in mx-auto max-w-[1200px] px-24 py-[80px]">
          <div className="grid items-start gap-30 border-b border-moss pb-40 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="text-heading-lg font-light leading-[1.1] text-charcoal">
                Not a Dairy Company.
                <br />A Farmer Entrepreneurship Initiative.
              </h2>
              <p className="mt-30 max-w-[62ch] font-inter text-[17px] leading-relaxed text-graphite">
                HasuMane exists to build a sustainable ecosystem where farmers earn better incomes,
                consumers receive genuinely chemical-free food, and farming practices restore the
                environment instead of depleting it. We do not own farms. We build farmers into
                entrepreneurs.
              </p>
            </div>
            <div className="md:col-span-5 md:pt-20 md:text-right">
              <span className="text-caption font-mono uppercase tracking-[0.2em] text-pewter">
                The Little England of Tamilnadu
              </span>
              <p className="mt-5 text-body-sm text-graphite">Krishnagiri District, Tamil Nadu</p>
            </div>
          </div>
        </section>

        <section className="scroll-fade-in mx-auto max-w-[1200px] px-24 pb-[80px]">
          <div className="grid gap-24 md:grid-cols-3">
            {missionCards.map((card) => (
              <QuiltCard
                key={card.title}
                eyebrow={card.eyebrow}
                title={card.title}
                bgColor={card.bgColor}
                icon={card.icon}
              >
                {card.body}
              </QuiltCard>
            ))}
          </div>
        </section>

        <section id="farmers" className="scroll-fade-in bg-forest-ink py-[90px] text-pure-white">
          <div className="mx-auto max-w-[1200px] px-24">
            <div className="mb-40 grid items-start gap-40 md:grid-cols-12">
              <div className="md:col-span-7">
                <h2 className="font-reckless text-heading-lg leading-[1.08]">
                  We Don't Hire Farmers.
                  <br />
                  We Build Them Into Entrepreneurs.
                </h2>
                <p className="mt-30 max-w-[56ch] text-[17px] leading-relaxed opacity-95">
                  Instead of owning farms, HasuMane partners directly with farmers and supports
                  every step of building a profitable, modern dairy business.
                </p>
              </div>
              <div className="zoom-container rounded-hero-cards border border-pure-white/10 md:col-span-5">
                <img
                  src={grazingCow.url}
                  alt="Cow grazing at a partner farm"
                  className="h-[280px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-24 border-t border-pure-white/10 pt-40 sm:grid-cols-2 lg:grid-cols-4">
              <BenefitItem icon={BadgeIndianRupee} title="Bank Financing">
                Access to capital to set up a profitable dairy farm from day one.
              </BenefitItem>
              <BenefitItem icon={Sprout} title="Organic Methods">
                Training and support to adopt chemical-free farming practices.
              </BenefitItem>
              <BenefitItem icon={Cpu} title="Modern Technology">
                Machine milking and milk chilling systems on every partner farm.
              </BenefitItem>
              <BenefitItem icon={Stethoscope} title="Veterinary Support">
                Ongoing technical and veterinary care, plus guaranteed milk procurement.
              </BenefitItem>
            </div>
          </div>
        </section>

        <section className="scroll-fade-in mx-auto max-w-[1200px] px-24 py-[80px]">
          <div className="mb-40 grid items-end gap-30 border-b border-moss pb-30 md:grid-cols-12">
            <h2 className="text-heading font-light text-charcoal md:col-span-7">
              Restoring the Land,
              <br />
              Not Extracting From It.
            </h2>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5">
              Our model is built around four non-negotiables on every partner farm. What the cows
              eat matters as much as what they produce.
            </p>
          </div>

          <div className="grid gap-24 md:grid-cols-2 lg:grid-cols-4">
            {sustainabilityCards.map((card) => (
              <QuiltCard
                key={card.title}
                eyebrow={card.eyebrow}
                title={card.title}
                bgColor={card.bgColor}
                icon={card.icon}
              >
                {card.body}
              </QuiltCard>
            ))}
          </div>
        </section>

        <section id="products" className="scroll-fade-in mx-auto max-w-[1200px] px-24 pb-[80px]">
          <div className="mb-40 grid items-end gap-30 border-b border-moss pb-30 md:grid-cols-12">
            <h2 className="text-heading font-light text-charcoal md:col-span-7">
              Fresh Products.
              <br />
              No Compromises.
            </h2>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5">
              Our catalog updates from the CRM, so every active product your team adds is available
              for customers to request.
            </p>
          </div>

          <div className="grid gap-24 md:grid-cols-2 lg:grid-cols-4">
            {siteProducts.map((product) => (
              <ProductCard
                key={product.value}
                {...product}
                onSelect={() => handleProductSelect(product.value)}
              />
            ))}
          </div>
        </section>

        <section
          id="consumers"
          className="scroll-fade-in mx-auto max-w-[1200px] border-t border-moss px-24 py-[80px]"
        >
          <div className="grid items-center gap-40 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="text-heading-lg font-light leading-[1.1] text-charcoal">
                Fresh, Delivered to Your Door.
              </h2>
              <p className="mt-30 max-w-[56ch] text-[17px] leading-relaxed text-graphite">
                HasuMane runs a subscription-based delivery service through our mobile app. Fresh
                milk, curd, butter, and ghee delivered straight to your home.
              </p>
              <div className="mt-24 flex flex-wrap items-center gap-15">
                <span className="inline-flex items-center rounded-nav-pills border border-forest-ink/20 bg-forest-ink/10 px-20 py-10 text-[13px] font-medium tracking-wider text-forest-ink">
                  <Truck className="mr-8 h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden="true" />
                  Now serving Bengaluru
                </span>
                <a
                  href="#order"
                  className="inline-flex items-center rounded-buttons border border-graphite bg-transparent px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-charcoal transition hover:border-forest-ink hover:bg-forest-ink hover:text-pure-white"
                >
                  <Smartphone
                    className="mr-8 h-[15px] w-[15px]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Download the App
                  <Download
                    className="ml-8 h-[15px] w-[15px]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
            <div className="zoom-container rounded-hero-cards border border-moss md:col-span-5">
              <img
                src={brownCow.url}
                alt="Healthy cow at HasuMane partner farm"
                className="h-[320px] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="scroll-fade-in mx-auto max-w-[1200px] border-t border-moss px-24 py-[80px]">
          <div className="mb-12 grid items-end gap-30 md:grid-cols-12">
            <h2 className="text-heading font-light text-charcoal md:col-span-7">
              The People Behind HasuMane.
            </h2>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5">
              Founders building a farmer-first dairy from the ground up, combining organic
              agriculture with modern product and brand thinking.
            </p>
          </div>

          <div className="grid gap-24 md:grid-cols-2">
            <FounderCard
              img={raviTeja.url}
              name="Mr. Ravi Teja"
              role="Founder - Organic Farming & Ecosystem"
              bio="An aspiring student entrepreneur with a strong vision for transforming the organic farming ecosystem. Ravi is committed to chemical-free food practices and empowering farmers through eco-friendly solutions."
            />
            <FounderCard
              img={sujan.url}
              name="Mr. Sujan Saitej"
              role="Co-founder - Product & Digital"
              bio="Bringing product expertise and digital marketing innovation to HasuMane, Sujan focuses on connecting consumers with authentic farm-fresh products while supporting sustainable farming practices."
            />
          </div>
        </section>

        <section className="scroll-fade-in mx-auto max-w-[1100px] px-24 pb-[90px] text-center">
          <div className="zoom-container mx-auto rounded-[20px] border border-moss">
            <img
              src={calf.url}
              alt="Young calf at a partner farm"
              className="h-[320px] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <blockquote className="mx-auto mt-30 max-w-[32ch] font-reckless text-heading-sm font-light italic text-charcoal">
            "From the farmer's hands to your home - nothing added, nothing compromised."
          </blockquote>
          <p className="mt-15 text-caption uppercase tracking-[0.2em] text-pewter">
            HasuMane - Halliyinda Nimma Manege
          </p>
        </section>

        <section id="order" className="scroll-fade-in border-t border-moss bg-bone/30 py-[90px]">
          <div className="mx-auto max-w-[650px] px-24 text-center">
            <span className="text-caption font-mono uppercase tracking-[0.2em] text-forest-ink">
              Bengaluru Orders and Subscriptions
            </span>
            <h2 className="mt-12 mb-24 font-reckless text-heading font-light text-charcoal">
              Choose How You Want To Order
            </h2>
            <p className="mb-40 text-body-sm leading-relaxed text-graphite max-w-[50ch] mx-auto">
              We deliver fresh, chemical-free products daily across Bengaluru. Send a one-time order
              request or start a recurring subscription below.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-16 mt-20">
              <a
                href="https://wa.me/919344259815"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-forest-ink text-pure-white rounded-buttons py-15 px-35 text-[14px] font-medium tracking-wider uppercase hover:bg-forest-ink/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm flex items-center justify-center gap-10 w-full sm:w-auto whitespace-nowrap"
              >
                <WhatsAppIcon className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
                Message on WhatsApp
              </a>
              <a
                href="https://www.instagram.com/hasumane_organics?igsh=cWo4YzJ2eDB0bXow"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-forest-ink text-forest-ink bg-transparent rounded-buttons py-15 px-35 text-[14px] font-medium tracking-wider uppercase hover:bg-forest-ink hover:text-pure-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-10 w-full sm:w-auto whitespace-nowrap"
              >
                <Instagram
                  className="h-[22px] w-[22px] shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Follow on Instagram
              </a>
            </div>
          </div>

          <div className="mx-auto mt-40 max-w-[1120px] px-24">
            <div className="rounded-[24px] border border-moss/20 bg-pure-white p-20 shadow-xl sm:p-32 lg:p-36">
              <h3 className="text-center font-reckless text-[24px] font-medium text-forest-ink">
                Start Your Fresh Order
              </h3>
              <p className="mt-8 text-center text-body-sm text-pewter">
                Fill in your details below and we will contact you on WhatsApp shortly.
              </p>

              <form
                id="order-form"
                onSubmit={handleLeadSubmit}
                className="mt-22 grid gap-16 text-left xl:grid-cols-[1fr_1fr] xl:items-start"
              >
                <div className="grid gap-16 rounded-[18px] border border-moss/20 bg-bone/25 p-16 lg:p-18">
                  <div className="mb-4 flex items-center gap-8">
                    <span className="flex h-28 w-28 items-center justify-center rounded-[8px] bg-forest-ink/10 text-forest-ink">
                      <User className="h-[14px] w-[14px]" strokeWidth={1.9} />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
                      Contact
                    </span>
                  </div>
                  <div className="grid gap-12 md:grid-cols-2">
                    <div className="relative flex flex-col">
                      <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                        Your Name
                      </span>
                      <div className="relative flex items-center">
                        <User
                          className="absolute left-20 h-[18px] w-[18px] text-pewter"
                          strokeWidth={1.8}
                        />
                        <input
                          name="name"
                          type="text"
                          aria-label="Your name"
                          placeholder="e.g. John Doe"
                          required
                          autoComplete="name"
                          disabled={leadStatus === "submitting"}
                          className="h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div className="relative flex flex-col">
                      <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                        Phone Number
                      </span>
                      <div className="relative flex items-center">
                        <Phone
                          className="absolute left-20 h-[18px] w-[18px] text-pewter"
                          strokeWidth={1.8}
                        />
                        <input
                          name="phone"
                          type="tel"
                          aria-label="Phone number"
                          placeholder="e.g. +91 93453 43434"
                          required
                          autoComplete="tel"
                          disabled={leadStatus === "submitting"}
                          className="h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-col">
                    <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                      Delivery Area / Pincode
                    </span>
                    <div className="relative flex items-center">
                      <MapPin
                        className="absolute left-20 h-[18px] w-[18px] text-pewter"
                        strokeWidth={1.8}
                      />
                      <input
                        name="area"
                        type="text"
                        aria-label="Area or pincode in Bengaluru"
                        placeholder="e.g. Indiranagar, 560038"
                        required
                        autoComplete="address-level2"
                        disabled={leadStatus === "submitting"}
                        className="h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-16 rounded-[18px] border border-moss/20 bg-bone/25 p-16 lg:p-18">
                  <div className="mb-4 flex items-center gap-8">
                    <span className="flex h-28 w-28 items-center justify-center rounded-[8px] bg-forest-ink/10 text-forest-ink">
                      <CalendarDays className="h-[14px] w-[14px]" strokeWidth={1.9} />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
                      Order setup
                    </span>
                  </div>

                  <div className="relative flex flex-col">
                    <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                      Request Type
                    </span>
                    <div className="grid grid-cols-2 gap-4 rounded-[16px] border border-moss/45 bg-pure-white p-2 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
                      <label
                        className={`flex min-h-[52px] cursor-pointer items-center justify-center gap-8 rounded-[12px] px-14 py-12 text-body-sm font-semibold transition-all ${
                          requestType === "subscription"
                            ? "bg-forest-ink text-pure-white shadow-md"
                            : "text-charcoal hover:bg-bone/45 hover:shadow-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          name="requestType"
                          value="subscription"
                          checked={requestType === "subscription"}
                          onChange={() => setRequestType("subscription")}
                          disabled={leadStatus === "submitting"}
                          className="sr-only"
                        />
                        <CalendarDays className="h-[16px] w-[16px]" strokeWidth={2} />
                        Subscription
                      </label>
                      <label
                        className={`flex min-h-[52px] cursor-pointer items-center justify-center gap-8 rounded-[12px] px-14 py-12 text-body-sm font-semibold transition-all ${
                          requestType === "order"
                            ? "bg-forest-ink text-pure-white shadow-md"
                            : "text-charcoal hover:bg-bone/45 hover:shadow-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          name="requestType"
                          value="order"
                          checked={requestType === "order"}
                          onChange={() => setRequestType("order")}
                          disabled={leadStatus === "submitting"}
                          className="sr-only"
                        />
                        <PackageCheck className="h-[16px] w-[16px]" strokeWidth={2} />
                        One-time Order
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative flex flex-col">
                      <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                        Select Product
                      </span>
                      <div className="relative flex items-center">
                        <Milk
                          className="pointer-events-none absolute left-20 h-[18px] w-[18px] text-pewter"
                          strokeWidth={1.8}
                        />
                        <select
                          key={productOptionsKey}
                          name="product"
                          aria-label="Product"
                          value={selectedProduct}
                          onChange={(event) => setSelectedProduct(event.target.value)}
                          disabled={leadStatus === "submitting"}
                          className="h-[56px] w-full appearance-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23223E36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                            backgroundPosition: "right 20px center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "16px",
                          }}
                        >
                          {siteProducts.map((product) => (
                            <option key={product.value} value={product.value}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative flex flex-col">
                      <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                        Daily Quantity ({formatOrderUnitLabel(selectedProductUnit)})
                      </span>
                      <div className="relative flex items-center">
                        <Droplets
                          className="absolute left-20 h-[18px] w-[18px] text-pewter"
                          strokeWidth={1.8}
                        />
                        <input
                          name="quantity"
                          type="number"
                          min="1"
                          max="50"
                          step="1"
                          defaultValue="1"
                          onFocus={(e) => e.target.select()}
                          aria-label="Daily quantity"
                          disabled={leadStatus === "submitting"}
                          className="h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                        />
                        <span className="pointer-events-none absolute right-16 rounded-full bg-bone/70 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter">
                          {formatOrderUnitLabel(selectedProductUnit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {requestType === "subscription" && (
                    <div className="relative flex flex-col transition-all duration-300">
                      <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                        Delivery Plan
                      </span>
                      <div className="relative flex items-center">
                        <CalendarDays
                          className="pointer-events-none absolute left-20 h-[18px] w-[18px] text-pewter"
                          strokeWidth={1.8}
                        />
                        <select
                          name="plan"
                          aria-label="Delivery plan"
                          defaultValue="daily"
                          disabled={leadStatus === "submitting"}
                          className="h-[56px] w-full appearance-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23223E36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                            backgroundPosition: "right 20px center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "16px",
                          }}
                        >
                          <option value="daily">Daily delivery</option>
                          <option value="alternate">Alternate-day delivery</option>
                          <option value="custom">Custom schedule</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="relative flex flex-col">
                    <span className="mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter">
                      Delivery Notes (Optional)
                    </span>
                    <div className="relative flex items-center">
                      <MessageSquare
                        className="absolute left-20 top-20 h-[18px] w-[18px] text-pewter"
                        strokeWidth={1.8}
                      />
                      <textarea
                        name="notes"
                        aria-label="Delivery notes"
                        placeholder="e.g. Please leave at the gate, deliver before 7 AM"
                        rows={3}
                        disabled={leadStatus === "submitting"}
                        className="w-full resize-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 py-16 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
                      />
                    </div>
                  </div>

                  <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
                    <p className="text-[12px] leading-relaxed text-pewter">
                      Fresh dairy requests are processed by the team and confirmed on WhatsApp.
                    </p>
                    <button
                      type="submit"
                      disabled={leadStatus === "submitting"}
                      className="relative inline-flex w-full items-center justify-center gap-8 rounded-[14px] bg-forest-ink px-28 py-18 text-body-sm font-semibold uppercase tracking-wider text-pure-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:bg-forest-ink/95 hover:shadow-lg active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 md:w-auto"
                    >
                      {leadStatus === "submitting" ? (
                        <>
                          <span className="h-16 w-16 animate-spin rounded-full border-2 border-pure-white border-t-transparent"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          {requestType === "order" ? "Send Order Request" : "Start Subscription"}
                          <Send className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {leadMessage ? (
                  <div
                    role={leadStatus === "error" ? "alert" : "status"}
                    className={`mt-10 flex items-start gap-12 rounded-[12px] p-16 text-body-sm leading-relaxed border ${
                      leadStatus === "success"
                        ? "bg-forest-ink/5 border-forest-ink/20 text-forest-ink"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-20 w-20 shrink-0 mt-2 ${
                        leadStatus === "success" ? "text-forest-ink" : "text-red-600"
                      }`}
                      strokeWidth={2}
                    />
                    <span>{leadMessage}</span>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-forest-ink pt-[110px] pb-64 text-pure-white">
          <div className="mx-auto max-w-[1200px] px-24">
            <div className="mb-40 grid gap-30 border-b border-pure-white/10 pb-40 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-4">
                  <Leaf
                    size={36}
                    className="shrink-0 text-pure-white"
                    style={{ width: "36px", height: "36px" }}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span className="font-reckless text-[36px] font-medium text-pure-white leading-none">
                    HasuMane
                  </span>
                </div>
                <p className="mt-15 max-w-[24ch] text-[14px] leading-relaxed text-pure-white/80">
                  A farmer entrepreneurship initiative building chemical-free dairy and restorative
                  agriculture, one farm at a time.
                </p>
              </div>

              <FooterColumn
                title="Explore"
                links={["For Farmers", "For Consumers", "Our Products", "Our Story"]}
              />
              <FooterColumn
                title="Delivery"
                links={["Bengaluru Delivery", "Request Details", "Subscription Plans"]}
              />

              <div>
                <h4 className="text-caption mb-15 inline-flex items-center uppercase tracking-[0.2em] text-vivid-lime">
                  <MapPin className="mr-8 h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden="true" />
                  Visit - The First Field
                </h4>
                <address className="not-italic text-[14px] leading-relaxed text-pure-white/85">
                  HasuMane - The First Field
                  <br />
                  2/282 Jogapalli Village, Marupalli Post
                  <br />
                  Denkanikottai Taluk, Krishnagiri District
                  <br />
                  Tamil Nadu - 635118
                </address>

                <div className="mt-15 flex gap-15 text-caption font-mono">
                  <a
                    href="https://www.instagram.com/hasumane_organics?igsh=cWo4YzJ2eDB0bXow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center transition hover:text-vivid-lime"
                  >
                    <Instagram
                      className="mr-6 h-[14px] w-[14px]"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/posts/hasumane-organics-70a2ba418_hasumaneorganics-organicfarming-organicdairy-share-7473991161263853569-Ijjx/?utm_source=share&utm_medium=member_ios&rcm=ACoAAGoemnoBVfwW-ngen0It1oUHKdzL-aVUvfE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center transition hover:text-vivid-lime"
                  >
                    <Linkedin
                      className="mr-6 h-[14px] w-[14px]"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    LinkedIn
                  </a>
                  <a
                    href="https://wa.me/919344259815"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center transition hover:text-vivid-lime"
                  >
                    <WhatsAppIcon className="mr-6 h-[14px] w-[14px]" aria-hidden="true" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-15 text-caption text-pure-white/60 sm:flex-row">
              <span>&copy; HasuMane Organics. All rights reserved.</span>
              <span>Halliyinda Nimma Manege - Krishnagiri, IN</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function QuiltCard({
  eyebrow,
  title,
  bgColor,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  bgColor: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${bgColor} group flex min-h-[220px] flex-col justify-start rounded-cards border border-moss/20 p-[30px] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-forest-ink/30 hover:shadow-lg`}
    >
      <div className="mb-20 flex items-start justify-between gap-20">
        <p className="text-caption font-medium uppercase tracking-wider text-charcoal/70">
          {eyebrow}
        </p>
        <IconBadge icon={icon} tone="soft" />
      </div>
      <h3 className="text-subheading font-light leading-tight text-charcoal">{title}</h3>
      <p className="mt-10 max-w-[32ch] text-body-sm leading-relaxed text-graphite">{children}</p>
    </div>
  );
}

function BenefitItem({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group transition-all duration-300 ease-out hover:translate-x-1">
      <IconBadge icon={icon} tone="dark" className="mb-15" />
      <h4 className="mb-10 text-[16px] font-medium tracking-wide text-vivid-lime">{title}</h4>
      <p className="max-w-[28ch] text-[14px] leading-relaxed text-pure-white/80">{children}</p>
    </div>
  );
}

function ProductCard({
  code,
  name,
  desc,
  bgColor,
  icon,
  onSelect,
}: {
  code: string;
  name: string;
  value: string;
  desc: string;
  bgColor: string;
  icon: LucideIcon;
  onSelect: () => void;
}) {
  return (
    <div
      className={`${bgColor} group flex min-h-[300px] flex-col rounded-cards border border-moss/20 p-[30px] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-forest-ink/30 hover:shadow-lg`}
    >
      <div className="mb-20 flex items-center">
        <IconBadge icon={icon} tone="soft" />
      </div>
      <div className="flex-grow">
        <p className="mb-8 text-caption font-medium uppercase tracking-[0.16em] text-charcoal/60">
          {code}
        </p>
        <h3 className="text-subheading font-light leading-tight text-charcoal transition-colors duration-300 group-hover:text-forest-ink">
          {name}
        </h3>
        <p className="mt-10 text-body-sm leading-relaxed text-graphite">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Request ${name}`}
        className="mt-20 flex w-full items-center justify-center gap-5 rounded-buttons bg-forest-ink px-5 py-2.5 text-body-sm font-medium text-pure-white transition-all duration-300 hover:scale-[1.02] hover:bg-forest-ink/90 active:scale-[0.98]"
      >
        Shop Now
        <ArrowRight
          className="h-[15px] w-[15px] transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function FounderCard({
  img,
  name,
  role,
  bio,
}: {
  img: string;
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <div className="group flex flex-col gap-24 rounded-cards border border-moss bg-pure-white p-24 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-forest-ink/20 hover:shadow-lg sm:flex-row">
      <div className="zoom-container h-[190px] shrink-0 rounded-cards border border-moss/10 sm:w-[150px]">
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <h3 className="font-reckless text-subheading leading-tight text-charcoal transition-colors duration-300 group-hover:text-forest-ink">
            {name}
          </h3>
          <p className="text-caption mt-5 uppercase tracking-[0.15em] text-pewter">{role}</p>
          <p className="mt-15 text-body-sm leading-relaxed text-graphite">{bio}</p>
        </div>
      </div>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-caption mb-15 uppercase tracking-[0.2em] text-vivid-lime">{title}</h4>
      <ul className="space-y-8 text-[14px] text-pure-white/70">
        {links.map((link) => (
          <li key={link}>
            <a href="#story" className="transition hover:text-pure-white">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
