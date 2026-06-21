import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroCattle from "@/assets/hero-cattle.jpeg.asset.json";
import grazingCow from "@/assets/grazing-cow.jpeg.asset.json";
import brownCow from "@/assets/brown-cow.jpeg.asset.json";
import calf from "@/assets/calf.jpeg.asset.json";
import raviTeja from "@/assets/ravi-teja.jpeg.asset.json";
import sujan from "@/assets/sujan.png.asset.json";

const HERO_SLIDES = [
  { src: heroCattle.url, alt: "Native cattle in open pasture at HasuMane" },
  { src: grazingCow.url, alt: "Cow grazing near a partner farm shed" },
  { src: brownCow.url, alt: "Healthy native cow at a HasuMane partner farm" },
  { src: calf.url, alt: "Young calf grazing on green pasture" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HasuMane — The Cow's Home. From Our Fields to Your Home." },
      {
        name: "description",
        content:
          "HasuMane is a farmer entrepreneurship initiative producing chemical-free milk, curd, butter, and ghee — delivered fresh across Bengaluru.",
      },
      { property: "og:title", content: "HasuMane — From Our Fields to Your Home" },
      {
        property: "og:description",
        content:
          "A farmer entrepreneurship initiative. Chemical-free dairy, restorative agriculture, fresh to your door.",
      },
      { property: "og:image", content: heroCattle.url },
    ],
  }),
  component: Index,
});

const MARQUEE = [
  "Now Delivering Fresh, Daily, Across Bengaluru",
  "Chemical-Free, Always",
  "A Farmer Entrepreneurship Initiative",
  "From the Village, to Your Home",
];

function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20c0-9 7-16 16-16-0.5 9-7.5 16-16 16Z" />
      <path d="M4 20c4-4 8-7 14-12" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12l4 4 10-11" />
    </svg>
  );
}

