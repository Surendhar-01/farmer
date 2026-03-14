"use client";

import { useLanguage } from "./LanguageProvider";
import { Mic, Tractor, Building, Sprout, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "dashboard", icon: Sprout },
    { href: "/search", label: "search_crops", icon: Search },
    { href: "/transport", label: "transport", icon: Tractor },
    { href: "/storage", label: "cold_storage", icon: Building },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-xl flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? "text-green-600 font-bold" : "text-gray-500 hover:text-green-500"
            }`}
          >
            <Icon size={24} className={isActive ? "fill-green-100" : ""} />
            <span className="text-[10px]">{t(item.label)}</span>
          </Link>
        );
      })}
    </div>
  );
};
