(() => {
  const wireMobileMenu = (root = document) => {
    const mobileMenuBtn = root.querySelector(".mobile-menu-btn");
    const mobileMenuOverlay = root.querySelector(".mobile-menu-overlay");
    const customMoreSelectionBtns = root.querySelectorAll(
      ".custom-more-selection-btn"
    );
    if (!mobileMenuBtn || !mobileMenuOverlay) return;

    const openMobileMenu = () => {
      mobileMenuBtn.classList.add("active");
      mobileMenuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };


    document.addEventListener("click", (e) => {
      const clickedInsideAnyBtn =
        e.target &&
        e.target.closest &&
        e.target.closest(".custom-more-selection-btn");
      if (!clickedInsideAnyBtn) {
        closeAllCustomMoreSelections();
      }
    });

    const closeMobileMenu = () => {
      mobileMenuBtn.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };

    const toggleMobileMenu = () => {
      if (mobileMenuOverlay.classList.contains("active")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    };

    mobileMenuBtn.addEventListener("click", toggleMobileMenu);

    mobileMenuOverlay.addEventListener("click", (event) => {
      if (event.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });

    const mobileMenuLinks =
      mobileMenuOverlay.querySelectorAll(".mobile-menu a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        mobileMenuOverlay.classList.contains("active")
      ) {
        closeMobileMenu();
      }
    });
  };

  const loadFragment = async (selector, href) => {
    const host = document.querySelector(selector);
    if (!host) return null;
    try {
      const res = await fetch(href, { cache: "no-cache" });
      const html = await res.text();
      host.innerHTML = html;
      return host;
    } catch (err) {
      console.error(`Error loading ${selector} from ${href}:`, err);
      return null;
    }
  };


  const wireActiveLinks = (root = document) => {
    const getCurrentMatchPath = () => {
      let path = window.location.pathname;
      if (!/\.html$/i.test(path)) {
        if (!path.endsWith("/")) path += "/";
        path += "index.html";
      }
      return path.toLowerCase();
    };

    const getLinkEnd = (anchor) => {
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return null;
      try {
        const url = new URL(href, window.location.href);
        const last = url.pathname.split("/").pop() || "index.html";
        return last.toLowerCase();
      } catch (_) {
        return null;
      }
    };

    const anchors = root.querySelectorAll(
      ".desktop-menu a, .mobile-menu a, .custom-more-selection a"
    );
    anchors.forEach((a) => a.classList.remove("active"));

    const currentPath = getCurrentMatchPath();
    const currentEnd = (() => {
      const parts = currentPath.split("/");
      return (parts[parts.length - 1] || "index.html").toLowerCase();
    })();
    const exactMatches = [];
    anchors.forEach((a) => {
      const end = getLinkEnd(a);
      if (end && currentPath.endsWith(end)) exactMatches.push(a);
    });

    if (currentEnd === "login.html" || currentEnd === "forget-password.html") {
      anchors.forEach((a) => {
        const end = getLinkEnd(a);
        if (end === "signup.html") exactMatches.push(a);
      });
    }

    const toActivate = exactMatches.length
      ? exactMatches
      : Array.from(anchors).filter((a) => getLinkEnd(a) === "index.html");
    toActivate.forEach((a) => a.classList.add("active"));
  };

  const wireProfileTabs = (root = document) => {
    const tabButtons = root.querySelectorAll(".tabs button[data-tab]");
    const tabContents = root.querySelectorAll(".tab-content[data-content]");

    if (tabButtons.length === 0 || tabContents.length === 0) return;

    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        const targetTab = button.getAttribute("data-tab");

        tabButtons.forEach((btn) => btn.classList.remove("active"));

        tabContents.forEach((content) => content.classList.remove("active"));

        button.classList.add("active");

        const targetContent = root.querySelector(
          `.tab-content[data-content="${targetTab}"]`
        );
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  };

  const wireSlider = (root = document) => {
    const slider = root.querySelector(".hero-section .slider");
    const dots = root.querySelectorAll(".hero-section .dots .dot");
    const slides = root.querySelectorAll(".hero-section .slider .content");

    if (!slider || !dots.length || !slides.length) return;

    let currentIndex = 0;

    slider.style.transition = "transform 0.5s ease-in-out";

    const goToSlide = (index) => {
      if (index < 0 || index >= slides.length) return;

      const slide = slides[index];
      slider.style.transform = `translateX(${slide.offsetLeft}px)`;

      dots.forEach((dot) => dot.classList.remove("active"));
      dots[index].classList.add("active");

      currentIndex = index;
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);
      });
    });

    window.addEventListener("resize", () => {
      goToSlide(currentIndex);
    });
  };

  const init = async () => {
    const headerHost = await loadFragment(
      "y-navbar",
      "../../components/header.html"
    );
    await loadFragment("y-footer", "../../components/footer.html");

    if (headerHost) wireMobileMenu(headerHost);
    wireActiveLinks(document);
    wireProfileTabs(document);
    wireSlider(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
