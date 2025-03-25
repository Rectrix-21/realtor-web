"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Authenticate() {
  const [tab, setTab] = useState("signup");

  return (
    <div className="relative min-h-screen text-white flex flex-col">
      {/* Background Image */}
      <Image
        src="/images/sign-up.jpg"
        alt="Luxury Interior"
        fill
        style={{ objectFit: "cover" }}
        className="-z-10 opacity-100"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="bg-[#8b6f47]/80 p-8 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold">Welcome to Brick Developments</h1>

          {/* Authentication Tabs */}
          <div className="flex justify-center mt-5 space-x-4 ">
            <button
              onClick={() => setTab("signup")}
              className={`py-2 px-4 rounded-lg hover:bg-[#8b6f47] cursor-pointer transition-colors duration-100 ${
                tab === "signup" ? "bg-[#8b6f47] " : "bg-black/40"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setTab("login")}
              className={`py-2 px-4 rounded-lg hover:bg-[#8b6f47] cursor-pointer transition-colors duration-100 ${
                tab === "login" ? "bg-[#8b6f47]" : "bg-black/40"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`py-2 px-4 rounded-lg hover:bg-[#8b6f47] cursor-pointer transition-colors duration-100 ${
                tab === "admin" ? "bg-[#8b6f47]" : "bg-black/40"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Forms */}
          {tab === "signup" && (
            <div className="mt-5">
              <input
                type="text"
                placeholder="Username"
                className="input-field"
              />
              <input type="email" placeholder="Email" className="input-field" />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <Button className="mt-4 bg-[#8b6f47]/80 hover:bg-[#8b6f47] cursor-pointer">
                Sign Up
              </Button>
            </div>
          )}

          {tab === "login" && (
            <div className="mt-5">
              <input type="email" placeholder="Email" className="input-field" />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <Button className="mt-4 bg-[#8b6f47]/80 hover:bg-[#8b6f47] cursor-pointer">
                Log In
              </Button>
            </div>
          )}

          {tab === "admin" && (
            <div className="mt-5">
              <input
                type="text"
                placeholder="Admin ID"
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <Button className="mt-4 bg-[#8b6f47]/80 hover:bg-[#8b6f47] cursor-pointer">
                Admin Login
              </Button>
            </div>
          )}

          {/* Back to Home */}
          <Link href="/" className="mt-4 inline-block text-sm underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
