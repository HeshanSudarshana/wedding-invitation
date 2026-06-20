const envelopeSection = document.querySelector("#envelopeSection");
const openEnvelope = document.querySelector("#openEnvelope");
const invitationContent = document.querySelector("#invitationContent");
const rsvpForm = document.querySelector("#rsvpForm");
const formStatus = document.querySelector("#formStatus");

function revealInvitation() {
  envelopeSection.classList.add("is-open");
  invitationContent.classList.add("is-visible");
  openEnvelope.setAttribute("aria-expanded", "true");
}

openEnvelope.addEventListener("click", revealInvitation);

openEnvelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    revealInvitation();
  }
});

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
