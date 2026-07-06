(function () {
  "use strict";

  const weddingDate = new Date("2026-12-02T18:00:00+05:30").getTime();
  const loader = document.getElementById("loader");
  const audio = document.getElementById("wedding-audio");
  const musicToggle = document.getElementById("music-toggle-fab");
  const musicLabel = document.getElementById("music-label-fab");
  const scrollTopButton = document.getElementById("scroll-top");
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  const petalLayer = document.getElementById("petal-layer");
  const particleLayer = document.getElementById("particle-layer");
  const toast = document.getElementById("toast");
  const envelopeWrapper = document.getElementById("envelope-wrapper");
  const envelopeSeal = document.getElementById("envelope-seal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lock scroll immediately on script execution to ensure envelope loading state
  document.body.classList.add("is-locked");

  const formatNumber = (value, length) => String(value).padStart(length, "0");

  function hideLoader() {
    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      document.body.classList.add("is-loaded");
    }, 1100);
  }

  function updateCountdown() {
    const distance = weddingDate - Date.now();

    if (distance <= 0) {
      days.textContent = "000";
      hours.textContent = "00";
      minutes.textContent = "00";
      seconds.textContent = "00";
      return;
    }

    const dayValue = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hourValue = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minuteValue = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secondValue = Math.floor((distance % (1000 * 60)) / 1000);

    days.textContent = formatNumber(dayValue, 3);
    hours.textContent = formatNumber(hourValue, 2);
    minutes.textContent = formatNumber(minuteValue, 2);
    seconds.textContent = formatNumber(secondValue, 2);
  }

  function buildPetals() {
    if (!petalLayer || reducedMotion) {
      return;
    }

    const petalCount = window.innerWidth < 768 ? 10 : 18;

    for (let index = 0; index < petalCount; index += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.opacity = `${0.38 + Math.random() * 0.4}`;
      petal.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
      petal.style.animationDuration = `${8 + Math.random() * 9}s`;
      petal.style.animationDelay = `${Math.random() * -12}s`;
      petal.style.setProperty("--drift-x", `${-80 + Math.random() * 160}px`);
      petalLayer.appendChild(petal);
    }
  }

  function buildParticles() {
    if (!particleLayer || reducedMotion) {
      return;
    }

    const particleCount = window.innerWidth < 768 ? 14 : 24;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${35 + Math.random() * 70}%`;
      particle.style.opacity = `${0.18 + Math.random() * 0.35}`;
      particle.style.transform = `scale(${0.5 + Math.random() * 1.2})`;
      particle.style.animationDuration = `${6 + Math.random() * 7}s`;
      particle.style.animationDelay = `${Math.random() * -8}s`;
      particleLayer.appendChild(particle);
    }
  }

  function setupAudio() {
    if (!audio) {
      return;
    }

    audio.volume = 0.2;
    audio.load();
    audio.play().catch(() => {
      // Browsers may still block autoplay in some contexts; manual control remains available.
    });

    if (!musicToggle || !musicLabel) {
      return;
    }

    const syncLabel = () => {
      const isPlaying = !audio.paused && !audio.muted;
      musicToggle.setAttribute("aria-pressed", String(isPlaying));
      musicLabel.textContent = isPlaying ? "Pause" : "Music";
    };

    musicToggle.addEventListener("click", async () => {
      try {
        if (audio.paused || audio.muted) {
          audio.muted = false;
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        musicLabel.textContent = "Tap To Enable Audio";
      }

      syncLabel();
    });

    audio.addEventListener("pause", syncLabel);
    audio.addEventListener("play", syncLabel);
    syncLabel();
  }

  function initAOS() {
    if (typeof AOS === "undefined") {
      return;
    }

    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      offset: 40,
      once: true,
      disable: reducedMotion
    });
  }

  function showToast(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function setupCopyButtons() {
    const buttons = document.querySelectorAll(".copy-address, .copy-contact");

    if (!buttons.length) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const textToCopy = button.getAttribute("data-address") || button.getAttribute("data-copy-text");
        const originalText = button.textContent;
        const successMessage = button.classList.contains("copy-contact") ? "Number copied successfully" : "Address copied successfully";

        if (!textToCopy) {
          return;
        }

        try {
          await navigator.clipboard.writeText(textToCopy);
          button.textContent = button.classList.contains("copy-contact") ? "Number Copied" : "Address Copied";
          button.classList.add("is-copied");
          showToast(successMessage);
        } catch (error) {
          button.textContent = "Copy Unavailable";
          showToast("Clipboard access is unavailable");
        }

        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("is-copied");
        }, 1800);
      });
    });
  }

  function setupScrollTopButton() {
    if (!scrollTopButton) {
      return;
    }

    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  }

  function setupEnvelope() {
    if (!envelopeWrapper || !envelopeSeal) {
      document.body.classList.remove("is-locked");
      initAOS();
      return;
    }

    envelopeSeal.addEventListener("click", () => {
      envelopeWrapper.classList.add("is-open");

      // Auto-play audio upon direct user interaction
      if (audio) {
        audio.muted = false;
        audio.play().catch(() => {
          // Autoplay bypass block fallback
        });
      }

      window.setTimeout(() => {
        envelopeWrapper.style.display = "none";
        document.body.classList.remove("is-locked");
        initAOS();
      }, 1200);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hideLoader();
    updateCountdown();
    buildPetals();
    buildParticles();
    setupAudio();
    setupEnvelope();
    setupCopyButtons();
    setupScrollTopButton();
    window.setInterval(updateCountdown, 1000);
  });
})();
