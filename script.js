// Zack & Sam portfolio interactions
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  // Reveal sections smoothly as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Subtle 3D tilt on cards. Disabled on touch devices for a cleaner mobile experience.
  const canTilt =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canTilt) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Small ambient cursor glow for desktop.
  const glow = document.querySelector(".cursor-glow");
  if (glow && canTilt) {
    window.addEventListener(
      "pointermove",
      (event) => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
      },
      { passive: true },
    );
  }

  // Animated quote modal: stays hidden until the user asks for a quote.
  const quoteModal = document.getElementById("quote-modal");
  const quoteTrigger = document.getElementById("open-quote");
  let quotePreviousFocus = null;
  const closeQuote = () => {
    if (!quoteModal || quoteModal.hidden) return;
    quoteModal.classList.remove("is-open");
    document.body.classList.remove("quote-modal-open");
    window.setTimeout(() => {
      quoteModal.hidden = true;
    }, 260);
    if (quotePreviousFocus) quotePreviousFocus.focus();
  };
  if (quoteModal && quoteTrigger) {
    quoteTrigger.addEventListener("click", () => {
      quotePreviousFocus = document.activeElement;
      quoteModal.hidden = false;
      document.body.classList.add("quote-modal-open");
      requestAnimationFrame(() => {
        quoteModal.classList.add("is-open");
        const dialog = quoteModal.querySelector(".quote-dialog");
        if (dialog) dialog.focus();
      });
    });
    quoteModal
      .querySelectorAll("[data-close-quote]")
      .forEach((button) => button.addEventListener("click", closeQuote));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeQuote();
    });
  }

  // Send project quote requests directly to the studio email using FormSubmit.
  const clientForm = document.getElementById("client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!clientForm.reportValidity()) return;

      const submitButton = clientForm.querySelector('button[type="submit"]');
      const feedback = document.getElementById("form-feedback");
      const data = new FormData(clientForm);
      const payload = {
        access_key: "0273ea5b-4c7e-4522-9f29-3808e8ae4a9b",
        subject: `New project quote request — ${data.get("clientName")}`,
        from_name: "Zack & Sam Website",
        name: data.get("clientName"),
        phone: data.get("clientPhone"),
        service: data.get("service"),
        budget: data.get("budget") || "Not specified",
        message: data.get("projectDetails"),
        email: "zacksamagence@gmail.com",
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent.trim();
        submitButton.textContent = "Sending…";
      }
      if (feedback) feedback.textContent = "Sending your request…";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message ||
              "Web3Forms could not accept the request. Check your Access Key and email verification.",
          );
        }
        if (feedback)
          feedback.textContent =
            "Thank you! Your quote request has been sent. We’ll contact you soon.";
        clientForm.reset();
        // Keep the modal open so the customer can see the confirmation message.
      } catch (error) {
        if (feedback)
          feedback.textContent =
            "Sorry, we couldn’t send your request. Please try again or email zacksamagence@gmail.com directly. If this is your first setup, check the Web3Forms Access Key.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent =
            submitButton.dataset.originalText || "Send quote request";
        }
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