function Index() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen bg-bone text-charcoal">

      {/* Marquee */}
      <div className="bg-vivid-lime text-charcoal overflow-hidden">
        <div className="flex marquee-track whitespace-nowrap py-2.5 text-[13px]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              {MARQUEE.concat(MARQUEE).map((t, j) => (
                <span key={j} className="flex items-center gap-3">
                  <span>{t}</span>
                  <Check />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-forest-ink text-pure-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-light">
            <a href="#farmers" className="hover:opacity-80">For Farmers</a>
            <a href="#consumers" className="hover:opacity-80">For Consumers</a>
            <a href="#products" className="hover:opacity-80">Our Products</a>
            <a href="#story" className="hover:opacity-80">Our Story ▾</a>
          </nav>
          <a href="#" className="flex items-center gap-2">
            <LeafMark className="h-5 w-5 text-pure-white" />
            <span className="font-serif text-[22px] tracking-tight">hasumane</span>
          </a>
          <a
            href="#order"
            className="rounded-[110px] bg-pure-white px-5 py-2.5 text-[13px] font-medium tracking-wide text-charcoal hover:bg-bone transition"
          >
            ORDER NOW
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          {HERO_SLIDES.map((s, i) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${i === slide ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-pure-white" : "w-4 bg-pure-white/40"}`}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col items-center justify-center px-6 text-center text-pure-white">
            <p className="mb-6 text-[13px] font-medium tracking-[0.22em] uppercase opacity-90" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}>
              Halliyinda Nimma Manege · From the Village, to Your Home
            </p>
            <h1 className="font-serif font-light italic leading-[1.02] text-[46px] sm:text-[68px] md:text-[92px] max-w-[18ch]" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}>
              The Cow's Home — From Our Fields to Your Home
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] md:text-[19px] font-light leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}>
              HasuMane is a farmer entrepreneurship initiative — not just a dairy company. We build
              sustainable livelihoods, one farm at a time.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href="#farmers" className="rounded-[100px] bg-forest-ink px-7 py-3.5 text-[13px] font-medium tracking-wider text-pure-white hover:opacity-90 transition">
                I'M A FARMER
              </a>
              <a href="#consumers" className="rounded-[100px] border border-pure-white px-7 py-3.5 text-[13px] font-medium tracking-wider text-pure-white hover:bg-pure-white hover:text-charcoal transition">
                I'M A CONSUMER
              </a>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center text-[13px] tracking-wider opacity-80" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>
              Scroll to Explore ↓
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section id="story" className="mx-auto max-w-[1200px] px-6 py-[80px]">
        <div className="grid gap-12 md:grid-cols-12">
          <h2 className="md:col-span-7 font-serif text-[36px] md:text-[45px] leading-[1.08]">
            Not a Dairy Company.<br />A Farmer Entrepreneurship Initiative.
          </h2>
          <div className="md:col-span-5 max-w-[60ch]">
            <p className="text-[17px] font-light leading-relaxed text-graphite">
              HasuMane exists to build a sustainable ecosystem where farmers earn better incomes,
              consumers receive genuinely chemical-free food, and farming practices restore — rather
              than deplete — the environment. We don't own farms. We build farmers into entrepreneurs.
            </p>
            <p className="mt-4 text-[14px] uppercase tracking-[0.2em] text-pewter">
              The Little England of Tamilnadu
            </p>
          </div>
        </div>
      </section>

      {/* Mission quilt */}
      <section className="mx-auto max-w-[1200px] px-6 pb-[80px]">
        <div className="grid gap-5 md:grid-cols-3">
          <QuiltCard color="sky" eyebrow="01 · For Farmers" title="Earn With Dignity">
            Better incomes, guaranteed procurement, and real ownership of their dairy business.
          </QuiltCard>
          <QuiltCard color="peach" eyebrow="02 · For Consumers" title="Genuinely Clean Food">
            Chemical-free milk, curd, butter, and ghee — nothing added, nothing compromised.
          </QuiltCard>
          <QuiltCard color="sage" eyebrow="03 · For the Land" title="Restore, Don't Deplete">
            Organic methods that revive soil, water, and biodiversity instead of mining them.
          </QuiltCard>
        </div>
      </section>

      {/* Forest interstitial — Building Entrepreneurs */}
      <section id="farmers" className="bg-forest-ink text-pure-white">
        <div className="mx-auto max-w-[1200px] px-6 py-[90px]">
          <div className="grid gap-12 md:grid-cols-12 items-start">
            <div className="md:col-span-6">
              <h2 className="font-serif text-[36px] md:text-[45px] leading-[1.08]">
                We Don't Hire Farmers.<br />We Build Them Into Entrepreneurs.
              </h2>
              <p className="mt-6 max-w-[60ch] text-[17px] font-light opacity-90">
                Instead of owning farms, HasuMane partners directly with farmers and supports every
                step of building a profitable, modern dairy business.
              </p>
              <div className="mt-8 overflow-hidden rounded-[30px]">
                <img src={grazingCow.url} alt="Cow grazing at a partner farm" className="h-[360px] w-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <BenefitTile n="01" title="Bank Financing">
                Access to capital to set up a profitable dairy farm from day one.
              </BenefitTile>
              <BenefitTile n="02" title="Organic Methods">
                Training and support to adopt chemical-free farming practices.
              </BenefitTile>
              <BenefitTile n="03" title="Modern Technology">
                Machine milking and milk chilling systems on every partner farm.
              </BenefitTile>
              <BenefitTile n="04" title="Veterinary Support">
                Ongoing technical and veterinary care, plus guaranteed milk procurement.
              </BenefitTile>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="mx-auto max-w-[1200px] px-6 py-[80px]">
        <div className="grid gap-12 md:grid-cols-12">
          <h2 className="md:col-span-7 font-serif text-[36px] md:text-[45px] leading-[1.08]">
            Restoring the Land,<br />Not Extracting From It.
          </h2>
          <p className="md:col-span-5 max-w-[60ch] text-[17px] font-light text-graphite">
            Our model is built around four non-negotiables on every partner farm — what the cows eat
            matters as much as what they produce.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <QuiltCard color="sky" eyebrow="01" title="Chemical-Free Fodder">
            What the cows eat shapes everything they produce.
          </QuiltCard>
          <QuiltCard color="peach" eyebrow="02" title="No Antibiotics or Hormones">
            Ever, on any partner farm, in any season.
          </QuiltCard>
          <QuiltCard color="sage" eyebrow="03" title="Free-Range, Humane Care">
            Cattle are treated as living beings, not production units.
          </QuiltCard>
          <QuiltCard color="bone" eyebrow="04" title="Dung to Biogas">
            Farm waste becomes farm fuel and organic fertilizer — closing the loop.
          </QuiltCard>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-[1200px] px-6 pb-[80px]">
        <div className="grid gap-12 md:grid-cols-12">
          <h2 className="md:col-span-7 font-serif text-[36px] md:text-[45px] leading-[1.08]">
            Four Products.<br />No Compromises.
          </h2>
          <p className="md:col-span-5 max-w-[60ch] text-[17px] font-light text-graphite">
            We keep our line focused — milk, curd, butter, and ghee, made the traditional way, from
            our own partner farms.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ProductCard color="sky" name="Milk" desc="Free-range, antibiotic-free, hormone-free — chilled at source." />
          <ProductCard color="peach" name="Curd" desc="Traditional set curd, made fresh from our own pure milk." />
          <ProductCard color="sage" name="Butter" desc="Churned the traditional way. No additives, ever." />
          <ProductCard color="bone" name="Ghee" desc="Slow-cooked in small batches for purity and aroma." />
        </div>
      </section>

      {/* Delivery interstitial */}
      <section id="consumers" className="bg-forest-ink text-pure-white">
        <div className="mx-auto max-w-[1200px] px-6 py-[90px]">
          <div className="grid gap-12 md:grid-cols-12 items-center">
            <div className="md:col-span-7">
              <h2 className="font-serif text-[36px] md:text-[45px] leading-[1.08]">
                Fresh, Delivered to Your Door.
              </h2>
              <p className="mt-6 max-w-[60ch] text-[17px] font-light opacity-90">
                HasuMane runs a subscription-based delivery service through our mobile app — fresh
                milk, curd, butter, and ghee delivered straight to your home.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="rounded-[100px] bg-pure-white/10 px-5 py-2.5 text-[13px] tracking-wider border border-pure-white/30">
                  Now serving Bengaluru
                </span>
                <a
                  id="order"
                  href="#"
                  className="rounded-[100px] border border-pure-white px-7 py-3.5 text-[13px] font-medium tracking-wider hover:bg-pure-white hover:text-forest-ink transition"
                >
                  DOWNLOAD THE APP
                </a>
              </div>
            </div>
            <div className="md:col-span-5 overflow-hidden rounded-[30px]">
              <img src={brownCow.url} alt="Healthy cow at HasuMane partner farm" className="h-[360px] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="mx-auto max-w-[1200px] px-6 py-[90px]">
        <div className="grid gap-12 md:grid-cols-12 mb-12">
          <h2 className="md:col-span-7 font-serif text-[36px] md:text-[45px] leading-[1.08]">
            The People Behind HasuMane.
          </h2>
          <p className="md:col-span-5 max-w-[60ch] text-[17px] font-light text-graphite">
            Founders building a farmer-first dairy from the ground up — combining vision for organic
            agriculture with modern product and brand thinking.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FounderCard
            img={raviTeja.url}
            name="Mr. Ravi Teja"
            role="Founder · Organic Farming & Ecosystem"
            bio="An aspiring student entrepreneur with a strong vision for transforming the organic farming ecosystem. Driven by sustainable agriculture and natural living, Ravi is committed to chemical-free food practices and empowering farmers through eco-friendly solutions that preserve nature while enhancing productivity."
          />
          <FounderCard
            img={sujan.url}
            name="Mr. Sujan Saitej"
            role="Co-founder · Product & Digital"
            bio="Bringing technical product expertise and digital marketing innovation to HasuMane, Sujan focuses on transforming traditional organic farming into a modern, technology-enabled brand — connecting consumers with authentic farm-fresh products while empowering sustainable farming practices."
          />
        </div>
      </section>

      {/* Closing pull-quote */}
      <section className="mx-auto max-w-[1100px] px-6 pb-[100px] text-center">
        <div className="mx-auto overflow-hidden rounded-[30px]">
          <img src={calf.url} alt="Young calf at a partner farm" className="h-[320px] w-full object-cover" />
        </div>
        <p className="mt-10 font-serif font-light text-[26px] md:text-[32px] leading-[1.25] text-charcoal">
          "From the farmer's hands to your home — nothing added, nothing compromised."
        </p>
        <p className="mt-4 text-[14px] italic text-pewter">
          HasuMane — Halliyinda Nimma Manege (From the village, to your home)
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-forest-ink text-pure-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <LeafMark className="h-5 w-5" />
                <span className="font-serif text-[22px]">hasumane</span>
              </div>
              <p className="mt-4 max-w-[28ch] text-[14px] font-light opacity-85">
                A farmer entrepreneurship initiative building chemical-free dairy and restorative
                agriculture, one farm at a time.
              </p>
            </div>
            <FooterCol title="Explore" items={["For Farmers", "For Consumers", "Our Products", "Our Story"]} />
            <FooterCol title="Delivery" items={["Bengaluru Delivery", "Download the App", "Subscription Plans"]} />
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] opacity-70">Visit · The First Field</p>
              <address className="mt-4 not-italic text-[14px] font-light leading-relaxed opacity-90">
                HasuMane — The First Field<br />
                2/282 Jogapalli Village, Marupalli Post<br />
                Denkanikottai Taluk, Krishnagiri District<br />
                Tamil Nadu — 635118
              </address>
              <div className="mt-4 flex gap-4 text-[13px]">
                <a href="https://www.instagram.com/p/DZzGqaITfJJ/?igsh=MW1qeHc1a3dvYmg0dw==" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">Instagram</a>
                <a href="https://www.linkedin.com/posts/hasumane-organics-70a2ba418_hasumaneorganics-organicfarming-organicdairy-share-7473991161263853569-Ijjx/?utm_source=share&utm_medium=member_ios&rcm=ACoAAGoemnoBVfwW-ngen0It1oUHKdzL-aVUvfE" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">LinkedIn</a>
                <a href="https://wa.me/919344259815" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">WhatsApp</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-pure-white/15 pt-6 text-[12px] tracking-wider opacity-80">
            <span>© HasuMane. A Farmer Entrepreneurship Initiative.</span>
            <span>Halliyinda Nimma Manege</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const QUILT: Record<string, string> = {
  sky: "bg-sky-card",
  peach: "bg-peach-card",
  sage: "bg-sage-card",
  bone: "bg-pure-white",
};

