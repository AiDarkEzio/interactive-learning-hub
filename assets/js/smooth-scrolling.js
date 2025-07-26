// assets/js/smooth-scrolling.js

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for hero button
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.querySelector(".feud-section").scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  // Add scroll animations to sections
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target); // Optional: stop observing after animation
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });
});
