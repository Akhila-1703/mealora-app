import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  ShieldCheck,
  Flame,
  Droplets,
  Heart,
  ChevronRight
} from "lucide-react";

import {
  primaryBtn,
  secondaryBtn,
  groundedSection,
  groundedSectionAlt,
  card,
  subText,
  sectionTitle,
  bodyText
} from "../styles/common";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden bg-[#FAF8F5] font-['Inter']">
      {/* ================= HERO SECTION (FULL SCREEN) ================= */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_bg_new.png" 
            alt="Premium Lunchbox" 
            className="w-full h-full object-cover"
          />
          {/* We want a dark overlay to make text readable, but left-aligned gradient so text pops more */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#F4EEE8]/90 backdrop-blur-sm text-[#C04E2D] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-sm"
            >
              <UtensilsCrossed size={14} /> Bringing Families Together
            </motion.span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1] font-['Fraunces']">
              Warm, comforting <br /> meals <span className="text-[#C04E2D] italic font-serif">delivered</span> <br /> <span className="text-[#C04E2D] italic font-serif">daily.</span>
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-10 max-w-xl font-medium">
              Gather around the table with authentic, home-cooked dishes crafted with love. Nourishing your daily life with the taste of home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => navigate("/register")}
                className={`${primaryBtn} text-lg px-10 py-4 rounded-full group bg-[#C04E2D] hover:bg-[#A34226] text-white border-none`}
              >
                Start Your Journey
              </button>
              <button
                onClick={() => navigate("/menu")}
                className="bg-white text-[#332520] px-10 py-4 rounded-full text-lg font-bold hover:bg-[#F4EEE8] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Weekly Menu
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[#F4EEE8] border-2 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm font-medium">Joined by <span className="text-white font-bold">10,000+</span> neighbors</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= ABOUT US SECTION ================= */}
      <section id="about" className={`${groundedSection} bg-[#FAF8F5]`}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-[#C04E2D]/5 rounded-[40px] blur-3xl -z-10" />
              <img 
                src="/about-prep.png" 
                alt="Food Preparation" 
                className="rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative z-10 w-full object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-3xl shadow-2xl z-20 hidden xl:block border border-[#E6E4DF]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-[#F4EEE8] border-2 border-white overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-[#332520]">5000+ Happy Users</p>
                </div>
                <p className={`text-5xl font-black text-[#C04E2D] mb-1 tracking-tighter font-['Fraunces']`}>100%</p>
                <p className="text-xs font-black text-[#827873] uppercase tracking-widest">Home Cooked Promise</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={subText}>Our Philosophy</span>
              <h2 className={`${sectionTitle} leading-tight mb-8`}>Crafting Healthy <br /><span className="text-[#C04E2D]">Traditions</span> for Busy Lives</h2>
              <p className={`${bodyText} mb-6 text-[18px] italic`}>
                "Food is not just sustenance; it is the feeling of home, comfort, and care wrapped in a single meal."
              </p>
              <p className={`${bodyText} mb-6 text-[16px]`}>
                MealOra was born from a simple observation: the modern professional 
                deserves the warmth of home, even at the office. We saw a world of 
                heavy restaurant meals and fast-food shortcuts, and we chose a different path. 
                Our approach blends centuries-old cooking techniques with modern nutritional science to keep you energized.
              </p>
              <p className={`${bodyText} mb-12 text-[16px]`}>
                We empower home chefs to share their culinary heritage. Every meal 
                is a story of organic ingredients, precise hygiene, and the 
                unmistakable taste of care. By partnering directly with local farmers, we ensure every bite is as fresh as it gets.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F4EEE8] flex items-center justify-center flex-shrink-0 text-[#C04E2D] shadow-sm">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <p className="font-black text-[#332520] uppercase text-xs tracking-widest mb-1 font-['Inter']">Organic</p>
                    <p className="text-[#827873] text-sm font-medium">Sourced from local farms daily.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F4EEE8] flex items-center justify-center flex-shrink-0 text-[#C04E2D] shadow-sm">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <p className="font-black text-[#332520] uppercase text-xs tracking-widest mb-1 font-['Inter']">Authentic</p>
                    <p className="text-[#827873] text-sm font-medium">Traditional recipes, zero MSG.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OUR PROMISE TO YOU ================= */}
      <section className={`${groundedSection} bg-[#FAF8F5]`}>
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-[#332520] mb-4 font-['Fraunces']">Our Promise to You</h2>
            <p className="text-[#827873] text-lg">
              Simple steps to bring wholesome, honest food to your table, backed by our commitment to quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="text-[#C04E2D]" size={28} />,
                title: "Timely Delivery",
                desc: "Hot, fresh meals arrive predictably, fitting seamlessly into your family's daily rhythm."
              },
              {
                icon: <ShieldCheck className="text-[#C04E2D]" size={28} />,
                title: "Purity Guaranteed",
                desc: "Sourced from trusted local grocers, free from artificial additives or preservatives."
              },
              {
                icon: <UtensilsCrossed className="text-[#C04E2D]" size={28} />,
                title: "Varied Menu",
                desc: "A rotating selection of comforting classics ensuring you never tire of the everyday."
              },
              {
                icon: <Droplets className="text-[#C04E2D]" size={28} />, // or Sparkles
                title: "Hygiene First",
                desc: "Prepared in spotless environments adhering to the highest domestic safety standards."
              }
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[32px] p-8 border border-[#E6E4DF] shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-[#F4EEE8] flex items-center justify-center mb-6">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-[#332520] mb-4 font-['Fraunces']">{p.title}</h3>
                <p className="text-[#827873] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className={`${groundedSectionAlt} bg-white rounded-[60px] mx-4 lg:mx-12 my-12 shadow-sm border border-[#E6E4DF]`}>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-[#332520] font-['Fraunces']">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-[#E6E4DF] -z-10" />

            {[
              { num: "1", title: "Recharge Wallet", desc: "Simple, secure top-ups." },
              { num: "2", title: "Subscribe", desc: "Set your family's schedule." },
              { num: "3", title: "Deliver", desc: "Enjoy fresh meals together." },
              { num: "4", title: "Skip Anytime", desc: "Flexible for life's changes." }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-[#F4EEE8] flex items-center justify-center text-2xl font-black text-[#C04E2D] mb-6 shadow-sm border-4 border-white font-['Fraunces']">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-[#332520] mb-2">{step.title}</h3>
                <p className="text-[#827873] text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className={groundedSection}>

        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <span className={subText}>Got Questions?</span>
            <h2 className={sectionTitle}>Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Do you offer subscription plans?",
                a: "We follow a wallet-based system instead of fixed subscriptions. Add money to your wallet, try 2 meals first, and experience the quality before committing to a longer meal plan."
              },
              {
                q: "What if I need to skip a meal?",
                a: "No problem. Our wallet system allows you to pause your subscription or skip a specific meal via the dashboard. The amount stays securely in your wallet for future use."
              },
              {
                q: "How do you maintain hygiene and freshness?",
                a: "We partner strictly with FSSAI-certified home chefs. Meals are prepared daily using fresh, locally sourced ingredients and packed in sanitized, food-grade containers."
              },
              {
                q: "What time are the meals delivered?",
                a: "Lunch is typically delivered between 12:30 PM and 1:30 PM ensuring your food arrives hot and ready to eat."
              }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[14px] p-6 border border-[#E6E4DF] shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#332520] mb-2 flex items-center gap-2 font-['Fraunces']">
                  <span className="text-[#C04E2D]">Q.</span> {faq.q}
                </h3>
                <p className="text-[#827873] ml-6 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <section className={`${groundedSection} bg-[#FAF8F5]`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] p-12 md:p-16 border border-[#E6E4DF] shadow-sm relative flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="absolute top-8 left-8 text-[#F4EEE8] font-serif text-8xl leading-none font-black select-none z-0">"</div>
            
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-8 border-[#FAF8F5] shrink-0 z-10 shadow-lg">
              <img src="https://i.pravatar.cc/300?img=47" alt="Priya" className="w-full h-full object-cover" />
            </div>

            <div className="z-10 text-center md:text-left">
              <p className="text-xl md:text-2xl text-[#332520] leading-relaxed mb-8 font-serif">
                "As a <span className="font-bold">busy parent</span>, managing <span className="font-bold">daily</span> meals was overwhelming. MealOra changed that. The food tastes just like it came from my own kitchen—warm, <span className="font-bold">honest, and</span> comforting. It <span className="font-bold">brings</span> our family together."
              </p>
              <div>
                <p className="font-bold text-[#C04E2D] mb-1">Priya Sharma</p>
                <p className="text-sm text-[#827873]">Mother & Daily Subscriber</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;