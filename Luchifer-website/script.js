(function(){
  "use strict";

  /* Loading screen */
  const loader = document.getElementById("siteLoader");
  const hideLoader = () => {
    if (!loader) return;
    setTimeout(() => loader.classList.add("is-hidden"), 450);
  };
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, {once:true});
  setTimeout(hideLoader, 3500);

  /* Shared header */
  const header = document.getElementById("siteHeader");
  const menu = document.getElementById("siteMenu");
  const links = document.getElementById("siteLinks");

  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 30);
    updateHeader();
    window.addEventListener("scroll", updateHeader, {passive:true});
  }

  if (menu && header && links) {
    menu.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        header.classList.remove("menu-open");
        menu.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-label", "Open menu");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        header.classList.remove("menu-open");
        menu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Mark current page in the shared navigation */
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-links a[data-page]").forEach(link => {
    const page = link.getAttribute("data-page");
    let active = page === current;
    if (["corporate-uniform.html","cafe-restaurant.html","chef-uniform.html","hotel-uniform.html","industrial-workwear.html","delivery-staff-wear.html"].includes(current) && page === "products.html") active = true;
    if (current === "career.html" && page === "career.html") active = true;
    link.classList.toggle("is-active", active);
  });

  /* Reveal animations used by all existing pages */
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

  /* Product-page WhatsApp CTA */
  const productName = document.body.dataset.product;
  if (productName) {
    const businessNumber = "917235851276";
    document.querySelectorAll("[data-whatsapp-product]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        const message = `Hello Luchifer Team,\n\nI am interested in: ${productName}.\n\nPlease share the available options, fabric choices, quantity guidance and quotation details.\n\nThank you.`;
        window.location.href = "https://wa.me/" + businessNumber + "?text=" + encodeURIComponent(message);
      });
    });
  }

  /* Requirement form — direct email submission with file upload */
  const form = document.getElementById("requirementForm");
  const formMessage = document.getElementById("formMessage");
  const formArea = document.getElementById("requirementFormArea");
  const success = document.getElementById("requirementSuccess");
  const sendAnother = document.getElementById("sendAnother");
  const submitFrame = document.getElementById("formSubmitTarget");

  if (form) {
    let submitting = false;
    let submissionStarted = false;

    /* Required-field validation is also enforced by HTML required attributes.
       This extra check gives a clear message before the POST is made. */
    form.addEventListener("submit", event => {
      const value = id => document.getElementById(id)?.value?.trim() || "";
      const requiredFields = [
        ["name", "your name"],
        ["phone", "WhatsApp number"],
        ["email", "email address"],
        ["company", "company / organisation"],
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
        field?.focus();
        if (formMessage) {
          formMessage.style.display = "block";
          formMessage.textContent = `Please complete ${missing[1]} before submitting.`;
        }
        return;
      }

      if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
        event.preventDefault();
        if (formMessage) {
          formMessage.style.display = "block";
          formMessage.textContent = "Please keep the reference/logo file below 10 MB.";
        }
        return;
      }

      if (submitting) {
        event.preventDefault();
        return;
      }

      const email = value("email");
      const subject = form.querySelector('input[name="_subject"]');
      const replyTo = form.querySelector('input[name="_replyto"]');
      const urlField = form.querySelector('input[name="_url"]');
      if (subject) subject.value = `New Luchifer Requirement — ${value("name")}`;
      if (replyTo) replyTo.value = email;
      if (urlField) urlField.value = window.location.href;

      submitting = true;
      submissionStarted = true;
      form.querySelector('button[type="submit"]')?.setAttribute("disabled", "disabled");
      if (formMessage) {
        formMessage.style.display = "block";
        formMessage.textContent = "Sending your requirement securely...";
      }

      /* Do not show success on a timer. The previous version did that even when
         the external mail service had not received the POST. */
    });

    if (submitFrame) {
      submitFrame.addEventListener("load", () => {
        if (!submissionStarted) return;
        /* FormSubmit has loaded a response into the target iframe. We cannot
           inspect a cross-origin response, but the load event confirms the POST
           completed at the browser level. */
        submitting = false;
        submissionStarted = false;
        form.querySelector('button[type="submit"]')?.removeAttribute("disabled");
        if (formArea && success) {
          form.reset();
          formArea.style.display = "none";
          success.classList.add("show");
        }
      });
    }
  }

  if (sendAnother && formArea && success && form) {
    sendAnother.addEventListener("click", () => {
      form.reset();
      success.classList.remove("show");
      formArea.style.display = "block";
      if (formMessage) { formMessage.style.display = "none"; formMessage.textContent = ""; }
      window.scrollTo({top:formArea.offsetTop - 110, behavior:"smooth"});
    });
  }
})();
