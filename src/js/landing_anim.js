// Keep exactly one .row.active: the one closest to the vertical viewport center

const rows = Array.from(document.querySelectorAll(".row"));
const circles = Array.from(document.querySelectorAll(".circle"));
const gifs = Array.from(document.querySelectorAll(".gif_landing"));
const header2 = document.querySelector(".landing_gifki_2_header");
const landingGifki2Section = document.querySelector(".landing_gifki_2");
const firstRowInSection2 = landingGifki2Section
  ? landingGifki2Section.querySelector(".row")
  : null;

let scheduled = false;
let lastActiveRow = document.querySelector(".row.active");
let lastActiveCircle = null;
let lastActiveGif = null;

// Initialize active circle and gif based on active row
const initialActiveRowIndex = rows.indexOf(lastActiveRow);
if (initialActiveRowIndex !== -1) {
  if (circles[initialActiveRowIndex]) {
    lastActiveCircle = circles[initialActiveRowIndex];
    lastActiveCircle.classList.add("active");
  }
  if (gifs[initialActiveRowIndex]) {
    lastActiveGif = gifs[initialActiveRowIndex];
    lastActiveGif.classList.add("active");
  }
}

function updateActiveRows() {
  scheduled = false;
  const viewportCenterY = window.innerHeight / 2;

  // Pick the row intersecting center with the smallest distance to center
  let bestCandidate = null;
  let bestDistance = Infinity;

  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    const intersectsCenter =
      rect.top <= viewportCenterY && rect.bottom >= viewportCenterY;
    if (intersectsCenter) {
      const rowCenter = (rect.top + rect.bottom) / 2;
      const distance = Math.abs(rowCenter - viewportCenterY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = row;
      }
    }
  }

  // Handle header2 activation logic
  if (header2 && landingGifki2Section && firstRowInSection2) {
    const sectionRect = landingGifki2Section.getBoundingClientRect();
    const isSectionVisible =
      sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

    // Add active if first row in section2 intersects center
    if (bestCandidate === firstRowInSection2) {
      header2.classList.add("active");
    }
    // Remove active only if section is not visible
    else if (!isSectionVisible) {
      header2.classList.remove("active");
    }
  }

  if (bestCandidate && bestCandidate !== lastActiveRow) {
    // Remove active from previous row, circle, and gif
    if (lastActiveRow) lastActiveRow.classList.remove("active");
    if (lastActiveCircle) lastActiveCircle.classList.remove("active");
    if (lastActiveGif) lastActiveGif.classList.remove("active");

    // Add active to new row and corresponding circle and gif
    bestCandidate.classList.add("active");
    const newActiveIndex = rows.indexOf(bestCandidate);

    if (newActiveIndex !== -1) {
      if (circles[newActiveIndex]) {
        circles[newActiveIndex].classList.add("active");
        lastActiveCircle = circles[newActiveIndex];
      }
      if (gifs[newActiveIndex]) {
        gifs[newActiveIndex].classList.add("active");
        lastActiveGif = gifs[newActiveIndex];
      }
    }

    lastActiveRow = bestCandidate;
  }
}

function requestUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateActiveRows);
}

// Initial run (in case the page loads scrolled)
updateActiveRows();

// Update on scroll and resize
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);