const envelopeSection = document.querySelector("#envelopeSection");
const openEnvelope = document.querySelector("#openEnvelope");
const invitationContent = document.querySelector("#invitationContent");
const rsvpForm = document.querySelector("#rsvpForm");
const formStatus = document.querySelector("#formStatus");
const photoSlider = document.querySelector(".photo-slider");
const previousSlideButton = document.querySelector(".slider-arrow.prev");
const nextSlideButton = document.querySelector(".slider-arrow.next");
const countDays = document.querySelector("#countDays");
const countHours = document.querySelector("#countHours");
const countMinutes = document.querySelector("#countMinutes");
const countSeconds = document.querySelector("#countSeconds");

let slides = [];
let activeSlideIndex = 0;
let slideTimer;
let countdownTimer;
const weddingDate = new Date("2026-09-10T00:00:00+05:30");

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
    photoSlider.addEventListener("mouseenter", () =>
      window.clearInterval(slideTimer),
    );
    photoSlider.addEventListener("mouseleave", queueNextSlide);
    queueNextSlide();
  } else {
    previousSlideButton.hidden = true;
    nextSlideButton.hidden = true;
  }
}

buildSlides().then(initSlider);

function padCount(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  if (!countDays || !countHours || !countMinutes || !countSeconds) return;

  const remaining = Math.max(weddingDate.getTime() - Date.now(), 0);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countDays.textContent = padCount(days);
  countHours.textContent = padCount(hours);
  countMinutes.textContent = padCount(minutes);
  countSeconds.textContent = padCount(seconds);

  if (remaining === 0) {
    window.clearInterval(countdownTimer);
  }
}

updateCountdown();
countdownTimer = window.setInterval(updateCountdown, 1000);

// --- RSVP ----------------------------------------------------------------
// Paste your deployed Google Apps Script web-app URL here (ends with /exec).
const RSVP_API =
  "https://script.google.com/macros/s/AKfycby2V_JGtNjQVhYiV-PiYsNKAUJ2SYzWX3hc6_I7Hf3zXFmnKw-hkskCM6_JGMDzhhI93A/exec";

const rsvpGuests = document.querySelector("#rsvpGuests");
const rsvpPartyLabel = document.querySelector("#rsvpPartyLabel");
const rsvpMessage = document.querySelector("#rsvpMessage");

function getRsvpToken() {
  return new URLSearchParams(window.location.search).get("g");
}

function showRsvpMessage(text) {
  rsvpForm.hidden = true;
  rsvpMessage.textContent = text;
}

function renderGuests(guests, attendees) {
  rsvpGuests.innerHTML = "";
  guests.forEach((name, index) => {
    const id = `guest-${index}`;
    const row = document.createElement("label");
    row.className = "guest-toggle";
    row.htmlFor = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = name;
    // Pre-tick attendees from a previous response; otherwise default to coming.
    checkbox.checked = attendees.length ? attendees.includes(name) : true;

    const text = document.createElement("span");
    text.textContent = name;

    row.append(checkbox, text);
    rsvpGuests.appendChild(row);
  });
}

async function loadParty() {
  const token = getRsvpToken();
  if (!token) {
    showRsvpMessage(
      "This RSVP link looks incomplete. Please use the personal link we sent you.",
    );
    return;
  }

  try {
    const response = await fetch(`${RSVP_API}?g=${encodeURIComponent(token)}`);
    const data = await response.json();

    if (!data.ok) {
      showRsvpMessage(
        "We couldn't find your invitation. Please check the link or reach out to us.",
      );
      return;
    }

    rsvpPartyLabel.textContent = data.partyLabel || "";
    renderGuests(data.guests || [], data.attendees || []);
    rsvpForm.hidden = false;

    if (data.responded) {
      formStatus.textContent =
        "You've already responded — submit again to update your answer.";
    }
  } catch (error) {
    showRsvpMessage(
      "Something went wrong loading your invitation. Please try again later.",
    );
  }
}

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = getRsvpToken();
  const attendees = Array.from(
    rsvpGuests.querySelectorAll("input:checked"),
  ).map((input) => input.value);

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  formStatus.textContent = "Sending your response…";

  try {
    // text/plain avoids a CORS preflight that Apps Script can't answer.
    await fetch(RSVP_API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, attendees }),
    });

    formStatus.textContent = attendees.length
      ? "Thank you! We can't wait to celebrate with you."
      : "Thank you for letting us know — you'll be missed!";
  } catch (error) {
    formStatus.textContent =
      "We couldn't save your response. Please try again.";
    submitButton.disabled = false;
  }
});

loadParty();
