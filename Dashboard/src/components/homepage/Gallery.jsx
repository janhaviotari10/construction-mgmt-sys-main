import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "./Gallery.css";

const Gallery = () => {
  const navigate = useNavigate(); // Hook to navigate between pages

  const projects = [
    {
      image: "src/assets/gallery/1.jpg",
      description: "Project 1",
    },
    {
      image: "src/assets/gallery/2.jpg",
      description: "Project 2",
    },
    {
      image: "src/assets/gallery/3.jpg",
      description: "Project 3",
    },
    {
      image: "src/assets/gallery/4.jpg",
      description: "Project 4",
    },
    {
        image: "src/assets/gallery/5.jpg",
        description: "Project 5",
      },
      
      {
        image: "src/assets/gallery/8.jpg",
        description: "Project 6",
      },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
  };

  // Open image in fullscreen
  const openFullscreen = (image) => {
    setFullscreenImage(image);
  };

  // Close fullscreen
  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="gallery-container">
      {/* Home Button */}
      <div className="home-icon" onClick={() => navigate("/")}>
        <FaHome size={28} />
      </div>

      {/* Intro Section */}
      <div className="gallery-header">
        <h1>Welcome to Our Project Gallery</h1>
        <p>
          Explore our finest works that reflect creativity, innovation, and excellence. 
          Each project is crafted with passion and attention to detail.
        </p>
      </div>

      {/* Carousel Section */}
      <div className="carousel">
        <button className="carousel-button prev" onClick={prevProject}>&#10094;</button>

        <div className="carousel-content">
          <div className="image-container-gallery" onClick={() => openFullscreen(projects[currentIndex].image)}>
            <img src={projects[currentIndex].image} alt={`Project ${currentIndex + 1}`} />
          </div>
          <p className="project-description">{projects[currentIndex].description}</p>
        </div>

        <button className="carousel-button next" onClick={nextProject}>&#10095;</button>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <img src={fullscreenImage} alt="Fullscreen" className="fullscreen-image" />
        </div>
      )}
    </div>
  );
};

export default Gallery;
