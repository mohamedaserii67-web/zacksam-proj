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

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  // Reveal sections smoothly as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Subtle 3D tilt on cards. Disabled on touch devices for a cleaner mobile experience.
  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canTilt) {
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("pointermove", event => {
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
    window.addEventListener("pointermove", event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }



  // Animated quote modal: stays hidden until the user asks for a quote.
  const quoteModal = document.getElementById("quote-modal");
  const quoteTrigger = document.getElementById("open-quote");
  let quotePreviousFocus = null;
  const closeQuote = () => {
    if (!quoteModal || quoteModal.hidden) return;
    quoteModal.classList.remove("is-open");
    document.body.classList.remove("quote-modal-open");
    window.setTimeout(() => { quoteModal.hidden = true; }, 260);
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
    quoteModal.querySelectorAll("[data-close-quote]").forEach(button => button.addEventListener("click", closeQuote));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeQuote();
    });
  }

  // Client project form: prepare a message and open WhatsApp for the client to send.
  const clientForm = document.getElementById("client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!clientForm.reportValidity()) return;

      const data = new FormData(clientForm);
      const message = [
        "Hello Zack & Sam! I'd like to discuss a project.",
        "",
        `Name: ${data.get("clientName")}`,
        `Phone / WhatsApp: ${data.get("clientPhone")}`,
        `Service: ${data.get("service")}`,
        `Estimated budget: ${data.get("budget") || "Not specified"}`,
        "",
        "Project details:",
        data.get("projectDetails")
      ].join("\\n");

      const feedback = document.getElementById("form-feedback");
      if (feedback) feedback.textContent = "WhatsApp is opening with your project details. Review the message and press Send.";
      window.open(`https://wa.me/212687216896?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      closeQuote();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
