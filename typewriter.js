document.addEventListener("DOMContentLoaded", () => {
  const phrases = [
    "Learning JavaScript.",
    "Building Web Applications.",
    "Exploring New Technologies.",
    "Learning to code.",
  ];

  const typingElement = document.getElementById("typing-text");
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    const visibleText = currentPhrase.substring(0, charIndex);

    typingElement.innerHTML = visibleText + '<span class="cursor">|</span>';

    if (!isDeleting && charIndex < currentPhrase.length) {
      charIndex++;
      setTimeout(typeEffect, 80);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, 40);
    } else {
      if (!isDeleting) {
        isDeleting = true;
        setTimeout(typeEffect, 2000); 
      } else {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeEffect, 500);
      }
    }
  }

  typeEffect();
});
