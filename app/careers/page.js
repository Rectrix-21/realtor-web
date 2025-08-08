"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import Link from "next/link";
import { supabase } from "../../database/supabase";

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
	const [careerOpportunity, setCareerOpportunity] = useState(null);
	const [jobForm, setForm] = useState({
		name: "",
		email: "",
		phone_number: "",
		skills: "",
	});
	const [success, setSuccess] = useState(null);
	const [error, setError] = useState("");
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user || null);
		};

		fetchUser();
	}, []);

	function handleChange(e) {
		const { name, value } = e.target;

		if (name === "phone_number") {
			const phoneRegex = /^[0-9-]*$/;
			if (!phoneRegex.test(value)) {
				setError("Phone number can only contain numbers and dashes.");
				return;
			} else {
				setError("");
			}
		}

		setForm({ ...jobForm, [name]: value });
	}

	function handleApply(form) {
		setCareerOpportunity(form);
		setSuccess(null);
		setForm({
			name: "",
			email: user?.email || "",
			phone_number: "",
			skills: "",
		});
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setSuccess(null);

		if (!user) {
			setError("You need to be logged in to submit an application.");
			return;
		}

		const authenticatedUserEmail = user.email;
		if (!authenticatedUserEmail) {
			setError(
				"Authenticated email is required to submit the application, please log in or sign up to proceed."
			);
			return;
		}

		try {
			const { data, error } = await supabase.from("Contractor").insert([
				{
					name: jobForm.name,
					email: authenticatedUserEmail,
					phone_number: jobForm.phone_number,
					skills: jobForm.skills,
					employment_status: "unemployed",
				},
			]);

			if (error) {
				setError("Failed to submit application. Please try again.");
				console.log(error);
			} else {
				setSuccess({
					index: careerOpportunity,
					message: "Application submitted successfully!",
				});
				setCareerOpportunity(null);
				setForm({
					name: "",
					email: "",
					phone_number: "",
					skills: "",
				});
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
			console.error(err);
		}
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
				Join our team and help shape the future of real estate! We value
				creativity, teamwork, and a passion for helping people find their dream
				homes.
			</p>
			<h2 className="careers-section-title">Open Positions</h2>
			<div className="jobs-list">
				{jobs.map((job, idx) => (
					<div className="job-card" key={idx}>
						<div className="job-info">
							<div className="job-title">{job.title}</div>
							<div className="job-desc">{job.description}</div>
						</div>
						{success?.index === idx ? (
							<div className="job-success">{success.message}</div>
						) : careerOpportunity === idx ? (
							<form className="career-form" onSubmit={handleSubmit}>
								{error && <div className="form-error">{error}</div>}
								<label>
									Name:
									<input
										name="name"
										value={jobForm.name}
										onChange={handleChange}
										required
									/>
								</label>
								<label>
									Email:
									<input
										type="email"
										name="email"
										value={jobForm.email}
										onChange={handleChange}
										required
									/>
								</label>
								<label>
									Phone Number:
									<input
										name="phone_number"
										value={jobForm.phone_number}
										onChange={handleChange}
										required
									/>
								</label>
								<label>
									Skills:
									<textarea
										name="skills"
										value={jobForm.skills}
										onChange={handleChange}
										rows={4}
										required
									/>
								</label>
								<div className="career-form-actions">
									<button type="submit">Submit Application</button>
									<button
										type="button"
										className="cancel-btn"
										onClick={() => setCareerOpportunity(null)}
									>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<button
								className="apply-btn"
								onClick={() => handleApply(idx)}
							>
								Apply Now
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}