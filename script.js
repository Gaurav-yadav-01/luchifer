(function(){
  "use strict";

  /* =========================================================
     LOADING SCREEN
     Uses BOTH `hidden` and `is-hidden` classes for max compat
  ========================================================= */
  const loader = document.getElementById("siteLoader");
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("hidden");
    loader.classList.add("is-hidden");
    setTimeout(() => { loader.style.display = "none"; }, 600);
  };
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, {once:true});
  setTimeout(hideLoader, 3500);


  /* =========================================================
     SHARED HEADER
  ========================================================= */
  const header = document.getElementById("siteHeader");
  const menu = document.getElementById("siteMenu");
  const links = document.getElementById("siteLinks");
  const mobileMenu = document.getElementById("siteMobileMenu");

  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 30);
    updateHeader();
    window.addEventListener("scroll", updateHeader, {passive:true});
  }

  /* =========================================================
     MOBILE MENU — handles BOTH `open` (panel) and
     `menu-open` (header) class conventions
  ========================================================= */
  if (menu) {
    menu.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(isOpen));
      menu.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (mobileMenu) mobileMenu.classList.toggle("open", isOpen);
      if (header) header.classList.toggle("menu-open", isOpen);
    });

    /* Close menu when a link inside the panel is clicked */
    if (mobileMenu) {
      mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          menu.classList.remove("open");
          menu.setAttribute("aria-expanded", "false");
          menu.setAttribute("aria-label", "Open menu");
          mobileMenu.classList.remove("open");
          if (header) header.classList.remove("menu-open");
        });
      });
    }

    /* Also close on link clicks inside desktop nav (harmless) */
    if (links) {
      links.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          menu.classList.remove("open");
          menu.setAttribute("aria-expanded", "false");
          menu.setAttribute("aria-label", "Open menu");
          if (mobileMenu) mobileMenu.classList.remove("open");
          if (header) header.classList.remove("menu-open");
        });
      });
    }

    /* Close on outside click */
    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(e.target)) return;
      if (mobileMenu && mobileMenu.contains(e.target)) return;
      menu.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open menu");
      if (mobileMenu) mobileMenu.classList.remove("open");
      if (header) header.classList.remove("menu-open");
    });

    /* Auto-close when resizing back to desktop */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        menu.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
        if (mobileMenu) mobileMenu.classList.remove("open");
        if (header) header.classList.remove("menu-open");
      }
    });
  }


  /* =========================================================
     MARK CURRENT PAGE IN NAV
     (Chef removed, School added)
  ========================================================= */
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* Any of these product pages should also highlight "Products" in nav */
  const productPages = [
    "corporate-uniform.html",
    "cafe-restaurant.html",
    "school-uniform.html",
    "hotel-uniform.html",
    "industrial-workwear.html",
    "delivery-staff-wear.html"
  ];

  document.querySelectorAll(".site-links a[data-page]").forEach(link => {
    const page = link.getAttribute("data-page");
    let active = page === current;
    if (productPages.includes(current) && page === "products.html") active = true;
    if (current === "career.html" && page === "career.html") active = true;
    link.classList.toggle("is-active", active);
  });


  /* =========================================================
     REVEAL ANIMATIONS
  ========================================================= */
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible", "show");
            obs.unobserve(entry.target);
          }
        });
      }, {threshold:.10});
      revealItems.forEach(el => observer.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add("visible", "show"));
    }
  }


  /* =========================================================
     PRODUCT-PAGE WHATSAPP CTA
     Sets href + opens WhatsApp with product-specific message
  ========================================================= */
  const productName = document.body.dataset.product;
  if (productName) {
    const businessNumber = "917704810716";
    const productMessage =
      "Hello Luchifer Team,\n\n" +
      "I am interested in: " + productName + ".\n\n" +
      "Please share the available options, fabric choices, quantity guidance and quotation details.\n\n" +
      "Thank you.";
    const productUrl = "https://wa.me/" + businessNumber + "?text=" + encodeURIComponent(productMessage);

    document.querySelectorAll("[data-whatsapp-product]").forEach(el => {
      /* Set href so middle-click / right-click open also work */
      el.setAttribute("href", productUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");

      /* On left click, navigate directly */
      el.addEventListener("click", event => {
        event.preventDefault();
        window.open(productUrl, "_blank", "noopener");
      });
    });
  }


  /* =========================================================
     REQUIREMENT FORM
     Email field is OPTIONAL (matches Contact page HTML).
     FormSubmit endpoint handles the actual send.
  ========================================================= */
  const form = document.getElementById("requirementForm");
  const formMessage = document.getElementById("formMessage");
  const formArea = document.getElementById("requirementFormArea");
  const success = document.getElementById("requirementSuccess");
  const sendAnother = document.getElementById("sendAnother");
  const submitFrame = document.getElementById("formSubmitTarget");

  if (form) {
    let submitting = false;
    let submissionStarted = false;

    form.addEventListener("submit", event => {
      const value = id => document.getElementById(id)?.value?.trim() || "";

      /* Email is optional — not included in required list */
      const requiredFields = [
        ["name", "your name"],
        ["phone", "WhatsApp number"],
        ["quantity", "quantity"],
        ["product", "product type"],
        ["date", "required date"],
        ["details", "your requirement"]
      ];

      const missing = requiredFields.find(([id]) => !value(id));
      const fileInput = document.getElementById("file");
      const selectedFile = fileInput?.files?.[0] || null;

      if (missing) {
        event.preventDefault();
        const field = document.getElementById(missing[0]);
        if (field && typeof field.focus === "function") field.focus();
        if (formMessage) {
          formMessage.className = "form-message error";
          formMessage.textContent = "Please complete " + missing[1] + " before submitting.";
        }
        return;
      }

      if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
        event.preventDefault();
        if (formMessage) {
          formMessage.className = "form-message error";
          formMessage.textContent = "Please keep the reference/logo file below 10 MB.";
        }
        return;
      }

      if (submitting) {
        event.preventDefault();
        return;
      }

      /* Prefill hidden fields so the email looks professional */
      const email = value("email");
      const subject = form.querySelector('input[name="_subject"]');
      const replyTo = form.querySelector('input[name="_replyto"]');
      const urlField = form.querySelector('input[name="_url"]');
      if (subject) subject.value = "New Luchifer Requirement — " + value("name");
      if (replyTo) replyTo.value = email || "";
      if (urlField) urlField.value = window.location.href;

      submitting = true;
      submissionStarted = true;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.setAttribute("disabled", "disabled");
        submitBtn.textContent = "Sending...";
      }

      if (formMessage) {
        formMessage.className = "form-message";
        formMessage.textContent = "Sending your requirement securely...";
      }
    });

    /* When the FormSubmit iframe finishes loading, show success */
    if (submitFrame) {
      submitFrame.addEventListener("load", () => {
        if (!submissionStarted) return;
        submitting = false;
        submissionStarted = false;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.removeAttribute("disabled");
          submitBtn.textContent = "Send Requirement";
        }

        if (formArea && success) {
          form.reset();
          formArea.style.display = "none";
          success.classList.add("show");
          window.scrollTo({top: formArea.offsetTop - 110, behavior: "smooth"});
        }
      });
    }
  }

  /* "Send Another Requirement" resets the form */
  if (sendAnother && formArea && success && form) {
    sendAnother.addEventListener("click", () => {
      form.reset();
      success.classList.remove("show");
      formArea.style.display = "block";
      if (formMessage) {
        formMessage.className = "form-message";
        formMessage.textContent = "";
      }
      window.scrollTo({top: formArea.offsetTop - 110, behavior: "smooth"});
    });
  }
})();
