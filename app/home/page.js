"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-white flex flex-col">
      {/* Background Image */}
      <Image
        src="/images/home.jpg"
        alt="Luxury Interior"
        fill
        style={{ objectFit: "cover" }}
        className="-z-10 opacity-100"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 -z-10" />

      {/* Logo */}
      <div className="absolute top-10 left-4 text-white text-xl font-bold flex items-center gap-2 opacity-70 z-20">
        <span className="text-2xl">&#127969;</span>
        BRICK DEVELOPMENTS
      </div>

      {/* Sign Up Button */}
      <div className="absolute top-5 right-40 z-20">
        <Button className="bg-[#8b6f47]/60 hover:bg-[#8b6f47] cursor-pointer text-white text-lg px-8 py-6 rounded-3xl shadow-lg">
          Sign Up
        </Button>
      </div>

      {/* Navbar */}
      <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-[#8b6f47]/60 transition-colors duration-100 hover:bg-[#8b6f47] rounded-full px-15 py-3 flex gap-6 items-center z-10 shadow-lg">
        <ul className="flex gap-50">
          <li className="hover:underline cursor-pointer">Home</li>

          {/* "About" with dropdown */}
          <li className="relative cursor-pointer hover:underline">
            <span
              onClick={() => setAboutOpen(!aboutOpen)}
              className="flex items-center"
            >
              About
              {aboutOpen ? (
                <svg
                  className="inline-block w-5 h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="inline-block w-5 h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </span>
            <ul
              className={`absolute left-0 top-full mt-4 w-40 bg-[#8b6f47]/90 rounded-lg shadow-lg py-2 z-50 ${
                aboutOpen ? "block" : "hidden"
              }`}
            >
              <li
                onClick={(e) => e.stopPropagation()}
                className="block w-full px-4 py-2 hover:underline cursor-pointer"
              >
                Contact
              </li>
              <li
                onClick={(e) => e.stopPropagation()}
                className="block w-full px-4 py-2 hover:underline cursor-pointer"
              >
                Testimonials
              </li>
              <li
                onClick={(e) => e.stopPropagation()}
                className="block w-full px-4 py-2 hover:underline cursor-pointer"
              >
                Community
              </li>
            </ul>
          </li>

          {/* "Properties" with dropdown */}
          <li className="relative cursor-pointer hover:underline">
            <span
              onClick={() => setPropertiesOpen(!propertiesOpen)}
              className="flex items-center"
            >
              Properties
              {propertiesOpen ? (
                <svg
                  className="inline-block w-5 h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="inline-block w-5 h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </span>
            <ul
              className={`absolute left-0 top-full mt-4 w-54 bg-[#8b6f47]/90 rounded-lg shadow-lg py-2 z-50 ${
                propertiesOpen ? "block" : "hidden"
              }`}
            >
              <li
                onClick={(e) => e.stopPropagation()}
                className="block w-full text-center px-10 py-1 hover:underline cursor-pointer"
              >
                Upcoming Projects
              </li>
            </ul>
          </li>

          <li className="hover:underline cursor-pointer">Career Opportunity</li>
        </ul>
      </nav>

      {/* Main */}
      <div className="flex-grow flex flex-col items-center justify-center text-center mt-24 z-10">
        <h1 className="text-5xl font-bold mt-10">
          <span className="font-bold">Brick</span>{" "}
          <span className="font-light">Developments</span>
        </h1>
        <p className="text-[#c4a47c] mt-10 text-3xl">
          Turning Your Vision Of The Perfect Home
        </p>

        {/* Search Bar */}
        <div className="relative mt-10 w-1/2 max-w-md">
          <input
            type="text"
            placeholder="Search property by Location or Postal code..."
            className="w-full bg-black/50 rounded-full py-3 px-5 pr-12 text-white placeholder-gray-600 focus:outline-none"
          />
          <svg
            className="absolute right-4 top-3 text-grey-900 w-6 h-6 pointer-events-none"
            fill="Grey"
            viewBox="0 0 24 24"
          >
            <path d="M11 4a7 7 0 015.196 11.78l4.257 4.255-1.414 1.415-4.255-4.257A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
        </div>

        <div className="mt-20">
          <Button className="bg-[#8b6f47]/50 hover:bg-[#8b6f47] cursor-pointer text-white text-lg px-8 py-6 rounded-lg shadow-lg">
            View Listings
          </Button>
        </div>
      </div>
    </div>
  );
}
