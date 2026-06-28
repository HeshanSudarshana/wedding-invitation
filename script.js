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
  // The opening click counts as a user gesture, so playback is allowed here.
  musicToggle.classList.add("is-active");
  playMusic();
}

// --- Background music ----------------------------------------------------
const bgMusic = document.querySelector("#bgMusic");
const musicToggle = document.querySelector("#musicToggle");

function setMusicState(playing) {
  musicToggle.classList.toggle("is-paused", !playing);
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
}

function playMusic() {
  const attempt = bgMusic.play();
  if (attempt && typeof attempt.then === "function") {
    attempt.then(() => setMusicState(true)).catch(() => setMusicState(false));
  } else {
    setMusicState(true);
  }
}

musicToggle.addEventListener("click", () => {
  if (bgMusic.paused) {
    playMusic();
  } else {
    bgMusic.pause();
    setMusicState(false);
  }
});

// Keep the icon honest if playback ends or is interrupted by the browser.
bgMusic.addEventListener("pause", () => setMusicState(false));
bgMusic.addEventListener("play", () => setMusicState(true));

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
  "https://script.google.com/macros/s/AKfycbwVj68aDCfLf29DFpdA1B7s4ez-M1beRIUvvDd6sD9kjcGhNp5FoviO9Mr8mrXg4nEP/exec";

const rsvpPartyLabel = document.querySelector("#rsvpPartyLabel");
const rsvpMessage = document.querySelector("#rsvpMessage");
const attendYes = document.querySelector("#attendYes");
const attendNo = document.querySelector("#attendNo");
const rsvpCount = document.querySelector("#rsvpCount");
const rsvpCountInput = document.querySelector("#rsvpCountInput");
const rsvpCountHint = document.querySelector("#rsvpCountHint");
const countMinus = document.querySelector("#countMinus");
const countPlus = document.querySelector("#countPlus");

// How many seats this party was invited to fill (set when the party loads).
let maxCount = 1;

function getRsvpToken() {
  return new URLSearchParams(window.location.search).get("g");
}

function showRsvpMessage(text) {
  rsvpForm.hidden = true;
  rsvpMessage.textContent = text;
}

function clampCount(value) {
  if (Number.isNaN(value)) value = 1;
  return Math.min(Math.max(value, 1), maxCount);
}

function getCount() {
  return clampCount(parseInt(rsvpCountInput.value, 10));
}

function setCount(value) {
  const count = clampCount(value);
  rsvpCountInput.value = String(count);
  countMinus.disabled = count <= 1;
  countPlus.disabled = count >= maxCount;
}

// The count picker only matters when accepting AND more than one seat was
// reserved — a single-seat invite has nothing to choose.
function updateCountVisibility() {
  rsvpCount.hidden = !(attendYes.checked && maxCount > 1);
}

countMinus.addEventListener("click", () => setCount(getCount() - 1));
countPlus.addEventListener("click", () => setCount(getCount() + 1));
attendYes.addEventListener("change", updateCountVisibility);
attendNo.addEventListener("change", updateCountVisibility);

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
    maxCount = Math.max(parseInt(data.maxCount, 10) || 1, 1);
    if (maxCount > 1) {
      rsvpCountHint.textContent = `We've reserved up to ${maxCount} seats for your party.`;
    }

    // Restore a previous answer if there is one, otherwise default to accepting
    // with the whole party coming.
    if (data.responded) {
      if (data.attending) {
        attendYes.checked = true;
        setCount(data.comingCount || maxCount);
      } else {
        attendNo.checked = true;
      }
      formStatus.textContent =
        "You've already responded — submit again to update your answer.";
    } else {
      attendYes.checked = true;
      setCount(maxCount);
    }
    updateCountVisibility();

    rsvpForm.hidden = false;
  } catch (error) {
    showRsvpMessage(
      "Something went wrong loading your invitation. Please try again later.",
    );
  }
}

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = getRsvpToken();

  const attending = attendYes.checked;
  if (!attending && !attendNo.checked) {
    formStatus.textContent = "Please let us know if you can make it.";
    return;
  }
  // Declining the whole party is count 0; a single-seat invite is always 1.
  const count = attending ? (maxCount > 1 ? getCount() : 1) : 0;

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  formStatus.textContent = "Sending your response…";

  try {
    // text/plain avoids a CORS preflight that Apps Script can't answer.
    await fetch(RSVP_API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, attending, count }),
    });

    formStatus.textContent = attending
      ? "Thank you! We can't wait to celebrate with you."
      : "Thank you for letting us know — you'll be missed!";
  } catch (error) {
    formStatus.textContent =
      "We couldn't save your response. Please try again.";
  } finally {
    // Re-enable so guests can update their answer (the backend upserts).
    submitButton.disabled = false;
  }
});

loadParty();
