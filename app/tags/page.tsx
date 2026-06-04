"use client";

import { useState } from "react";
import Link from "next/link";
import "./tags.css";
import "../gamePage.css";

const TAG_LIST = [
  // 🔹 CONTENT TYPE
  "video", "videos", "pics", "images", "collection",
  "full", "hd", "latest", "new", "ppv",

  // 🔹 PLATFORM / SOURCE
  "onlyfans", "leak", "leaked", "of",

  // 🔹 FORMAT / STYLE
  "pov", "vlog", "amateur", "homemade",
  "public", "solo", "couple", "threesome",
  "mmf", "ffm", "lesbian",

  // 🔹 ACTIONS (core)
  "blowjob", "bj", "deepthroat",
  "anal", "creampie", "cumshot",
  "fingering", "fucking",
  "dildo", "dildo play",
  "vibrator", "vibrator play",
  "squirt", "squirting",
  "footjob", "handjob",

  // 🔹 BODY FOCUS
  "boobs", "big boobs", "boobjob",
  "ass", "ass tease", "ass show",
  "pussy", "pussy closeup",
  "nipples", "nude", "nudes",

  // 🔹 THEMES / SCENES
  "strip", "striptease", "stripping",
  "tease", "teasing",
  "cosplay", "nurse",
  "shower", "bathroom", "beach",
  "hiking",

  // 🔹 FETISH / NICHE (from JSON)
  "bbc", "feet", "joI", "strapon",
  "toys", "milk", "oil",
  "bouncing boobs",

  // 🔹 RELATION TYPES
  "milf", "teen", "young", "college",

  // 🔹 MOOD / STYLE
  "hardcore", "romantic",
  "intense", "wild",

  // 🔹 EXTRA DERIVED (important from your data)
  "boobs show", "pussy show",
  "ass fingering", "anal joi",
  "xxx", "sex","pee","compilation"
];

export default function TagsPage() {
  const [search, setSearch] = useState("");

  const filteredTags = TAG_LIST.filter(tag =>
    tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tags-page">
      {/* HEADER */}
      <div className="tags-header">
        <h1 className="tags-title">Explore Tags</h1>

        <input
          type="text"
          placeholder="Search tags..."
          className="tags-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TAG GRID */}
      <div className="tags-grid">
        {filteredTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="tag-item"
          >
            {tag}
          </Link>
        ))}
      </div>
            <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <img
              src="https://ads.storeflz.com/icon.png"
              alt="Brand Logo"
              className="footer-logo"
            />
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="terms">Terms of Service</a>
              </li>
              <li>
                <a href="privacy-policy">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">
              <a
                href="https://lustiie.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lustiie
              </a>
            </h4>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; 2026 Lustiie.com All rights reserved.
        </div>
      </footer>
    </div>
  );
}