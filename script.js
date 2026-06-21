const envelopeSection = document.querySelector("#envelopeSection");
const openEnvelope = document.querySelector("#openEnvelope");
const invitationContent = document.querySelector("#invitationContent");
const rsvpForm = document.querySelector("#rsvpForm");
const formStatus = document.querySelector("#formStatus");
const photoSlider = document.querySelector(".photo-slider");
const previousSlideButton = document.querySelector(".slider-arrow.prev");
const nextSlideButton = document.querySelector(".slider-arrow.next");

let slides = [];
let activeSlideIndex = 0;
let slideTimer;

function probeImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// Auto-discover photos named assets/img/photo-1.jpg, photo-2.jpg, ...
// (stops at the first number that is missing).
async function buildSlides() {
  let index = 1;
  while (true) {
    const src = `assets/img/photo-${index}.jpg`;
    const exists = await probeImage(src);
    if (!exists) break;

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    if (index === 1) img.classList.add("is-active");
    photoSlider.insertBefore(img, previousSlideButton);
    index += 1;
  }

  slides = Array.from(photoSlider.querySelectorAll("img"));
}

function revealInvitation() {
  envelopeSection.classList.add("is-open");
  invitationContent.classList.add("is-visible");
  openEnvelope.setAttribute("aria-expanded", "true");
}

function showSlide(index) {
  activeSlideIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
  });
}

function queueNextSlide() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => {
    showSlide(activeSlideIndex + 1);
  }, 4000);
}

function moveSlide(offset) {
  showSlide(activeSlideIndex + offset);
  queueNextSlide();
}

openEnvelope.addEventListener("click", revealInvitation);

openEnvelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    revealInvitation();
  }
});

function initSlider() {
  if (slides.length > 1) {
    showSlide(0);
    previousSlideButton.addEventListener("click", () => moveSlide(-1));
    nextSlideButton.addEventListener("click", () => moveSlide(1));
    photoSlider.addEventListener("mouseenter", () => window.clearInterval(slideTimer));
    photoSlider.addEventListener("mouseleave", queueNextSlide);
    queueNextSlide();
  } else {
    previousSlideButton.hidden = true;
    nextSlideButton.hidden = true;
  }
}

buildSlides().then(initSlider);

document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    trigger.classList.toggle("is-open");
    trigger.nextElementSibling.classList.toggle("is-open");
  });
});

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Thank you! We can't wait to see you!";
  rsvpForm.reset();
});
