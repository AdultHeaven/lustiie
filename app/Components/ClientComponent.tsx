"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faBell,
  faUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "../headerNew.css";

const navLinks = [
    { label: "Videos", href: "/video" },
 
        { label: "Tags", href: "/tags" },
      { label: "Search", href: "/search" },
      // { label: "Rules", href: "/rules" },
        {
    label: "🎁 Best Offers",
    href: "/best-offers",external: true
  },   
];



export default function Header() {

   const [value, setValue] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  function goToSearch() {
    if (!value.trim()) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      goToSearch();
    }
  }
  return (
    <header className="header">
      {/* ================= DESKTOP ================= */}
      <div className="desktop-header">
        <div className="header-inner">
          <div className="header-left">
            <Link href="/" className="logo">
              <img
                src="https://ads.storeflz.com/icon.png"
                alt="Logo"
              />
            </Link>

          <nav className="nav-links1">
  {navLinks.map((n) =>
    n.external ? (
      <a
        key={n.href}
        href={n.href}
        target="_blank"
        rel="nofollow"
        className={n.label === "Live" ? "live-link" : ""}
      >
        {n.label}
      </a>
    ) : (
      <Link
        key={n.href}
        href={n.href}
        className={`
          ${pathname === n.href ? "active" : ""}
          ${n.label === "Live" ? "live-link" : ""}
        `}
      >
        {n.label}
      </Link>
    )
  )}
</nav>
          </div>


  <div className="header-search">
      <span className="icon-fixed">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>

      <input
        placeholder="Search models, videos, tags..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && goToSearch()}
      />

      {value.trim() && (
        <button
          className="header-search-btn"
          onClick={goToSearch}
        >
          Search
        </button>
      )}
    </div>
          <div className="header-right">
          </div>
        </div>
      </div>


      {/* ================= MOBILE ================= */}
<div className="mobile-header">
  <div className="header-inner mobile-top">
    <Link href="/" className="logoMobText">
      lustiie.com
    </Link>

    <div className="header-right">
<Link
  href="https://t.vlmai-1.com/384478/9022/37136?aff_sub5=SF_006OG000004lmDN"
  className="mobile-live-btn"
    prefetch={false}
      target="_blank"
  rel="noopener noreferrer"
  >

  <span className="live-text">
    CREATE AI GF
  </span>

  <span className="live-count">
    TRY NOW
  </span>
</Link>


      <div className="mobile-menu-wrapper">
        <button
          className="icon-btn mobile-icon-btn"
          onClick={() => setMenuOpen(v => !v)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        {menuOpen && (
          <>

            <div
  className="mobile-menu-backdrop"
  onClick={() => setMenuOpen(false)}
/>

<div className="mobile-dropdown">
  {navLinks.map((n) =>
    n.external ? (
      <a
        key={n.href}
        href={n.href}
        target="_blank"
        rel="nofollow"
        className={n.label === "Live" ? "live-link" : ""}
        onClick={() => setMenuOpen(false)}
      >
        {n.label}
      </a>
    ) : (
      <Link
        key={n.href}
        href={n.href}
        className={`
          ${pathname === n.href ? "active" : ""}
          ${n.label === "Live" ? "live-link" : ""}
        `}
        onClick={() => setMenuOpen(false)}
      >
        {n.label}
      </Link>
    )
  )}

  <div className="mobile-dropdown-separator" />

</div>
          </>
        )}
      </div>
    </div>
  </div>

  <div className="mobile-search">
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="mobile-search-icon"
    />

    <input
      placeholder="Search models, videos, tags..."
      aria-label="Search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
    />

    {value.trim().length > 0 && (
      <button
        className="mobile-search-btn"
        onClick={goToSearch}
      >
        Search
      </button>
    )}
  </div>
</div>


    </header>
  );
}
