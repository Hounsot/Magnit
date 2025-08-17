// Keep exactly one .row.active: the one closest to the vertical viewport center

const rows = Array.from(document.querySelectorAll(".row"));
const circles = Array.from(document.querySelectorAll(".circle"));
const gifs = Array.from(document.querySelectorAll(".gif_landing"));
const header2 = document.querySelector(".landing_gifki_2_header");
const landingGifki2Section = document.querySelector(".landing_gifki_2");
const firstRowInSection2 = landingGifki2Section
  ? landingGifki2Section.querySelector(".row")
  : null;

// Добавляем селектор для box элементов
const boxes = Array.from(document.querySelectorAll(".box"));

let scheduled = false;
let lastActiveRow = null; // Изменено: убираем автопоиск активного элемента
let lastActiveCircle = null;
let lastActiveGif = null;
let header2HasBeenActivated = false; // Флаг для отслеживания активации header2

// Убираем блок автоинициализации (строки 17-28)

function updateActiveRows() {
  scheduled = false;
  const viewportCenterY = window.innerHeight / 2;
  const edgeThreshold = 400; // Увеличиваем с 50 до 200 пикселей

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
  if (header2) {
    const header2Rect = header2.getBoundingClientRect();
    const header2IsVisible =
      header2Rect.top < window.innerHeight && header2Rect.bottom > 0;
    const header2IntersectsCenter =
      header2Rect.top <= viewportCenterY &&
      header2Rect.bottom >= viewportCenterY;

    // Активируем header2, если он проходит через центр экрана
    if (header2IntersectsCenter && !header2HasBeenActivated) {
      header2.classList.add("active");
      header2HasBeenActivated = true;
    }

    // Деактивируем header2 только если он полностью невидим
    if (!header2IsVisible && header2HasBeenActivated) {
      header2.classList.remove("active");
      header2HasBeenActivated = false;
    }
  }

  // Логика для мобильных экранов: переключение default/hover в box элементах
  if (window.innerWidth < 769) {
    boxes.forEach((box) => {
      const boxRect = box.getBoundingClientRect();
      const boxIntersectsCenter =
        boxRect.top <= viewportCenterY && boxRect.bottom >= viewportCenterY;

      const defaultElement = box.querySelector(".default");
      const hoverElement = box.querySelector(".hover");

      if (boxIntersectsCenter) {
        // Box пересекает центр - показываем hover, скрываем default
        if (defaultElement) defaultElement.style.display = "none";
        if (hoverElement) hoverElement.style.display = "flex";
      } else {
        // Box не пересекает центр - показываем default, скрываем hover
        if (defaultElement) defaultElement.style.display = "flex";
        if (hoverElement) hoverElement.style.display = "none";
      }
    });
  } else {
    // На больших экранах возвращаем дефолтное состояние
    boxes.forEach((box) => {
      const defaultElement = box.querySelector(".default");
      const hoverElement = box.querySelector(".hover");

      if (defaultElement) defaultElement.style.display = "flex";
      if (hoverElement) hoverElement.style.display = "none";
    });
  }

  // Проверяем только текущий активный элемент на близость к краю для деактивации
  if (lastActiveRow) {
    const lastActiveRect = lastActiveRow.getBoundingClientRect();
    const lastActiveTooCloseToTop = lastActiveRect.bottom < edgeThreshold;
    const lastActiveTooCloseToBottom =
      lastActiveRect.top > window.innerHeight - edgeThreshold;
    const lastActiveTooCloseToEdge =
      lastActiveTooCloseToTop || lastActiveTooCloseToBottom;

    if (lastActiveTooCloseToEdge) {
      lastActiveRow.classList.remove("active");
      if (lastActiveCircle) lastActiveCircle.classList.remove("active");
      if (lastActiveGif) lastActiveGif.classList.remove("active");

      lastActiveRow = null;
      lastActiveCircle = null;
      lastActiveGif = null;
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