function QuiltCard({
  color,
  eyebrow,
  title,
  children,
}: {
  color: keyof typeof QUILT;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${QUILT[color]} rounded-[20px] p-[30px] min-h-[230px] flex flex-col justify-between`}>
      <p className="text-[12px] tracking-[0.2em] uppercase text-charcoal/60">{eyebrow}</p>
      <div>
        <h3 className="font-serif text-[26px] leading-[1.1] mt-10">{title}</h3>
        <p className="mt-3 text-[14px] font-light text-charcoal/80 max-w-[34ch]">{children}</p>
      </div>
    </div>
  );
}

function ProductCard({ color, name, desc }: { color: keyof typeof QUILT; name: string; desc: string }) {
  return (
    <div className={`${QUILT[color]} rounded-[20px] p-[30px] min-h-[260px] flex flex-col justify-between`}>
      <span className="inline-flex w-fit rounded-[100px] border border-charcoal/20 px-3 py-1 text-[11px] tracking-[0.2em] uppercase">
        Product
      </span>
      <div>
        <h3 className="font-serif text-[34px] leading-none">{name}</h3>
        <p className="mt-3 text-[14px] font-light text-charcoal/80 max-w-[34ch]">{desc}</p>
      </div>
    </div>
  );
}

function BenefitTile({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-pure-white/15 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pure-white text-forest-ink text-[13px] font-medium">
        {n}
      </div>
      <h4 className="mt-5 text-[15px] font-semibold tracking-wide">{title}</h4>
      <p className="mt-2 text-[14px] font-light opacity-85 max-w-[34ch]">{children}</p>
    </div>
  );
}

function FounderCard({ img, name, role, bio }: { img: string; name: string; role: string; bio: string }) {
  return (
    <div className="rounded-[20px] bg-pure-white p-6 flex flex-col sm:flex-row gap-6">
      <div className="sm:w-[180px] shrink-0 overflow-hidden rounded-[20px]">
        <img src={img} alt={name} className="h-[220px] w-full object-cover sm:h-full" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-serif text-[26px] leading-tight">{name}</h3>
        <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-pewter">{role}</p>
        <p className="mt-4 text-[14px] font-light leading-relaxed text-graphite">{bio}</p>
      </div>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-[0.2em] opacity-70">{title}</p>
      <ul className="mt-4 space-y-2 text-[14px] font-light">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:opacity-80">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
