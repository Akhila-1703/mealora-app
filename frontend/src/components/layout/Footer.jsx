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
    <footer id="contact" className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-1">
            <div className="text-3xl font-black mb-6 tracking-tighter">
              <span className="text-green-800">Meal</span>
              <span className="text-orange-500">Flow</span>
            </div>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-xs">
              Bringing the warmth of home-cooked meals to the modern workspace. Authentic,
              organic, and delivered with care.
            </p>
            <div className="flex gap-4">
              {/* Placeholder Social Icons */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-700 hover:border-green-700 transition-all cursor-pointer"
                >
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-8">Navigation</h4>
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
                      e.preventDefault();
                      handleNav(item.to);
                    }}
                    className="text-slate-500 hover:text-green-700 font-medium transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Support */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-8">Support</h4>
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
                    className="text-slate-500 hover:text-green-700 font-medium transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-8">Contact Us</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 flex-shrink-0">
                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Office</p>
                  <p className="text-slate-600 text-sm font-medium">123 Tech Park, Financial District, Hyderabad</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-slate-600 text-sm font-medium">hello@mealflow.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} MealFlow Inc. Made with ❤️ for foodies.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">FSSAI Certified</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hygienic Prep</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

