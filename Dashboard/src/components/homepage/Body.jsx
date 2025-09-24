import React, { useEffect } from "react";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Body.css";

const Body = () => {
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".scroll-section");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          section.classList.add("visible");
        }
      });
    };

    // Handle the first section fade-up on mount
    setTimeout(() => {
      const firstSection = document.querySelector(".scroll-section:first-child");
      if (firstSection) {
        firstSection.classList.add("visible");
      }
    }, 100);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      {/* Section 1: Fades on Mount */}
      <div className="scroll-section">
        <div className="content">
          <h1>
          Welcome to <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "bold" }}>Ease My Construction</span>
          </h1>
          <p>
            Empower your construction business with a <b>Streamlined Project Management Platform</b> designed for builders, contractors, and construction firms.  
            Manage projects, estimate costs, store critical documents, and schedule meetings effortlessly—all in one place.
          </p>
        </div>
        <div className="image-container">
          <img src="src/assets/2.jpg" alt="Construction Management" />
        </div>
      </div>

      {/* Section 2: About Us */}
      <div className="scroll-section">
        <div className="image-container">
          <img src="src/assets/n.jpg" alt="Construction Planning" />
        </div>
        <div className="content">
          <h1>About Us</h1>
          <p>
            Ease My Construction is built to simplify how <b>construction businesses</b> manage their projects. We help builders and contractors optimize workflows, ensuring projects are completed efficiently, within budget, and on time.
          </p>
          <p>
            Our platform provides <b>real-time project tracking, cost estimation tools, document management, and meeting scheduling capabilities</b> to ensure seamless collaboration among stakeholders.
          </p>
          <p>
            Whether you are a <b>small contractor</b> or a <b>large-scale construction firm</b>, we provide the tools to help you manage multiple projects, track expenses, and maintain operational efficiency.
          </p>
        </div>
      </div>

      {/* Section 3: Contact Us with Social Media & Communication Icons */}
      <div className="scroll-section">
        <div className="content">
          <h1>Contact Us</h1>
          <p>
            Looking for a reliable platform to <b>manage your construction projects</b>? Get in touch with us today!  
            Our team is here to help you streamline your workflow and boost productivity.
          </p>
          <p>
            Stay connected with us on social media for industry updates and platform enhancements.
          </p>
        </div>
        <div className="social-icons">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={40} />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={40} />
          </a>
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={40} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter size={40} />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={40} />
          </a>
          <a href="mailto:example@example.com" target="_blank" rel="noopener noreferrer">
            <FaEnvelope size={40} />
          </a>
        </div>
      </div>

      {/* Footer Section: Services, Extra Links, Contact Info, Social Media Links */}
      <div className="footer">
        <div className="footer-sections">

          {/* Replaced Quick Links with Services Section */}
          <div className="footer-column">
            <h3>Our Services</h3>
            <ul>
              <li>Project Management</li>
              <li>Cost Estimation</li>
              <li>Document Management</li>
              <li>Meeting Scheduling</li>
            </ul>
          </div>

          

          <div className="footer-column">
            <h3>Contact Info</h3>
            <ul>
              <li>+123-456-7890</li>
              <li>+111-222-3333</li>
              <li>support@easemyconstruction.com</li>
              <li>Mumbai, India - 400104</li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Follow Us</h3>
            <ul>
              <li><a href="https://www.facebook.com">Facebook</a></li>
              <li><a href="https://twitter.com">Twitter</a></li>
              <li><a href="https://www.instagram.com">Instagram</a></li>
              <li><a href="https://www.linkedin.com">LinkedIn</a></li>
            </ul>
          </div>

        </div>
        <p className="footer-copy">© 2024 Ease My Construction | All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Body;
