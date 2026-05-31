import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    // Internal section scroll support
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      if (window.location.pathname !== "/") {
        navigate("/" + path);
        return;
      }
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate(path);
  };

  return (
    <footer id="contact" className="bg-[#FAF8F5] pt-24 pb-12 border-t border-[#E6E4DF] font-['Inter']">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.png" alt="MealOra" className="h-8 object-contain" />
              <span className="text-3xl font-black font-['Inter'] text-[#332520]">MealOra</span>
            </div>
            <p className="text-[#827873] leading-relaxed mb-8 max-w-xs text-[15px]">
              Bringing the warmth of home-cooked meals to the modern workspace. Authentic,
              organic, and delivered with care.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl bg-white border border-[#E6E4DF] flex items-center justify-center text-[#827873] hover:text-[#C04E2D] hover:border-[#C04E2D] transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#332520] mb-8 font-['Inter']">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", to: "/" },
                { label: "About Us", to: "/#about" },
                { label: "How it Works", to: "/#how-it-works" },
                { label: "Explore Menu", to: "/menu" },
                { label: "Subscription Plans", to: "/#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    onClick={(e) => {
                      // preventing default browser behavior to handle the submission seamlessly within the virtual dom
                      e.preventDefault();
                      handleNav(item.to);
                    }}
                    className="text-[#827873] hover:text-[#C04E2D] font-medium transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Support */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#332520] mb-8 font-['Inter']">Support</h4>
            <ul className="space-y-4">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Refund Policy",
                "AI Support",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[#827873] hover:text-[#C04E2D] font-medium transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#332520] mb-8 font-['Inter']">Contact Us</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4EEE8] flex items-center justify-center text-[#C04E2D] flex-shrink-0">
                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#827873] uppercase tracking-widest mb-1">Office</p>
                  <p className="text-[#332520] text-sm font-medium">123 Tech Park, Financial District, Hyderabad</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4EEE8] flex items-center justify-center text-[#C04E2D] flex-shrink-0">
                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#827873] uppercase tracking-widest mb-1">Email</p>
                  <p className="text-[#332520] text-sm font-medium">hello@mealora.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-[#E6E4DF] mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#827873] text-sm">
            © {new Date().getFullYear()} MealOra Inc. Made with ❤️ for foodies.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">FSSAI Certified</span>
            <span className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">Hygienic Prep</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

