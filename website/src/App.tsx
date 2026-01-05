import { useState } from "react";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#1a1a1a" : "#ffffff",
        color: darkMode ? "#ffffff" : "#1a1a1a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: `1px solid ${darkMode ? "#333" : "#e5e5e5"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="32" height="32" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="#0066cc" />
            <text
              x="50"
              y="65"
              fontSize="50"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
            >
              O
            </text>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "1.25rem" }}>
            @oxog/docs
          </span>
        </div>
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#guide" style={{ color: "inherit", textDecoration: "none" }}>
            Guide
          </a>
          <a href="#api" style={{ color: "inherit", textDecoration: "none" }}>
            API
          </a>
          <a
            href="#examples"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Examples
          </a>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "8px",
              color: darkMode ? "#fff" : "#1a1a1a",
              backgroundColor: darkMode ? "#333" : "#f5f5f5",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: "6rem 2rem",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "1rem" }}>
          Framework-Agnostic Documentation Generator
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
          Zero-config, plugin-first documentation that works with any framework.
          React, Vue, Svelte, Solid, or Vanilla - you choose.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a
            href="#getting-started"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0066cc",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Get Started
          </a>
          <a
            href="https://github.com/ersinkoc/docs"
            style={{
              padding: "0.75rem 1.5rem",
              border: `1px solid ${darkMode ? "#333" : "#e5e5e5"}`,
              borderRadius: "8px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "4rem 2rem",
          background: darkMode ? "#222" : "#f8f9fa",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              title: "Zero-Config",
              desc: "Works out of the box with sensible defaults",
            },
            {
              title: "Framework Agnostic",
              desc: "React, Vue, Svelte, Solid, or Vanilla",
            },
            {
              title: "Plugin System",
              desc: "Extend functionality without core bloat",
            },
            {
              title: "LLM Native",
              desc: "Optimized for AI assistants and humans",
            },
            { title: "TypeScript", desc: "Full type safety out of the box" },
            {
              title: "100% Test Coverage",
              desc: "Every line tested, guaranteed quality",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                padding: "1.5rem",
                background: darkMode ? "#1a1a1a" : "#ffffff",
                borderRadius: "12px",
                border: `1px solid ${darkMode ? "#333" : "#e5e5e5"}`,
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem" }}>{feature.title}</h3>
              <p style={{ margin: 0, color: "#666" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Simple to Use
          </h2>
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "12px",
              padding: "1.5rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#febc2e",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#28c840",
                }}
              />
            </div>
            <pre
              style={{
                margin: 0,
                color: "#f8f8f2",
                fontSize: "0.875rem",
                lineHeight: 1.7,
              }}
            >
              {`// Create docs.config.ts
import { defineConfig } from '@oxog/docs'
import react from '@oxog/docs-react'

export default defineConfig({
  title: 'My Docs',
  adapter: react()
})

// Run CLI
npx @oxog/docs dev`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem",
          borderTop: `1px solid ${darkMode ? "#333" : "#e5e5e5"}`,
          textAlign: "center",
          color: "#666",
        }}
      >
        <p style={{ margin: 0 }}>Made with ❤️ by Ersin KOÇ</p>
      </footer>
    </div>
  );
}
