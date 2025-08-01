"use client";

import Link from "next/link";
import Image from "next/image";
import "./styles.css";

export default function Contact() {
  return (
    <div className="contact-page-container">
      {/* Navbar */}
      <div className="logo-bar">
        <span className="home-icon">&#127969;</span>
        <div className="logo-text">
          <span className="logo-main">HAVENLY</span>
        </div>
      </div>
      <nav className="navbar">
        <ul className="navbar-ul">
          <li className="navbar-li">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar-li">
            <Link href="/contact">About</Link>
          </li>
          <li className="navbar-li">
            <Link href="/view-listings">Properties</Link>
          </li>
          <li className="navbar-li">
            <Link href="/careers">Career opportunity</Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <Image
          src="/images/about/1.png"
          alt="About Us Hero"
          fill
          style={{ objectFit: "cover" }}
          className="hero-bg"
        />
        <div className="hero-overlay"></div>
        <h1 className="hero-title">ABOUT US</h1>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-box">
          <h1 className="mission-title">OUR MISSION</h1>
          <p className="mission-desc">
            Bricks Development isn’t just a real estate company — it’s a
            family-owned venture rooted in community values, driven by a vision
            to redefine urban living through thoughtful design and enduring
            quality. With decades of collective experience, our team brings
            every project to life with precision, passion, and a deep respect
            for timeless architectural principles. We collaborate with trusted
            partners and suppliers to ensure exceptional craftsmanship and
            meaningful value, while our unwavering commitment to customer
            satisfaction extends far beyond project completion. At Bricks
            Development, we don’t just build properties — we create spaces where
            people truly feel at home.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="projects-content">
          <div className="projects-icon">
            <Image
              src="/images/about/grass.png"
              alt="Projects Icon"
              width={48}
              height={48}
            />
          </div>
          <div className="projects-desc">
            Heavenly is a client-focused real estate company offering active and
            upcoming listings across Calgary, Alberta. We are dedicated to
            understanding and meeting the unique needs of every client. Our
            listings are meticulously curated with strong emphasis on quality
            and presentation.
            <br />
            <br />
            At Heavenly, attention to detail is at the heart of everything we
            do.
          </div>
          <Link href="/projects">
            <button className="projects-btn">PROJECTS</button>
          </Link>
        </div>
        <div className="projects-gallery">
          <div className="gallery-img-wrapper">
            <Image
              src="/images/about/3.png"
              alt="Project 1"
              width={140}
              height={140}
              className="gallery-img"
            />
          </div>
          <div className="gallery-img-wrapper">
            <Image
              src="/images/about/4.png"
              alt="Project 2"
              width={140}
              height={140}
              className="gallery-img"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-box">
          <h2 className="team-title">GET TO KNOW US</h2>
          <div className="team-members">
            <div className="team-member">
              <div className="member-photo">
                <Image
                  src="/images/about/zayan.png"
                  alt="Zayan Mansour"
                  width={120}
                  height={120}
                  className="member-img"
                />
              </div>
              <div className="member-info">
                <div className="member-name">Zayan Mansour</div>
                <div className="member-role">CEO</div>
                <div className="member-desc">
                  Zayan Mansour guides the company’s vision for
                  community-focused, well-designed living spaces. With a strong
                  background in real estate and construction, he ensures every
                  project reflects quality and integrity.
                </div>
                <div className="member-contact">
                  <span>+1 403-714-0954</span>
                  <span>zayan.mansour@email.com</span>
                </div>
                <div className="member-social">
                  <a href="#">
                    <Image
                      src="/images/about/instagram.png"
                      alt="Instagram"
                      width={20}
                      height={20}
                    />
                  </a>
                  <a href="#">
                    <Image
                      src="/images/about/twitter.png"
                      alt="Twitter"
                      width={20}
                      height={20}
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="team-member">
              <div className="member-photo">
                <Image
                  src="/images/about/jia.png"
                  alt="Jia Diyalo"
                  width={120}
                  height={120}
                  className="member-img"
                />
              </div>
              <div className="member-info">
                <div className="member-name">Jia Diyalo</div>
                <div className="member-role">COO</div>
                <div className="member-desc">
                  As COO of Heavenly, Jia Diyalo oversees the company’s
                  operations with a focus on collaboration and design. He leads
                  innovative solutions that meet client needs seamlessly, from
                  contractor coordination and sales to updating for families and
                  communities with lasting care.
                </div>
                <div className="member-contact">
                  <span>+1 403-514-1256</span>
                  <span>jia.diyalo@email.com</span>
                </div>
                <div className="member-social">
                  <a href="#">
                    <Image
                      src="/images/about/instagram.png"
                      alt="Instagram"
                      width={20}
                      height={20}
                    />
                  </a>
                  <a href="#">
                    <Image
                      src="/images/about/twitter.png"
                      alt="Twitter"
                      width={20}
                      height={20}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-row">
          <div className="footer-col">
            <Link href="/contact">Contact Us</Link>
            <Link href="/careers">Careers</Link>
          </div>
          <div className="footer-col">
            <Link href="/about">About</Link>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
          <div className="footer-col">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/listings">Listings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
