"use client";
import React, { useState } from "react";
import "./styles.css";
import Link from "next/link";

const jobs = [
  {
    title: "Frontend Developer",
    description: "Build beautiful, responsive interfaces using React and modern CSS. Collaborate with designers and backend engineers to deliver seamless user experiences.",
  },
  {
    title: "Backend Developer",
    description: "Design and implement scalable APIs and services using Node.js, Express, and MongoDB. Ensure data integrity and security for our real estate platform.",
  },
  {
    title: "Sales Executive",
    description: "Engage with clients, understand their needs, and help them find their dream properties. Prior real estate sales experience preferred.",
  },
  {
    title: "Marketing Specialist",
    description: "Drive digital campaigns, manage social media, and create engaging content to promote our brand and listings.",
  },
  {
    title: "Contractor",
    description: "Work with our team to renovate, repair, and maintain properties. Experience in construction or property maintenance required.",
  },
  {
    title: "Designer",
    description: "Create stunning visuals and layouts for property listings, marketing materials, and our website. Real estate design experience is a plus.",
  },
];

export default function CareersPage() {
  const [showFormIdx, setShowFormIdx] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
    coverLetter: "",
  });
  const [submittedIdx, setSubmittedIdx] = useState(null);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm({ ...form, resume: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleApply(idx) {
    setShowFormIdx(idx);
    setSubmittedIdx(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      resume: null,
      coverLetter: "",
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedIdx(showFormIdx);
    setShowFormIdx(null);
  }

  return (
    <div className="careers-container">
        {/* Navbar */}
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
      <h1 className="careers-title">Careers at RealtorWeb</h1>
      <p className="careers-intro">
        Join our team and help shape the future of real estate! We value creativity, teamwork, and a passion for helping people find their dream homes.
      </p>
      <h2 className="careers-section-title">Open Positions</h2>
      <div className="jobs-list">
        {jobs.map((job, idx) => (
          <div className="job-card" key={idx}>
            <div className="job-info">
              <div className="job-title">{job.title}</div>
              <div className="job-desc">{job.description}</div>
            </div>
            {submittedIdx === idx ? (
              <div className="job-success">Thank you for applying! We will review your application and contact you soon.</div>
            ) : showFormIdx === idx ? (
              <form className="career-form" onSubmit={handleSubmit}>
                <label>
                  Name:
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Email:
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  Phone:
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </label>
                <label>
                  Resume:
                  <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} required />
                </label>
                <label>
                  Cover Letter:
                  <textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={4} />
                </label>
                <div className="career-form-actions">
                  <button type="submit">Submit Application</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowFormIdx(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <button className="apply-btn" onClick={() => handleApply(idx)}>
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}