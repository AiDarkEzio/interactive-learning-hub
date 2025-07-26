// assets/js/home.js

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for hero scroll indicator
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.querySelector(".applications-grid").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  // Add hover effects to app cards
  const appCards = document.querySelectorAll(".app-card");
  appCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.zIndex = "10";
    });

    card.addEventListener("mouseleave", () => {
      card.style.zIndex = "1";
    });
  });

  // Enhanced scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");

        // Special handling for application cards
        if (entry.target.classList.contains("applications-grid")) {
          const cards = entry.target.querySelectorAll(".app-card");
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, index * 100);
          });
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections for animations
  const animatedElements = document.querySelectorAll(
    ".section, .applications-grid, .about-grid"
  );
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Add click tracking for analytics (if needed)
  const appLinks = document.querySelectorAll('a[href*="randomness-explained"]');
  appLinks.forEach((link) => {
    link.addEventListener("click", () => {
      console.log("User clicked on Randomness application");
      // You can add analytics tracking here
    });
  });

  const blogLinks = document.querySelectorAll(
    'a[href*="aidarkezio.netlify.app"]'
  );
  blogLinks.forEach((link) => {
    link.addEventListener("click", () => {
      console.log("User clicked on blog link");
      // You can add analytics tracking here
    });
  });

  // Feature tag hover effects
  const featureTags = document.querySelectorAll(".feature-tag");
  featureTags.forEach((tag) => {
    tag.addEventListener("mouseenter", () => {
      tag.style.transform = "translateY(-2px) scale(1.05)";
    });

    tag.addEventListener("mouseleave", () => {
      tag.style.transform = "translateY(0) scale(1)";
    });
  });

  // Add subtle parallax effect to hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector(".hero");
    const parallax = scrolled * 0.5;

    if (hero && scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${parallax}px)`;
    }
  });

  // Add typing effect to hero subtitle (delayed)
  setTimeout(() => {
    const subtitle = document.querySelector(".hero-subtitle");
    if (subtitle) {
      const text = subtitle.textContent;
      subtitle.textContent = "";
      subtitle.style.opacity = "1";

      let i = 0;
      const typeInterval = setInterval(() => {
        subtitle.textContent += text.charAt(i);
        i++;
        if (i > text.length) {
          clearInterval(typeInterval);
        }
      }, 50);
    }
  }, 2500);
});
