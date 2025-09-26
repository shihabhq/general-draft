"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",

      active: pathname === "/",
    },
    {
      href: "/history",
      label: "History",

      active: pathname === "/history",
    },
    {
      href: "/scorecard",
      label: "Scorecard",

      active: pathname === "/scorecard",
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-22">
          <div className="">
            <Link href={"/"}>
              <img src="/logo.png" className="h-22" alt="" />
            </Link>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                    item.active
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
