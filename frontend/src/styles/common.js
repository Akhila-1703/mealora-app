/*
MEALORA PREMIUM DESIGN SYSTEM
Lovable Aesthetic UI tokens
*/

// Colors
export const brandPrimary = "#C04E2D"; // Terracotta rust
export const brandBackground = "#FAF8F5"; // Warm cream
export const brandForeground = "#332520"; // Charcoal
export const brandSecondary = "#F4EEE8"; // Soft beige
export const brandBorder = "#E6E4DF";

// Legacy Colors mapping for safety (so we don't break untested components)
export const greenHex = brandPrimary;
export const orangeHex = brandPrimary;
export const slateHex = brandForeground;
export const goldHex = brandSecondary;

export const brandGreen = "text-[#C04E2D]"; 
export const brandOrange = "text-[#C04E2D]";
export const brandGreenBg = "bg-[#C04E2D]";
export const brandOrangeBg = "bg-[#C04E2D]";
export const brandGoldText = "text-[#C04E2D]";

// Layout
export const pageBg = "bg-[#FAF8F5] min-h-screen text-[#332520] font-['Inter']";
export const container = "max-w-7xl mx-auto px-6 py-12";
export const section = "mb-12";
export const groundedSection = "py-20 md:py-32 bg-[#FAF8F5]";
export const groundedSectionAlt = "py-20 md:py-32 bg-white";
export const heroGradient = "absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent max-md:bg-gradient-to-b max-md:from-black/70 max-md:to-black/50";

// Components
export const glassCard = "backdrop-blur-xl bg-white/95 border border-[#E6E4DF] shadow-sm rounded-[14px]";
export const glassNav = "backdrop-blur-md bg-[#FAF8F5]/90 border-b border-[#E6E4DF] sticky top-0 z-50 transition-all duration-300";
export const card = "bg-white border border-[#E6E4DF] shadow-sm rounded-[14px] p-6 transition-all duration-300 hover:shadow-md";
export const bentoGrid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(160px,auto)] gap-8";
export const bentoItem = `${card} flex flex-col justify-between`;

// Typography
export const pageTitle = "text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter']";
export const sectionTitle = "text-[18px] md:text-[22px] font-bold text-[#332520] tracking-tight mb-6 font-['Inter']";
export const heading = "text-[16px] font-bold text-[#332520] mb-4 font-['Inter']";
export const bodyText = "text-[#827873] leading-relaxed text-[16px] font-['Inter']";
export const subText = "text-[12px] text-[#827873] font-semibold uppercase tracking-widest mb-3 block font-['Inter']";

// Buttons
export const primaryBtn = "bg-[#C04E2D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C04E2D]/90 shadow-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";
export const secondaryBtn = "bg-white text-[#332520] border border-[#E6E4DF] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F4EEE8] hover:text-[#332520] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";
export const accentBtn = primaryBtn;
export const outlineBtn = secondaryBtn;

// Forms
export const input = "w-full bg-white border border-[#E6E4DF] rounded-[14px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all duration-200";
export const label = "text-xs font-bold tracking-wide text-[#332520] mb-2 block ml-1 font-['Inter']";
export const formGroup = "mb-6";

// Navigation
export const navWrapper = "px-6 py-4";
export const navBrand = "text-2xl font-bold flex items-center gap-2 tracking-tighter text-[#332520] font-['Inter']";

// Sidebar
export const sidebar = "w-full lg:w-64 bg-[#FCFBF9] border-b lg:border-b-0 lg:border-r border-[#E6E4DF] p-4 lg:p-6 flex flex-row lg:flex-col justify-between items-center lg:items-stretch gap-4 sticky top-[73px] lg:h-[calc(100vh-73px)] overflow-x-auto lg:overflow-y-auto z-40";
export const sidebarItem = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#827873] hover:bg-[#F4EEE8] hover:text-[#332520] transition-all font-medium text-sm whitespace-nowrap";
export const sidebarItemActive = "flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#C04E2D] text-white font-semibold shadow-sm text-sm whitespace-nowrap";

// Layout
export const layoutWrapper = "flex flex-col lg:flex-row min-h-screen bg-[#FAF8F5] font-['Inter']";
export const contentArea = "flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-x-hidden text-[#332520]";

// Badges
export const badge = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest";
export const successBadge = `${badge} bg-emerald-100 text-emerald-700`;
export const warningBadge = `${badge} bg-[#F4EEE8] text-[#C04E2D] border border-[#E6E4DF]`;
export const dangerBadge = `${badge} bg-red-100 text-red-700`;

// Dashboard & Stats
export const statLabel = "text-[12px] font-bold uppercase tracking-widest text-[#827873] mb-1 font-['Inter']";
export const statValue = "text-[32px] font-black text-[#332520] tracking-tight font-['Inter']";
export const statCard = `${card} flex flex-col justify-between`;
export const highlightCard = "bg-[#C04E2D] text-white rounded-[14px] p-8 shadow-md relative overflow-hidden";

// Typography Extras
export const mutedText = "text-[#827873] text-[15px] leading-relaxed font-['Inter']";

// Compatibility Aliases
export const pageWrapper = container;
export const pageTitleClass = pageTitle;
export const inputClass = input;
export const cardClass = card;
export const navBrandClass = navBrand;
export const navContainerClass = "flex items-center justify-between";
export const navLinkClass = "flex gap-10 text-sm font-semibold text-[#827873] hover:text-[#332520] transition-colors";
export const statNumber = statValue;
