"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/content/vi";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 16);
    const resize = () => { if (window.innerWidth > 1000) setOpen(false); };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("scroll", scroll); window.removeEventListener("resize", resize); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", close); window.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header ref={header} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="container header-inner">
      <Link href="/" className="wordmark" aria-label="QAVIO — Trang chủ">QAVIO<span className="brand-dot" /></Link>
      <nav aria-label="Điều hướng chính" id="main-navigation" className={open ? "navigation is-open" : "navigation"}>
        {navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link href="/request-demo" className="button button-small" onClick={() => setOpen(false)}>Đăng ký tư vấn <ArrowUpRight size={16} /></Link>
      </nav>
      <button ref={menuButton} type="button" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "Đóng menu" : "Mở menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>;
}
