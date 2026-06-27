import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, BadgeIndianRupee, CalendarDays, CheckCircle2, Cpu, Download, Droplets, Flame, HandCoins, HeartHandshake, Instagram, Leaf, Linkedin, MapPin, MessageSquare, Milk, PackageCheck, Phone, Recycle, Send, ShieldCheck, Smartphone, Sprout, Stethoscope, Truck, User, Wheat } from "lucide-react";
var grazing_cow_jpeg_asset_default = { url: "/grazing-cow.jpeg" };
var brown_cow_jpeg_asset_default = { url: "/brown-cow.jpeg" };
var calf_jpeg_asset_default = { url: "/calf.jpeg" };
var ravi_teja_jpeg_asset_default = { url: "/ravi-teja.jpeg" };
var sujan_png_asset_default = { url: "/sujan-portrait.jpg" };
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var HERO_VIDEO_SRC = "/hasumane-video.mp4";
var API_URL = "http://localhost:5000".replace(/\/$/, "");
var MARQUEE = [
	"Now Delivering Fresh, Daily, Across Bengaluru",
	"Chemical-Free, Always",
	"A Farmer Entrepreneurship Initiative",
	"From the Village, to Your Home"
];
var missionCards = [
	{
		eyebrow: "01 - For Farmers",
		title: "Earn With Dignity",
		bgColor: "bg-sky-card",
		icon: HandCoins,
		body: "Better incomes, guaranteed procurement, and real ownership of their dairy business."
	},
	{
		eyebrow: "02 - For Consumers",
		title: "Genuinely Clean Food",
		bgColor: "bg-peach-card",
		icon: ShieldCheck,
		body: "Chemical-free milk, curd, butter, and ghee - nothing added, nothing compromised."
	},
	{
		eyebrow: "03 - For the Land",
		title: "Restore, Don't Deplete",
		bgColor: "bg-sage-card",
		icon: Sprout,
		body: "Organic methods that revive soil, water, and biodiversity instead of mining them."
	}
];
var sustainabilityCards = [
	{
		eyebrow: "01",
		title: "Chemical-Free Fodder",
		bgColor: "bg-sky-card",
		icon: Wheat,
		body: "What the cows eat shapes everything they produce."
	},
	{
		eyebrow: "02",
		title: "No Antibiotics or Hormones",
		bgColor: "bg-peach-card",
		icon: ShieldCheck,
		body: "Ever, on any partner farm, in any season."
	},
	{
		eyebrow: "03",
		title: "Free-Range, Humane Care",
		bgColor: "bg-sage-card",
		icon: HeartHandshake,
		body: "Cattle are treated as living beings, not production units."
	},
	{
		eyebrow: "04",
		title: "Dung to Biogas",
		bgColor: "bg-ash-gray",
		icon: Recycle,
		body: "Farm waste becomes farm fuel and organic fertilizer - closing the loop."
	}
];
var productCardTones = [
	"bg-sky-card",
	"bg-peach-card",
	"bg-sage-card",
	"bg-ash-gray"
];
function normalizeProductOrderUnit(product) {
	const label = `${product.name} ${product.productType}`.toLowerCase();
	const unit = (product.unit || "").toLowerCase();
	if (label.includes("milk") || label.includes("curd")) return "litre";
	if (label.includes("ghee")) return "kg";
	if (label.includes("butter") || label.includes("paneer") || label.includes("panner") || label.includes("cheese")) return "gram";
	if ([
		"litre",
		"liter",
		"l",
		"lt"
	].includes(unit)) return "litre";
	if ([
		"kg",
		"kilogram",
		"kilograms"
	].includes(unit)) return "kg";
	if ([
		"g",
		"gram",
		"grams"
	].includes(unit)) return "gram";
	return "kg";
}
function formatOrderUnitLabel(unit) {
	if (unit === "litre") return "Litre";
	if (unit === "gram") return "Gram";
	return "Kg";
}
var fallbackProducts = [
	{
		code: "MK-01",
		name: "Milk",
		value: "milk",
		bgColor: "bg-sky-card",
		icon: Milk,
		unit: "litre",
		desc: "Free-range, antibiotic-free, hormone-free - chilled at source."
	},
	{
		code: "CD-02",
		name: "Curd",
		value: "curd",
		bgColor: "bg-peach-card",
		icon: Droplets,
		unit: "litre",
		desc: "Traditional set curd, made fresh from our own pure milk."
	},
	{
		code: "BT-03",
		name: "Butter",
		value: "butter",
		bgColor: "bg-sage-card",
		icon: PackageCheck,
		unit: "gram",
		desc: "Churned the traditional way. No additives, ever."
	},
	{
		code: "GH-05",
		name: "Ghee",
		value: "ghee",
		bgColor: "bg-ash-gray",
		icon: Flame,
		unit: "kg",
		desc: "Slow-cooked in small batches for purity and aroma."
	},
	{
		code: "PN-04",
		name: "Paneer",
		value: "paneer",
		bgColor: "bg-ash-gray",
		icon: PackageCheck,
		unit: "gram",
		desc: "Fresh paneer blocks for cooking, grilling, and rich meals."
	},
	{
		code: "CH-06",
		name: "Cheese",
		value: "cheese",
		bgColor: "bg-sky-card",
		icon: PackageCheck,
		unit: "gram",
		desc: "Soft fresh cheese for slices, cooking, and everyday use."
	}
];
function getProductIcon(product) {
	const label = `${product.name} ${product.productType}`.toLowerCase();
	if (label.includes("milk")) return Milk;
	if (label.includes("curd") || label.includes("yogurt")) return Droplets;
	if (label.includes("ghee")) return Flame;
	if (label.includes("butter")) return PackageCheck;
	if (label.includes("paneer") || label.includes("panner")) return PackageCheck;
	if (label.includes("cheese")) return PackageCheck;
	return PackageCheck;
}
function mapProductToSiteProduct(product, index) {
	const unit = normalizeProductOrderUnit(product);
	return {
		code: product.code,
		name: product.name,
		value: product.productType || product.code || product.name,
		bgColor: productCardTones[index % productCardTones.length],
		icon: getProductIcon(product),
		unit,
		desc: product.description || `${product.defaultQuantity || 1} ${formatOrderUnitLabel(unit).toLowerCase()} available on ${product.defaultSchedule || "custom"} plans.`
	};
}
function getApiProducts(result) {
	if (Array.isArray(result.products)) return result.products;
	if (Array.isArray(result.data)) return result.data;
	if (result.data && !Array.isArray(result.data)) {
		if (Array.isArray(result.data.products)) return result.data.products;
		if (Array.isArray(result.data.data)) return result.data.data;
	}
	return [];
}
function IconBadge({ icon: Icon, tone = "light", className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-110 ${tone === "dark" ? "border-pure-white/15 bg-pure-white text-forest-ink group-hover:bg-vivid-lime" : tone === "soft" ? "border-forest-ink/10 bg-pure-white/70 text-forest-ink group-hover:bg-vivid-lime" : "border-forest-ink/10 bg-forest-ink text-pure-white group-hover:bg-vivid-lime group-hover:text-forest-ink"} ${className}`,
		children: /* @__PURE__ */ jsx(Icon, {
			className: "h-[19px] w-[19px]",
			strokeWidth: 1.8,
			"aria-hidden": "true"
		})
	});
}
function WhatsAppIcon({ className = "h-[18px] w-[18px]", ...props }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		className,
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" })
	});
}
function Index() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [leadStatus, setLeadStatus] = useState("idle");
	const [leadMessage, setLeadMessage] = useState("");
	const [siteProducts, setSiteProducts] = useState(fallbackProducts);
	const [selectedProduct, setSelectedProduct] = useState(fallbackProducts[0]?.value ?? "milk");
	const [requestType, setRequestType] = useState("subscription");
	const videoRef = useRef(null);
	const productOptionsKey = siteProducts.map((product) => product.value).join("|");
	const selectedProductUnit = siteProducts.find((product) => product.value === selectedProduct)?.unit ?? "litre";
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = true;
			videoRef.current.play().catch((err) => {
				console.warn("Autoplay failed or was prevented:", err);
			});
		}
	}, []);
	useEffect(() => {
		const hash = window.location.hash;
		if (hash && hash.length > 1) {
			const timer = setTimeout(() => {
				const id = hash.substring(1);
				const element = document.getElementById(id);
				if (element) {
					const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
					element.scrollIntoView({
						behavior: prefersReducedMotion ? "auto" : "smooth",
						block: "start"
					});
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, []);
	useEffect(() => {
		const handleHashClick = (e) => {
			const anchor = e.target.closest("a");
			if (!anchor) return;
			const href = anchor.getAttribute("href");
			if (href && href.startsWith("#") && href.length > 1) {
				e.preventDefault();
				const id = href.substring(1);
				const element = document.getElementById(id);
				if (element) {
					const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
					element.scrollIntoView({
						behavior: prefersReducedMotion ? "auto" : "smooth",
						block: "start"
					});
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
					signal: controller.signal
				});
				const result = await response.json();
				const products = getApiProducts(result);
				if (!response.ok || result.success === false || products.length === 0) throw new Error("Product catalog unavailable.");
				const activeProducts = products.filter((product) => product.isActive ?? product.active ?? true).map(mapProductToSiteProduct);
				if (isMounted && activeProducts.length > 0) setSiteProducts(activeProducts);
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
		if (!siteProducts.some((product) => product.value === selectedProduct)) setSelectedProduct(siteProducts[0]?.value ?? "milk");
	}, [selectedProduct, siteProducts]);
	function handleProductSelect(productValue) {
		setSelectedProduct(productValue);
		const orderSection = document.getElementById("order");
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		orderSection?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
	}
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("scroll-fade-in-visible");
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: .05,
			rootMargin: "0px 0px -50px 0px"
		});
		const elements = document.querySelectorAll(".scroll-fade-in");
		elements.forEach((el) => observer.observe(el));
		return () => {
			window.removeEventListener("scroll", handleScroll);
			elements.forEach((el) => observer.unobserve(el));
		};
	}, []);
	async function handleLeadSubmit(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		setLeadStatus("submitting");
		setLeadMessage("");
		try {
			const response = await fetch("/api/leads", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.get("name"),
					phone: formData.get("phone"),
					area: formData.get("area"),
					product: formData.get("product"),
					requestType: formData.get("requestType"),
					quantity: formData.get("quantity"),
					plan: formData.get("plan") || "daily",
					source: `website-${String(formData.get("requestType") || "subscription")}`,
					notes: formData.get("notes") || ""
				})
			});
			const result = await response.json();
			if (!response.ok || !result.success) throw new Error(result.error || result.message || "Please check the form and try again.");
			form.reset();
			setSelectedProduct(siteProducts[0]?.value ?? "milk");
			setRequestType("subscription");
			setLeadStatus("success");
			setLeadMessage(result.message ?? "Thanks. We received your request.");
			const name = formData.get("name");
			const phone = formData.get("phone");
			const area = formData.get("area");
			const product = formData.get("product");
			const requestTypeValue = formData.get("requestType") || "subscription";
			const quantity = formData.get("quantity");
			const plan = formData.get("plan");
			const notes = formData.get("notes") || "None";
			const text = `Hi HasuMane, I'm ${name}. I'd like to request details for a ${requestTypeValue === "order" ? "one-time order" : "subscription"}.\n\n*My Details*:\n- Phone: ${phone}\n- Area: ${area}\n- Product: ${product}\n- Quantity: ${quantity}\n- Plan: ${plan}\n- Notes: ${notes}`;
			const whatsappUrl = `https://wa.me/919344259815?text=${encodeURIComponent(text)}`;
			window.open(whatsappUrl, "_blank");
		} catch (error) {
			setLeadStatus("error");
			setLeadMessage(error instanceof Error ? error.message : "We could not submit your request right now. Please try again.");
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "relative min-h-screen overflow-x-hidden bg-bone text-charcoal font-inter selection:bg-vivid-lime selection:text-forest-ink",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none fixed left-0 right-0 top-[48px] z-0 h-[calc(100svh-48px)] bg-pure-white p-[10px]",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative h-full w-full overflow-hidden rounded-[18px] bg-black bg-cover bg-center",
					children: [/* @__PURE__ */ jsx("video", {
						ref: videoRef,
						autoPlay: true,
						loop: true,
						muted: true,
						playsInline: true,
						preload: "auto",
						disablePictureInPicture: true,
						"aria-hidden": "true",
						className: "hero-video absolute inset-0 h-full w-full object-cover object-center bg-black",
						children: /* @__PURE__ */ jsx("source", {
							src: HERO_VIDEO_SRC,
							type: "video/mp4"
						})
					}), /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.28)_34%,rgba(0,0,0,0.05)_66%,rgba(0,0,0,0.34)_100%)]" })]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "fixed left-0 top-0 z-[70] flex h-[48px] w-full items-center overflow-hidden bg-vivid-lime text-charcoal",
				children: /* @__PURE__ */ jsx("div", {
					className: "flex marquee-track whitespace-nowrap text-caption font-medium uppercase tracking-wider",
					children: [...Array(2)].map((_, i) => /* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-30 pr-30",
						children: MARQUEE.concat(MARQUEE).map((text, j) => /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-10",
							children: [/* @__PURE__ */ jsx("span", { children: text }), /* @__PURE__ */ jsx(CheckCircle2, {
								className: "h-[15px] w-[15px] shrink-0 text-forest-ink",
								strokeWidth: 2,
								"aria-hidden": "true"
							})]
						}, `${i}-${j}`))
					}, i))
				})
			}),
			/* @__PURE__ */ jsx("header", {
				className: `fixed left-0 right-0 top-[48px] z-[60] flex items-center transition-all duration-300 ${isScrolled ? "h-[64px] bg-forest-ink/95 shadow-md backdrop-blur-sm" : "h-[92px] bg-transparent"}`,
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex w-full max-w-[1320px] items-center justify-between px-24",
					children: [
						/* @__PURE__ */ jsxs("nav", {
							className: "hidden items-center gap-24 text-[15px] font-medium md:flex",
							children: [
								/* @__PURE__ */ jsx("a", {
									href: "#farmers",
									className: "text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime",
									children: "For Farmers"
								}),
								/* @__PURE__ */ jsx("a", {
									href: "#consumers",
									className: "text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime",
									children: "For Consumers"
								}),
								/* @__PURE__ */ jsx("a", {
									href: "#products",
									className: "text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime",
									children: "Our Products"
								}),
								/* @__PURE__ */ jsx("a", {
									href: "#story",
									className: "text-pure-white/90 transition-colors duration-300 hover:text-vivid-lime",
									children: "Our Story"
								})
							]
						}),
						/* @__PURE__ */ jsxs("a", {
							href: "#",
							className: `flex origin-center items-center gap-4 transition-all duration-300 ${isScrolled ? "scale-[0.78]" : "scale-100"}`,
							children: [/* @__PURE__ */ jsx(Leaf, {
								size: 36,
								className: "shrink-0 text-pure-white",
								style: {
									width: "36px",
									height: "36px"
								},
								strokeWidth: 1.8,
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-reckless text-[36px] font-medium tracking-tight text-pure-white leading-none",
								children: "HasuMane"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex min-w-[150px] items-center justify-end",
							children: /* @__PURE__ */ jsxs("a", {
								href: "#order",
								className: "rounded-nav-pills bg-pure-white px-20 py-10 text-[13px] font-medium uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 hover:scale-105 hover:bg-vivid-lime hover:text-forest-ink active:scale-95",
								children: ["Order Now", /* @__PURE__ */ jsx(ArrowRight, {
									className: "ml-8 inline h-[14px] w-[14px]",
									strokeWidth: 1.8,
									"aria-hidden": "true"
								})]
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "relative z-10 h-[100svh] min-h-[650px] w-full bg-transparent px-[10px] pt-[48px]",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex h-full max-w-[1320px] flex-col items-center justify-center px-24 pt-[48px] pb-[48px] text-center text-pure-white",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "hero-kicker mb-20 text-[12px] font-medium uppercase tracking-[0.25em] text-vivid-lime",
							children: "Halliyinda Nimma Manege"
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "hero-title max-w-[25ch] font-reckless text-heading-lg font-light leading-[1.04] sm:text-[68px] md:text-display",
							children: ["The Cow's Home", /* @__PURE__ */ jsx("span", {
								className: "block",
								children: "to Your Home"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "sr-only",
							children: "HasuMane is a farmer entrepreneurship initiative, not just a dairy company. We build sustainable livelihoods, one farm at a time."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "hero-cta mt-30 flex flex-wrap items-center justify-center gap-15",
							children: [/* @__PURE__ */ jsxs("a", {
								href: "#farmers",
								className: "rounded-buttons border border-sky-card bg-sky-card px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-charcoal transition-all duration-300 hover:scale-[1.03] hover:border-pure-white hover:bg-pure-white active:scale-[0.98]",
								children: ["I'm a Farmer", /* @__PURE__ */ jsx(ArrowRight, {
									className: "ml-8 inline h-[14px] w-[14px]",
									strokeWidth: 1.8,
									"aria-hidden": "true"
								})]
							}), /* @__PURE__ */ jsxs("a", {
								href: "#consumers",
								className: "rounded-buttons border border-forest-ink bg-forest-ink px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-pure-white transition-all duration-300 hover:scale-[1.03] hover:border-pure-white hover:bg-pure-white hover:text-forest-ink active:scale-[0.98]",
								children: ["I'm a Consumer", /* @__PURE__ */ jsx(ArrowRight, {
									className: "ml-8 inline h-[14px] w-[14px]",
									strokeWidth: 1.8,
									"aria-hidden": "true"
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "absolute bottom-[56px] left-0 right-0 text-center text-[12px] tracking-wider opacity-90",
							children: /* @__PURE__ */ jsx("a", {
								href: "#story",
								className: "inline-flex translate-y-0 text-pure-white transition-transform duration-300 hover:translate-y-[3px] hover:text-vivid-lime",
								children: "Scroll to Explore"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-20 -mt-[44px] rounded-t-[38px] border-t border-moss/50 bg-bone shadow-[0_-18px_42px_rgba(0,0,0,0.08)] md:rounded-t-[54px]",
				children: [
					/* @__PURE__ */ jsx("section", {
						id: "story",
						className: "scroll-fade-in mx-auto max-w-[1200px] px-24 py-[80px]",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid items-start gap-30 border-b border-moss pb-40 md:grid-cols-12",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "md:col-span-7",
								children: [/* @__PURE__ */ jsxs("h2", {
									className: "text-heading-lg font-light leading-[1.1] text-charcoal",
									children: [
										"Not a Dairy Company.",
										/* @__PURE__ */ jsx("br", {}),
										"A Farmer Entrepreneurship Initiative."
									]
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-30 max-w-[62ch] font-inter text-[17px] leading-relaxed text-graphite",
									children: "HasuMane exists to build a sustainable ecosystem where farmers earn better incomes, consumers receive genuinely chemical-free food, and farming practices restore the environment instead of depleting it. We do not own farms. We build farmers into entrepreneurs."
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "md:col-span-5 md:pt-20 md:text-right",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-caption font-mono uppercase tracking-[0.2em] text-pewter",
									children: "The Little England of Tamilnadu"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-5 text-body-sm text-graphite",
									children: "Krishnagiri District, Tamil Nadu"
								})]
							})]
						})
					}),
					/* @__PURE__ */ jsx("section", {
						className: "scroll-fade-in mx-auto max-w-[1200px] px-24 pb-[80px]",
						children: /* @__PURE__ */ jsx("div", {
							className: "grid gap-24 md:grid-cols-3",
							children: missionCards.map((card) => /* @__PURE__ */ jsx(QuiltCard, {
								eyebrow: card.eyebrow,
								title: card.title,
								bgColor: card.bgColor,
								icon: card.icon,
								children: card.body
							}, card.title))
						})
					}),
					/* @__PURE__ */ jsx("section", {
						id: "farmers",
						className: "scroll-fade-in bg-forest-ink py-[90px] text-pure-white",
						children: /* @__PURE__ */ jsxs("div", {
							className: "mx-auto max-w-[1200px] px-24",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "mb-40 grid items-start gap-40 md:grid-cols-12",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "md:col-span-7",
									children: [/* @__PURE__ */ jsxs("h2", {
										className: "font-reckless text-heading-lg leading-[1.08]",
										children: [
											"We Don't Hire Farmers.",
											/* @__PURE__ */ jsx("br", {}),
											"We Build Them Into Entrepreneurs."
										]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-30 max-w-[56ch] text-[17px] leading-relaxed opacity-95",
										children: "Instead of owning farms, HasuMane partners directly with farmers and supports every step of building a profitable, modern dairy business."
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "zoom-container rounded-hero-cards border border-pure-white/10 md:col-span-5",
									children: /* @__PURE__ */ jsx("img", {
										src: grazing_cow_jpeg_asset_default.url,
										alt: "Cow grazing at a partner farm",
										className: "h-[280px] w-full object-cover",
										loading: "lazy",
										decoding: "async"
									})
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-24 border-t border-pure-white/10 pt-40 sm:grid-cols-2 lg:grid-cols-4",
								children: [
									/* @__PURE__ */ jsx(BenefitItem, {
										icon: BadgeIndianRupee,
										title: "Bank Financing",
										children: "Access to capital to set up a profitable dairy farm from day one."
									}),
									/* @__PURE__ */ jsx(BenefitItem, {
										icon: Sprout,
										title: "Organic Methods",
										children: "Training and support to adopt chemical-free farming practices."
									}),
									/* @__PURE__ */ jsx(BenefitItem, {
										icon: Cpu,
										title: "Modern Technology",
										children: "Machine milking and milk chilling systems on every partner farm."
									}),
									/* @__PURE__ */ jsx(BenefitItem, {
										icon: Stethoscope,
										title: "Veterinary Support",
										children: "Ongoing technical and veterinary care, plus guaranteed milk procurement."
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "scroll-fade-in mx-auto max-w-[1200px] px-24 py-[80px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-40 grid items-end gap-30 border-b border-moss pb-30 md:grid-cols-12",
							children: [/* @__PURE__ */ jsxs("h2", {
								className: "text-heading font-light text-charcoal md:col-span-7",
								children: [
									"Restoring the Land,",
									/* @__PURE__ */ jsx("br", {}),
									"Not Extracting From It."
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5",
								children: "Our model is built around four non-negotiables on every partner farm. What the cows eat matters as much as what they produce."
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "grid gap-24 md:grid-cols-2 lg:grid-cols-4",
							children: sustainabilityCards.map((card) => /* @__PURE__ */ jsx(QuiltCard, {
								eyebrow: card.eyebrow,
								title: card.title,
								bgColor: card.bgColor,
								icon: card.icon,
								children: card.body
							}, card.title))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "products",
						className: "scroll-fade-in mx-auto max-w-[1200px] px-24 pb-[80px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-40 grid items-end gap-30 border-b border-moss pb-30 md:grid-cols-12",
							children: [/* @__PURE__ */ jsxs("h2", {
								className: "text-heading font-light text-charcoal md:col-span-7",
								children: [
									"Fresh Products.",
									/* @__PURE__ */ jsx("br", {}),
									"No Compromises."
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5",
								children: "Our catalog updates from the CRM, so every active product your team adds is available for customers to request."
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "grid gap-24 md:grid-cols-2 lg:grid-cols-4",
							children: siteProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, {
								...product,
								onSelect: () => handleProductSelect(product.value)
							}, product.value))
						})]
					}),
					/* @__PURE__ */ jsx("section", {
						id: "consumers",
						className: "scroll-fade-in mx-auto max-w-[1200px] border-t border-moss px-24 py-[80px]",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid items-center gap-40 md:grid-cols-12",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "md:col-span-7",
								children: [
									/* @__PURE__ */ jsx("h2", {
										className: "text-heading-lg font-light leading-[1.1] text-charcoal",
										children: "Fresh, Delivered to Your Door."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-30 max-w-[56ch] text-[17px] leading-relaxed text-graphite",
										children: "HasuMane runs a subscription-based delivery service through our mobile app. Fresh milk, curd, butter, and ghee delivered straight to your home."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-24 flex flex-wrap items-center gap-15",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "inline-flex items-center rounded-nav-pills border border-forest-ink/20 bg-forest-ink/10 px-20 py-10 text-[13px] font-medium tracking-wider text-forest-ink",
											children: [/* @__PURE__ */ jsx(Truck, {
												className: "mr-8 h-[15px] w-[15px]",
												strokeWidth: 1.8,
												"aria-hidden": "true"
											}), "Now serving Bengaluru"]
										}), /* @__PURE__ */ jsxs("a", {
											href: "#order",
											className: "inline-flex items-center rounded-buttons border border-graphite bg-transparent px-30 py-12 text-[14px] font-medium uppercase tracking-wider text-charcoal transition hover:border-forest-ink hover:bg-forest-ink hover:text-pure-white",
											children: [
												/* @__PURE__ */ jsx(Smartphone, {
													className: "mr-8 h-[15px] w-[15px]",
													strokeWidth: 1.8,
													"aria-hidden": "true"
												}),
												"Download the App",
												/* @__PURE__ */ jsx(Download, {
													className: "ml-8 h-[15px] w-[15px]",
													strokeWidth: 1.8,
													"aria-hidden": "true"
												})
											]
										})]
									})
								]
							}), /* @__PURE__ */ jsx("div", {
								className: "zoom-container rounded-hero-cards border border-moss md:col-span-5",
								children: /* @__PURE__ */ jsx("img", {
									src: brown_cow_jpeg_asset_default.url,
									alt: "Healthy cow at HasuMane partner farm",
									className: "h-[320px] w-full object-cover",
									loading: "lazy",
									decoding: "async"
								})
							})]
						})
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "scroll-fade-in mx-auto max-w-[1200px] border-t border-moss px-24 py-[80px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-12 grid items-end gap-30 md:grid-cols-12",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-heading font-light text-charcoal md:col-span-7",
								children: "The People Behind HasuMane."
							}), /* @__PURE__ */ jsx("p", {
								className: "max-w-[48ch] text-[16px] leading-relaxed text-graphite md:col-span-5",
								children: "Founders building a farmer-first dairy from the ground up, combining organic agriculture with modern product and brand thinking."
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid gap-24 md:grid-cols-2",
							children: [/* @__PURE__ */ jsx(FounderCard, {
								img: ravi_teja_jpeg_asset_default.url,
								name: "Mr. Ravi Teja",
								role: "Founder - Organic Farming & Ecosystem",
								bio: "An aspiring student entrepreneur with a strong vision for transforming the organic farming ecosystem. Ravi is committed to chemical-free food practices and empowering farmers through eco-friendly solutions."
							}), /* @__PURE__ */ jsx(FounderCard, {
								img: sujan_png_asset_default.url,
								name: "Mr. Sujan Saitej",
								role: "Co-founder - Product & Digital",
								bio: "Bringing product expertise and digital marketing innovation to HasuMane, Sujan focuses on connecting consumers with authentic farm-fresh products while supporting sustainable farming practices."
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "scroll-fade-in mx-auto max-w-[1100px] px-24 pb-[90px] text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "zoom-container mx-auto rounded-[20px] border border-moss",
								children: /* @__PURE__ */ jsx("img", {
									src: calf_jpeg_asset_default.url,
									alt: "Young calf at a partner farm",
									className: "h-[320px] w-full object-cover",
									loading: "lazy",
									decoding: "async"
								})
							}),
							/* @__PURE__ */ jsx("blockquote", {
								className: "mx-auto mt-30 max-w-[32ch] font-reckless text-heading-sm font-light italic text-charcoal",
								children: "\"From the farmer's hands to your home - nothing added, nothing compromised.\""
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-15 text-caption uppercase tracking-[0.2em] text-pewter",
								children: "HasuMane - Halliyinda Nimma Manege"
							})
						]
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "order",
						className: "scroll-fade-in border-t border-moss bg-bone/30 py-[90px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mx-auto max-w-[650px] px-24 text-center",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-caption font-mono uppercase tracking-[0.2em] text-forest-ink",
									children: "Bengaluru Orders and Subscriptions"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "mt-12 mb-24 font-reckless text-heading font-light text-charcoal",
									children: "Choose How You Want To Order"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mb-40 text-body-sm leading-relaxed text-graphite max-w-[50ch] mx-auto",
									children: "We deliver fresh, chemical-free products daily across Bengaluru. Send a one-time order request or start a recurring subscription below."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col sm:flex-row items-center justify-center gap-16 mt-20",
									children: [/* @__PURE__ */ jsxs("a", {
										href: "https://wa.me/919344259815",
										target: "_blank",
										rel: "noopener noreferrer",
										className: "bg-forest-ink text-pure-white rounded-buttons py-15 px-35 text-[14px] font-medium tracking-wider uppercase hover:bg-forest-ink/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm flex items-center justify-center gap-10 w-full sm:w-auto whitespace-nowrap",
										children: [/* @__PURE__ */ jsx(WhatsAppIcon, {
											className: "h-[22px] w-[22px] shrink-0",
											"aria-hidden": "true"
										}), "Message on WhatsApp"]
									}), /* @__PURE__ */ jsxs("a", {
										href: "https://www.instagram.com/hasumane_organics?igsh=cWo4YzJ2eDB0bXow",
										target: "_blank",
										rel: "noopener noreferrer",
										className: "border border-forest-ink text-forest-ink bg-transparent rounded-buttons py-15 px-35 text-[14px] font-medium tracking-wider uppercase hover:bg-forest-ink hover:text-pure-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-10 w-full sm:w-auto whitespace-nowrap",
										children: [/* @__PURE__ */ jsx(Instagram, {
											className: "h-[22px] w-[22px] shrink-0",
											strokeWidth: 1.8,
											"aria-hidden": "true"
										}), "Follow on Instagram"]
									})]
								})
							]
						}), /* @__PURE__ */ jsx("div", {
							className: "mx-auto mt-40 max-w-[1120px] px-24",
							children: /* @__PURE__ */ jsxs("div", {
								className: "rounded-[24px] border border-moss/20 bg-pure-white p-20 shadow-xl sm:p-32 lg:p-36",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "text-center font-reckless text-[24px] font-medium text-forest-ink",
										children: "Start Your Fresh Order"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-8 text-center text-body-sm text-pewter",
										children: "Fill in your details below and we will contact you on WhatsApp shortly."
									}),
									/* @__PURE__ */ jsxs("form", {
										id: "order-form",
										onSubmit: handleLeadSubmit,
										className: "mt-22 grid gap-16 text-left xl:grid-cols-[1fr_1fr] xl:items-start",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "grid gap-16 rounded-[18px] border border-moss/20 bg-bone/25 p-16 lg:p-18",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "mb-4 flex items-center gap-8",
														children: [/* @__PURE__ */ jsx("span", {
															className: "flex h-28 w-28 items-center justify-center rounded-[8px] bg-forest-ink/10 text-forest-ink",
															children: /* @__PURE__ */ jsx(User, {
																className: "h-[14px] w-[14px]",
																strokeWidth: 1.9
															})
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter",
															children: "Contact"
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "grid gap-12 md:grid-cols-2",
														children: [/* @__PURE__ */ jsxs("div", {
															className: "relative flex flex-col",
															children: [/* @__PURE__ */ jsx("span", {
																className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
																children: "Your Name"
															}), /* @__PURE__ */ jsxs("div", {
																className: "relative flex items-center",
																children: [/* @__PURE__ */ jsx(User, {
																	className: "absolute left-20 h-[18px] w-[18px] text-pewter",
																	strokeWidth: 1.8
																}), /* @__PURE__ */ jsx("input", {
																	name: "name",
																	type: "text",
																	"aria-label": "Your name",
																	placeholder: "e.g. John Doe",
																	required: true,
																	autoComplete: "name",
																	disabled: leadStatus === "submitting",
																	className: "h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
																})]
															})]
														}), /* @__PURE__ */ jsxs("div", {
															className: "relative flex flex-col",
															children: [/* @__PURE__ */ jsx("span", {
																className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
																children: "Phone Number"
															}), /* @__PURE__ */ jsxs("div", {
																className: "relative flex items-center",
																children: [/* @__PURE__ */ jsx(Phone, {
																	className: "absolute left-20 h-[18px] w-[18px] text-pewter",
																	strokeWidth: 1.8
																}), /* @__PURE__ */ jsx("input", {
																	name: "phone",
																	type: "tel",
																	"aria-label": "Phone number",
																	placeholder: "e.g. +91 93453 43434",
																	required: true,
																	autoComplete: "tel",
																	disabled: leadStatus === "submitting",
																	className: "h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
																})]
															})]
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "relative flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
															children: "Delivery Area / Pincode"
														}), /* @__PURE__ */ jsxs("div", {
															className: "relative flex items-center",
															children: [/* @__PURE__ */ jsx(MapPin, {
																className: "absolute left-20 h-[18px] w-[18px] text-pewter",
																strokeWidth: 1.8
															}), /* @__PURE__ */ jsx("input", {
																name: "area",
																type: "text",
																"aria-label": "Area or pincode in Bengaluru",
																placeholder: "e.g. Indiranagar, 560038",
																required: true,
																autoComplete: "address-level2",
																disabled: leadStatus === "submitting",
																className: "h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
															})]
														})]
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "grid gap-16 rounded-[18px] border border-moss/20 bg-bone/25 p-16 lg:p-18",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "mb-4 flex items-center gap-8",
														children: [/* @__PURE__ */ jsx("span", {
															className: "flex h-28 w-28 items-center justify-center rounded-[8px] bg-forest-ink/10 text-forest-ink",
															children: /* @__PURE__ */ jsx(CalendarDays, {
																className: "h-[14px] w-[14px]",
																strokeWidth: 1.9
															})
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter",
															children: "Order setup"
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "relative flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
															children: "Request Type"
														}), /* @__PURE__ */ jsxs("div", {
															className: "grid grid-cols-2 gap-4 rounded-[16px] border border-moss/45 bg-pure-white p-2 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]",
															children: [/* @__PURE__ */ jsxs("label", {
																className: `flex min-h-[52px] cursor-pointer items-center justify-center gap-8 rounded-[12px] px-14 py-12 text-body-sm font-semibold transition-all ${requestType === "subscription" ? "bg-forest-ink text-pure-white shadow-md" : "text-charcoal hover:bg-bone/45 hover:shadow-sm"}`,
																children: [
																	/* @__PURE__ */ jsx("input", {
																		type: "radio",
																		name: "requestType",
																		value: "subscription",
																		checked: requestType === "subscription",
																		onChange: () => setRequestType("subscription"),
																		disabled: leadStatus === "submitting",
																		className: "sr-only"
																	}),
																	/* @__PURE__ */ jsx(CalendarDays, {
																		className: "h-[16px] w-[16px]",
																		strokeWidth: 2
																	}),
																	"Subscription"
																]
															}), /* @__PURE__ */ jsxs("label", {
																className: `flex min-h-[52px] cursor-pointer items-center justify-center gap-8 rounded-[12px] px-14 py-12 text-body-sm font-semibold transition-all ${requestType === "order" ? "bg-forest-ink text-pure-white shadow-md" : "text-charcoal hover:bg-bone/45 hover:shadow-sm"}`,
																children: [
																	/* @__PURE__ */ jsx("input", {
																		type: "radio",
																		name: "requestType",
																		value: "order",
																		checked: requestType === "order",
																		onChange: () => setRequestType("order"),
																		disabled: leadStatus === "submitting",
																		className: "sr-only"
																	}),
																	/* @__PURE__ */ jsx(PackageCheck, {
																		className: "h-[16px] w-[16px]",
																		strokeWidth: 2
																	}),
																	"One-time Order"
																]
															})]
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "grid gap-12 md:grid-cols-[1.15fr_0.85fr]",
														children: [/* @__PURE__ */ jsxs("div", {
															className: "relative flex flex-col",
															children: [/* @__PURE__ */ jsx("span", {
																className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
																children: "Select Product"
															}), /* @__PURE__ */ jsxs("div", {
																className: "relative flex items-center",
																children: [/* @__PURE__ */ jsx(Milk, {
																	className: "pointer-events-none absolute left-20 h-[18px] w-[18px] text-pewter",
																	strokeWidth: 1.8
																}), /* @__PURE__ */ jsx("select", {
																	name: "product",
																	"aria-label": "Product",
																	value: selectedProduct,
																	onChange: (event) => setSelectedProduct(event.target.value),
																	disabled: leadStatus === "submitting",
																	className: "h-[56px] w-full appearance-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70",
																	style: {
																		backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23223E36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
																		backgroundPosition: "right 20px center",
																		backgroundRepeat: "no-repeat",
																		backgroundSize: "16px"
																	},
																	children: siteProducts.map((product) => /* @__PURE__ */ jsx("option", {
																		value: product.value,
																		children: product.name
																	}, product.value))
																}, productOptionsKey)]
															})]
														}), /* @__PURE__ */ jsxs("div", {
															className: "relative flex flex-col",
															children: [/* @__PURE__ */ jsxs("span", {
																className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
																children: [
																	"Daily Quantity (",
																	formatOrderUnitLabel(selectedProductUnit),
																	")"
																]
															}), /* @__PURE__ */ jsxs("div", {
																className: "relative flex items-center",
																children: [
																	/* @__PURE__ */ jsx(Droplets, {
																		className: "absolute left-20 h-[18px] w-[18px] text-pewter",
																		strokeWidth: 1.8
																	}),
																	/* @__PURE__ */ jsx("input", {
																		name: "quantity",
																		type: "number",
																		min: "1",
																		max: "50",
																		step: "1",
																		defaultValue: "1",
																		onFocus: (e) => e.target.select(),
																		"aria-label": "Daily quantity",
																		disabled: leadStatus === "submitting",
																		className: "h-[56px] w-full rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
																	}),
																	/* @__PURE__ */ jsx("span", {
																		className: "pointer-events-none absolute right-16 rounded-full bg-bone/70 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-pewter",
																		children: formatOrderUnitLabel(selectedProductUnit)
																	})
																]
															})]
														})]
													}),
													requestType === "subscription" && /* @__PURE__ */ jsxs("div", {
														className: "relative flex flex-col transition-all duration-300",
														children: [/* @__PURE__ */ jsx("span", {
															className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
															children: "Delivery Plan"
														}), /* @__PURE__ */ jsxs("div", {
															className: "relative flex items-center",
															children: [/* @__PURE__ */ jsx(CalendarDays, {
																className: "pointer-events-none absolute left-20 h-[18px] w-[18px] text-pewter",
																strokeWidth: 1.8
															}), /* @__PURE__ */ jsxs("select", {
																name: "plan",
																"aria-label": "Delivery plan",
																defaultValue: "daily",
																disabled: leadStatus === "submitting",
																className: "h-[56px] w-full appearance-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 text-body text-charcoal transition-all focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70",
																style: {
																	backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23223E36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
																	backgroundPosition: "right 20px center",
																	backgroundRepeat: "no-repeat",
																	backgroundSize: "16px"
																},
																children: [
																	/* @__PURE__ */ jsx("option", {
																		value: "daily",
																		children: "Daily delivery"
																	}),
																	/* @__PURE__ */ jsx("option", {
																		value: "alternate",
																		children: "Alternate-day delivery"
																	}),
																	/* @__PURE__ */ jsx("option", {
																		value: "custom",
																		children: "Custom schedule"
																	})
																]
															})]
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "relative flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "mb-6 pl-4 text-[12px] font-semibold uppercase tracking-wider text-pewter",
															children: "Delivery Notes (Optional)"
														}), /* @__PURE__ */ jsxs("div", {
															className: "relative flex items-center",
															children: [/* @__PURE__ */ jsx(MessageSquare, {
																className: "absolute left-20 top-20 h-[18px] w-[18px] text-pewter",
																strokeWidth: 1.8
															}), /* @__PURE__ */ jsx("textarea", {
																name: "notes",
																"aria-label": "Delivery notes",
																placeholder: "e.g. Please leave at the gate, deliver before 7 AM",
																rows: 3,
																disabled: leadStatus === "submitting",
																className: "w-full resize-none rounded-[14px] border border-moss/45 bg-pure-white pl-50 pr-24 py-16 text-body text-charcoal transition-all placeholder:text-pewter/40 focus:border-forest-ink focus:bg-pure-white focus:outline-none focus:ring-4 focus:ring-forest-ink/8 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-70"
															})]
														})]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "grid gap-12 md:grid-cols-[1fr_auto] md:items-center md:gap-16",
														children: [/* @__PURE__ */ jsx("p", {
															className: "text-[12px] leading-relaxed text-pewter",
															children: "Fresh dairy requests are processed by the team and confirmed on WhatsApp."
														}), /* @__PURE__ */ jsx("button", {
															type: "submit",
															disabled: leadStatus === "submitting",
															className: "relative inline-flex w-full items-center justify-center gap-8 rounded-[14px] bg-forest-ink px-28 py-18 text-body-sm font-semibold uppercase tracking-wider text-pure-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:bg-forest-ink/95 hover:shadow-lg active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 md:w-auto",
															children: leadStatus === "submitting" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { className: "h-16 w-16 animate-spin rounded-full border-2 border-pure-white border-t-transparent" }), "Sending..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: [requestType === "order" ? "Send Order Request" : "Start Subscription", /* @__PURE__ */ jsx(Send, {
																className: "h-[15px] w-[15px]",
																strokeWidth: 2,
																"aria-hidden": "true"
															})] })
														})]
													})
												]
											}),
											leadMessage ? /* @__PURE__ */ jsxs("div", {
												role: leadStatus === "error" ? "alert" : "status",
												className: `mt-10 flex items-start gap-12 rounded-[12px] p-16 text-body-sm leading-relaxed border ${leadStatus === "success" ? "bg-forest-ink/5 border-forest-ink/20 text-forest-ink" : "bg-red-50 border-red-200 text-red-700"}`,
												children: [/* @__PURE__ */ jsx(CheckCircle2, {
													className: `h-20 w-20 shrink-0 mt-2 ${leadStatus === "success" ? "text-forest-ink" : "text-red-600"}`,
													strokeWidth: 2
												}), /* @__PURE__ */ jsx("span", { children: leadMessage })]
											}) : null
										]
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ jsx("footer", {
						className: "bg-forest-ink pt-[110px] pb-64 text-pure-white",
						children: /* @__PURE__ */ jsxs("div", {
							className: "mx-auto max-w-[1200px] px-24",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "mb-40 grid gap-30 border-b border-pure-white/10 pb-40 md:grid-cols-4",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-4",
										children: [/* @__PURE__ */ jsx(Leaf, {
											size: 36,
											className: "shrink-0 text-pure-white",
											style: {
												width: "36px",
												height: "36px"
											},
											strokeWidth: 1.8,
											"aria-hidden": "true"
										}), /* @__PURE__ */ jsx("span", {
											className: "font-reckless text-[36px] font-medium text-pure-white leading-none",
											children: "HasuMane"
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-15 max-w-[24ch] text-[14px] leading-relaxed text-pure-white/80",
										children: "A farmer entrepreneurship initiative building chemical-free dairy and restorative agriculture, one farm at a time."
									})] }),
									/* @__PURE__ */ jsx(FooterColumn, {
										title: "Explore",
										links: [
											"For Farmers",
											"For Consumers",
											"Our Products",
											"Our Story"
										]
									}),
									/* @__PURE__ */ jsx(FooterColumn, {
										title: "Delivery",
										links: [
											"Bengaluru Delivery",
											"Request Details",
											"Subscription Plans"
										]
									}),
									/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsxs("h4", {
											className: "text-caption mb-15 inline-flex items-center uppercase tracking-[0.2em] text-vivid-lime",
											children: [/* @__PURE__ */ jsx(MapPin, {
												className: "mr-8 h-[15px] w-[15px]",
												strokeWidth: 1.8,
												"aria-hidden": "true"
											}), "Visit - The First Field"]
										}),
										/* @__PURE__ */ jsxs("address", {
											className: "not-italic text-[14px] leading-relaxed text-pure-white/85",
											children: [
												"HasuMane - The First Field",
												/* @__PURE__ */ jsx("br", {}),
												"2/282 Jogapalli Village, Marupalli Post",
												/* @__PURE__ */ jsx("br", {}),
												"Denkanikottai Taluk, Krishnagiri District",
												/* @__PURE__ */ jsx("br", {}),
												"Tamil Nadu - 635118"
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "mt-15 flex gap-15 text-caption font-mono",
											children: [
												/* @__PURE__ */ jsxs("a", {
													href: "https://www.instagram.com/hasumane_organics?igsh=cWo4YzJ2eDB0bXow",
													target: "_blank",
													rel: "noopener noreferrer",
													className: "inline-flex items-center transition hover:text-vivid-lime",
													children: [/* @__PURE__ */ jsx(Instagram, {
														className: "mr-6 h-[14px] w-[14px]",
														strokeWidth: 1.8,
														"aria-hidden": "true"
													}), "Instagram"]
												}),
												/* @__PURE__ */ jsxs("a", {
													href: "https://www.linkedin.com/posts/hasumane-organics-70a2ba418_hasumaneorganics-organicfarming-organicdairy-share-7473991161263853569-Ijjx/?utm_source=share&utm_medium=member_ios&rcm=ACoAAGoemnoBVfwW-ngen0It1oUHKdzL-aVUvfE",
													target: "_blank",
													rel: "noopener noreferrer",
													className: "inline-flex items-center transition hover:text-vivid-lime",
													children: [/* @__PURE__ */ jsx(Linkedin, {
														className: "mr-6 h-[14px] w-[14px]",
														strokeWidth: 1.8,
														"aria-hidden": "true"
													}), "LinkedIn"]
												}),
												/* @__PURE__ */ jsxs("a", {
													href: "https://wa.me/919344259815",
													target: "_blank",
													rel: "noopener noreferrer",
													className: "inline-flex items-center transition hover:text-vivid-lime",
													children: [/* @__PURE__ */ jsx(WhatsAppIcon, {
														className: "mr-6 h-[14px] w-[14px]",
														"aria-hidden": "true"
													}), "WhatsApp"]
												})
											]
										})
									] })
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-between gap-15 text-caption text-pure-white/60 sm:flex-row",
								children: [/* @__PURE__ */ jsx("span", { children: "© HasuMane Organics. All rights reserved." }), /* @__PURE__ */ jsx("span", { children: "Halliyinda Nimma Manege - Krishnagiri, IN" })]
							})]
						})
					})
				]
			})
		]
	});
}
function QuiltCard({ eyebrow, title, bgColor, icon, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `${bgColor} group flex min-h-[220px] flex-col justify-start rounded-cards border border-moss/20 p-[30px] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-forest-ink/30 hover:shadow-lg`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-20 flex items-start justify-between gap-20",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-caption font-medium uppercase tracking-wider text-charcoal/70",
					children: eyebrow
				}), /* @__PURE__ */ jsx(IconBadge, {
					icon,
					tone: "soft"
				})]
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-subheading font-light leading-tight text-charcoal",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-10 max-w-[32ch] text-body-sm leading-relaxed text-graphite",
				children
			})
		]
	});
}
function BenefitItem({ icon, title, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "group transition-all duration-300 ease-out hover:translate-x-1",
		children: [
			/* @__PURE__ */ jsx(IconBadge, {
				icon,
				tone: "dark",
				className: "mb-15"
			}),
			/* @__PURE__ */ jsx("h4", {
				className: "mb-10 text-[16px] font-medium tracking-wide text-vivid-lime",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "max-w-[28ch] text-[14px] leading-relaxed text-pure-white/80",
				children
			})
		]
	});
}
function ProductCard({ code, name, desc, bgColor, icon, onSelect }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `${bgColor} group flex min-h-[300px] flex-col rounded-cards border border-moss/20 p-[30px] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-forest-ink/30 hover:shadow-lg`,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-20 flex items-center",
				children: /* @__PURE__ */ jsx(IconBadge, {
					icon,
					tone: "soft"
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-grow",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "mb-8 text-caption font-medium uppercase tracking-[0.16em] text-charcoal/60",
						children: code
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "text-subheading font-light leading-tight text-charcoal transition-colors duration-300 group-hover:text-forest-ink",
						children: name
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-10 text-body-sm leading-relaxed text-graphite",
						children: desc
					})
				]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: onSelect,
				"aria-label": `Request ${name}`,
				className: "mt-20 flex w-full items-center justify-center gap-5 rounded-buttons bg-forest-ink px-5 py-2.5 text-body-sm font-medium text-pure-white transition-all duration-300 hover:scale-[1.02] hover:bg-forest-ink/90 active:scale-[0.98]",
				children: ["Shop Now", /* @__PURE__ */ jsx(ArrowRight, {
					className: "h-[15px] w-[15px] transition-transform duration-300 group-hover:translate-x-1",
					strokeWidth: 1.8,
					"aria-hidden": "true"
				})]
			})
		]
	});
}
function FounderCard({ img, name, role, bio }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "group flex flex-col gap-24 rounded-cards border border-moss bg-pure-white p-24 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-forest-ink/20 hover:shadow-lg sm:flex-row",
		children: [/* @__PURE__ */ jsx("div", {
			className: "zoom-container h-[190px] shrink-0 rounded-cards border border-moss/10 sm:w-[150px]",
			children: /* @__PURE__ */ jsx("img", {
				src: img,
				alt: name,
				className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
				loading: "lazy",
				decoding: "async"
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-col justify-between",
			children: /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("h3", {
					className: "font-reckless text-subheading leading-tight text-charcoal transition-colors duration-300 group-hover:text-forest-ink",
					children: name
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-caption mt-5 uppercase tracking-[0.15em] text-pewter",
					children: role
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-15 text-body-sm leading-relaxed text-graphite",
					children: bio
				})
			] })
		})]
	});
}
function FooterColumn({ title, links }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
		className: "text-caption mb-15 uppercase tracking-[0.2em] text-vivid-lime",
		children: title
	}), /* @__PURE__ */ jsx("ul", {
		className: "space-y-8 text-[14px] text-pure-white/70",
		children: links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
			href: "#story",
			className: "transition hover:text-pure-white",
			children: link
		}) }, link))
	})] });
}
//#endregion
export { Index as component };
