(function(){
  "use strict";

  /* ===== LOADING SCREEN ===== */
  const loader = document.getElementById("siteLoader");
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("hidden", "is-hidden");
    setTimeout(() => { loader.style.display = "none"; }, 600);
  };
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, {once:true});
  setTimeout(hideLoader, 3500);


  /* ===== HEADER SCROLL ===== */
  const header = document.getElementById("siteHeader");
  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 30);
    updateHeader();
    window.addEventListener("scroll", updateHeader, {passive:true});
  }


  /* ===== MOBILE MENU ===== */
  const menu = document.getElementById("siteMenu");
  const links = document.getElementById("siteLinks");
  const mobileMenu = document.getElementById("siteMobileMenu");

  if (menu) {
    const closeMenu = () => {
      menu.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      if (mobileMenu) mobileMenu.classList.remove("open");
      if (header) header.classList.remove("menu-open");
    };

    menu.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(isOpen));
      if (mobileMenu) mobileMenu.classList.toggle("open", isOpen);
      if (header) header.classList.toggle("menu-open", isOpen);
    });

    if (mobileMenu) mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    if (links) links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(e.target) || (mobileMenu && mobileMenu.contains(e.target))) return;
      closeMenu();
    });

    window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });
  }


  /* ===== ACTIVE NAV ===== */
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const productPages = ["corporate-uniform.html","cafe-restaurant.html","school-uniform.html","hotel-uniform.html","industrial-workwear.html","delivery-staff-wear.html"];

  document.querySelectorAll(".site-links a[data-page]").forEach(link => {
    const page = link.getAttribute("data-page");
    let active = page === current;
    if (productPages.includes(current) && page === "products.html") active = true;
    if (current === "career.html" && page === "career.html") active = true;
    link.classList.toggle("is-active", active);
  });


  /* ===== REVEAL ANIMATIONS ===== */
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


  /* ===== PRODUCT WHATSAPP CTA ===== */
  const productName = document.body.dataset.product;
  if (productName) {
    const businessNumber = "919214578049";
    const productMessage = "Hello KP House Team,\n\nI am interested in: " + productName + ".\n\nPlease share the available options, fabric choices, quantity guidance and quotation details.\n\nThank you.";
    const productUrl = "https://wa.me/" + businessNumber + "?text=" + encodeURIComponent(productMessage);

    document.querySelectorAll("[data-whatsapp-product]").forEach(el => {
      el.setAttribute("href", productUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.addEventListener("click", event => {
        event.preventDefault();
        window.open(productUrl, "_blank", "noopener");
      });
    });
  }


  /* =========================================================
     REQUIREMENT FORM — with validation + Web3Forms
  ========================================================= */
  const form = document.getElementById("requirementForm");
  const formMessage = document.getElementById("formMessage");
  const formArea = document.getElementById("requirementFormArea");
  const success = document.getElementById("requirementSuccess");
  const sendAnother = document.getElementById("sendAnother");
  const submitBtn = document.getElementById("submitBtn");

  /* ---- Phone: only digits allowed (auto-block) ---- */
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      /* Remove non-digits and limit to 10 */
      let v = e.target.value.replace(/\D/g, "").slice(0, 10);
      e.target.value = v;
      /* Live validation */
      if (v.length === 10) {
        e.target.classList.remove("invalid");
        document.getElementById("err-phone")?.classList.remove("show");
      }
    });

    phoneInput.addEventListener("keypress", (e) => {
      /* Only allow digits */
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });
  }

  /* ---- Email: live validation ---- */
  const emailInput = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput) {
    emailInput.addEventListener("blur", () => {
      const v = emailInput.value.trim();
      if (v && !emailRegex.test(v)) {
        emailInput.classList.add("invalid");
        document.getElementById("err-email")?.classList.add("show");
      } else {
        emailInput.classList.remove("invalid");
        document.getElementById("err-email")?.classList.remove("show");
      }
    });
  }

  /* ---- Helper: show/clear field error ---- */
  function setFieldError(id, show, message) {
    const input = document.getElementById(id);
    const err = document.getElementById("err-" + id);
    if (input) input.classList.toggle("invalid", show);
    if (err) {
      if (message) err.textContent = message;
      err.classList.toggle("show", show);
    }
  }

  /* ---- Clear error on input ---- */
  ["name","brand","quantity","product","date","details"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => setFieldError(id, false));
      el.addEventListener("change", () => setFieldError(id, false));
    }
  });

  /* ---- Form submit ---- */
  if (form) {
    let submitting = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const value = id => {
        const el = document.getElementById(id);
        return el && el.value ? el.value.trim() : "";
      };

      let valid = true;
      let firstInvalid = null;

      /* --- Name --- */
      if (value("name").length < 2) {
        setFieldError("name", true, "Please enter your name");
        if (!firstInvalid) firstInvalid = "name";
        valid = false;
      } else setFieldError("name", false);

      /* --- Phone: exactly 10 digits --- */
      const phoneVal = value("phone");
      if (!/^[0-9]{10}$/.test(phoneVal)) {
        setFieldError("phone", true, "WhatsApp number must be exactly 10 digits");
        if (!firstInvalid) firstInvalid = "phone";
        valid = false;
      } else setFieldError("phone", false);

      /* --- Email (optional but validate if given) --- */
      const emailVal = value("email");
      if (emailVal && !emailRegex.test(emailVal)) {
        setFieldError("email", true, "Please enter a valid email address");
        if (!firstInvalid) firstInvalid = "email";
        valid = false;
      } else setFieldError("email", false);

      /* --- Brand --- */
      if (value("brand").length < 2) {
        setFieldError("brand", true, "Please enter your brand name");
        if (!firstInvalid) firstInvalid = "brand";
        valid = false;
      } else setFieldError("brand", false);

      /* --- Quantity --- */
      if (!value("quantity")) {
        setFieldError("quantity", true, "Please enter quantity");
        if (!firstInvalid) firstInvalid = "quantity";
        valid = false;
      } else setFieldError("quantity", false);

      /* --- Product --- */
      if (!value("product")) {
        setFieldError("product", true, "Please select a product type");
        if (!firstInvalid) firstInvalid = "product";
        valid = false;
      } else setFieldError("product", false);

      /* --- Date --- */
      if (!value("date")) {
        setFieldError("date", true, "Please select required date");
        if (!firstInvalid) firstInvalid = "date";
        valid = false;
      } else setFieldError("date", false);

      /* --- Details --- */
      if (value("details").length < 5) {
        setFieldError("details", true, "Please describe your requirement");
        if (!firstInvalid) firstInvalid = "details";
        valid = false;
      } else setFieldError("details", false);

      /* --- Show error summary + scroll to first invalid --- */
      if (!valid) {
        if (firstInvalid) {
          const el = document.getElementById(firstInvalid);
          if (el) {
            el.focus();
            el.scrollIntoView({behavior: "smooth", block: "center"});
          }
        }
        if (formMessage) {
          formMessage.className = "form-message error";
          formMessage.textContent = "Please fix the highlighted fields before submitting.";
        }
        return;
      }

      if (submitting) return;
      submitting = true;

      const originalText = submitBtn ? submitBtn.textContent : "Send Requirement";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      if (formMessage) {
        formMessage.className = "form-message";
        formMessage.textContent = "Sending your requirement securely...";
      }

      /* Build FormData */
      const formData = new FormData(form);
      formData.set("subject", "New KP House Requirement — " + value("name"));
      if (emailVal) formData.set("replyto", emailVal);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          form.reset();
          if (formArea) formArea.style.display = "none";
          if (success) {
            success.classList.add("show");
            window.scrollTo({top: (success.offsetTop || 0) - 110, behavior: "smooth"});
          }
        } else {
          if (formMessage) {
            formMessage.className = "form-message error";
            formMessage.textContent = data.message || "Submission failed. Please try again.";
          }
        }
      } catch (error) {
        console.error("Form error:", error);
        if (formMessage) {
          formMessage.className = "form-message error";
          formMessage.textContent = "Something went wrong. Please try again or contact us on WhatsApp.";
        }
      } finally {
        submitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText || "Send Requirement";
        }
      }
    });
  }

  /* ===== Send Another ===== */
  if (sendAnother && formArea && success && form) {
    sendAnother.addEventListener("click", () => {
      form.reset();
      /* Clear all errors */
      document.querySelectorAll(".field-error.show").forEach(el => el.classList.remove("show"));
      document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
      success.classList.remove("show");
      formArea.style.display = "block";
      if (formMessage) {
        formMessage.className = "form-message";
        formMessage.textContent = "";
      }
      window.scrollTo({top: (formArea.offsetTop || 0) - 110, behavior: "smooth"});
    });
  }

})();
