import './style.css'

// Burger menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const burgerButton = document.querySelector('.Header_burger');
  const headerLinks = document.querySelector('.HeaderLinks');

  if (!burgerButton || !headerLinks) return;

  const toggleMenu = () => {
    burgerButton.classList.toggle('active');
    headerLinks.classList.toggle('active');
  };

  burgerButton.addEventListener('click', toggleMenu);

  // Ensure menu resets when switching to desktop
  const mediaQuery = window.matchMedia('(min-width: 1025px)');
  const handleViewportChange = () => {
    if (mediaQuery.matches) {
      burgerButton.classList.remove('active');
      headerLinks.classList.remove('active');
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleViewportChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleViewportChange);
  }

  // Normalize absolute URLs only on GitHub Pages (avoid breaking localhost)
  const isGhPages = /github\.io$/i.test(window.location.hostname);
  if (isGhPages) {
    const getRepoBase = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      // For project pages the first segment is the repo name
      return parts.length > 0 ? `/${parts[0]}/` : '/';
    };
    const repoBase = getRepoBase();
    const isAbsoluteHttp = (href) => /^(?:[a-z]+:)?\/\//i.test(href);
    const isSpecial = (href) => href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:');
    const needsPrefix = (v) => typeof v === 'string' && v.startsWith('/') && !v.startsWith('//');

    const prefixAttr = (el, attr) => {
      const v = el.getAttribute(attr);
      if (!v || isAbsoluteHttp(v) || isSpecial(v)) return;
      if (needsPrefix(v)) el.setAttribute(attr, repoBase + v.slice(1));
    };

    document.querySelectorAll('a[href]').forEach((a) => prefixAttr(a, 'href'));
    document.querySelectorAll('img[src]').forEach((img) => prefixAttr(img, 'src'));
    document
      .querySelectorAll('link[rel="icon"][href]')
      .forEach((lnk) => prefixAttr(lnk, 'href'));
  }
 
  // Vacancies: fetch all data from Google Sheets and handle popup/list
  const vacanciesList = document.getElementById('vacancies-list');
  const popupContainer = document.querySelector('.popup_container');
  
  if (vacanciesList || popupContainer) {
    const SHEET_ID = '1VtoZeBUQJJnxB17T1IaIGJui2hl5QrEk1TgAyOMFdgs';
    const SHEET_NAME = 'Лист1';
    const RANGE_ALL = 'A2:I'; // All columns: A-I

    let vacanciesData = []; // Store all vacancy data

    const buildGvizUrl = (sheetId, sheetName, range) => {
      const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`; 
      const params = new URLSearchParams({
        tqx: 'out:json',
        sheet: sheetName,
        range: range
      });
      return base + params.toString();
    };

    const arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="19px" height="38px" viewBox="0 0 19 36" fill="none"><path d="M2 2L17.5081 17.5081C17.7798 17.7798 17.7798 18.2202 17.5081 18.4919L2 34" stroke="#1E1E1E" stroke-width="2.2" stroke-linecap="round"></path></svg>';

    const parseGvizJson = (text) => {
      // GViz wraps JSON like: google.visualization.Query.setResponse({...});
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return null;
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (_) {
        return null;
      }
    };

    const splitByEmptyLines = (text) => {
      if (!text) return [];
      return text.split(/\n\s*\n/).map(point => point.trim()).filter(Boolean);
    };

    const renderTitles = (vacancies) => {
      if (!vacanciesList) return;
      vacanciesList.innerHTML = '';
      vacancies.forEach((vacancy, index) => {
        if (!vacancy.title) return;
        const a = document.createElement('a');
        a.className = 'flex align_center justify_between width_100 background_gray rounded_corners hover_background_brand row_link';
        a.href = `/vacancies/#${index + 1}`;
        a.innerHTML = `${vacancy.title} ${arrowSvg}`;
        
        // Prevent default navigation and show popup instead
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const vacancyId = index;
          const vacancy = vacanciesData[vacancyId];
          
          if (vacancy && popupContainer) {
            // Update URL hash without page reload
            window.location.hash = `#${index + 1}`;
            populatePopup(vacancy);
            popupContainer.style.display = 'flex';
            
            // Hide the list
            if (vacanciesList) {
              vacanciesList.style.display = 'none';
            }
            
            // Hide other sections
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
              if (!section.contains(popupContainer)) {
                section.style.display = 'none';
              }
            });
          }
        });
        
        vacanciesList.appendChild(a);
      });
    };

    const populatePopup = (vacancy) => {
      if (!popupContainer || !vacancy) return;

      // Update title
      const titleEl = popupContainer.querySelector('h1');
      if (titleEl) titleEl.textContent = vacancy.title || 'Название вакансии';

      // Update tags
      const chipsContainer = popupContainer.querySelector('.chips_container');
      if (chipsContainer) {
        chipsContainer.innerHTML = '';
        [vacancy.tag1, vacancy.tag2, vacancy.tag3, vacancy.tag4].forEach(tag => {
          if (tag) {
            const chip = document.createElement('div');
            chip.className = 'chips';
            chip.textContent = tag;
            chipsContainer.appendChild(chip);
          }
        });
      }

      // Update content sections - use direct element selection
      const vacancyContentElements = popupContainer.querySelectorAll('.vacancy_content');
      
      if (vacancyContentElements.length >= 3) {
        // First section: "Что мы предлагаем"
        const whatWeOfferPoints = vacancyContentElements[0].querySelector('.vacancy_points');
        if (whatWeOfferPoints && vacancy.whatWeOffer) {
          const points = splitByEmptyLines(vacancy.whatWeOffer);
          whatWeOfferPoints.innerHTML = '';
          points.forEach(point => {
            const pointEl = document.createElement('div');
            pointEl.className = 'vacancy_point';
            pointEl.textContent = point;
            whatWeOfferPoints.appendChild(pointEl);
          });
        }
        
        // Second section: "Что нужно делать"
        const whatToDoPoints = vacancyContentElements[1].querySelector('.vacancy_points');
        if (whatToDoPoints && vacancy.whatToDo) {
          const points = splitByEmptyLines(vacancy.whatToDo);
          whatToDoPoints.innerHTML = '';
          points.forEach(point => {
            const pointEl = document.createElement('div');
            pointEl.className = 'vacancy_point';
            pointEl.textContent = point;
            whatToDoPoints.appendChild(pointEl);
          });
        }
        
        // Third section: "Кого мы ищем"
        const whoWeSeekPoints = vacancyContentElements[2].querySelector('.vacancy_points');
        if (whoWeSeekPoints && vacancy.whoWeSeek) {
          const points = splitByEmptyLines(vacancy.whoWeSeek);
          whoWeSeekPoints.innerHTML = '';
          points.forEach(point => {
            const pointEl = document.createElement('div');
            pointEl.className = 'vacancy_point';
            pointEl.textContent = point;
            whoWeSeekPoints.appendChild(pointEl);
          });
        }
      }

      // Update HH.ru button
      const hhButton = popupContainer.querySelector('a[href=""]:last-of-type');
      if (hhButton) {
        if (vacancy.hhLink) {
          hhButton.href = vacancy.hhLink;
          hhButton.style.display = '';
        } else {
          hhButton.style.display = 'none';
        }
      }

      // Update form button
      const formButton = popupContainer.querySelector('a[href=""]:first-of-type');
      if (formButton) {
        formButton.href = '/form/';
      }
    };

    const checkUrlAndShowPopup = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#(\d+)$/);
      
      if (match && popupContainer) {
        const vacancyId = parseInt(match[1]) - 1; // Convert to 0-based index
        const vacancy = vacanciesData[vacancyId];
        
        if (vacancy) {
          populatePopup(vacancy);
          popupContainer.style.display = 'flex';
          
          // Hide the list and other sections
          if (vacanciesList) {
            vacanciesList.style.display = 'none';
          }
          const sections = document.querySelectorAll('section');
          sections.forEach(section => {
            if (!section.contains(popupContainer)) {
              section.style.display = 'none';
            }
          });
        } else {
          showListView();
        }
      } else {
        showListView();
      }
    };

    const showListView = () => {
      if (popupContainer) {
        popupContainer.style.display = 'none';
      }
      
      // Show the list and other sections
      if (vacanciesList) {
        vacanciesList.style.display = '';
      }
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = '';
      });
    };

    const url = buildGvizUrl(SHEET_ID, SHEET_NAME, RANGE_ALL);
    fetch(url, { cache: 'no-store' })
      .then((r) => r.text())
      .then((txt) => {
        const data = parseGvizJson(txt);
        const rows = data && data.table && Array.isArray(data.table.rows) ? data.table.rows : [];
        
        vacanciesData = rows.map((row) => {
          const cells = row.c || [];
          
          return {
            title: cells[0] ? cells[0].v : '',        // A: Название вакансии
            tag1: cells[1] ? cells[1].v : '',         // B: Первый Тег  
            tag2: cells[2] ? cells[2].v : '',         // C: Второй Тег
            tag3: cells[3] ? cells[3].v : '',         // D: Третий Тег
            tag4: cells[4] ? cells[4].v : '',         // E: Четвертый Тег
            whatWeOffer: cells[5] ? cells[5].v : '',  // F: Что мы предлагаем
            whatToDo: cells[6] ? cells[6].v : '',     // G: Что нужно делать  
            whoWeSeek: cells[7] ? cells[7].v : '',    // H: Кого мы ищем
            hhLink: cells[8] ? cells[8].v : ''        // I: Вакансия на HH
          };
        }).filter(vacancy => vacancy.title);

        if (vacanciesData.length === 0 && vacanciesList) {
          vacanciesList.innerHTML = '<p class="paragraph">Пока нет открытых вакансий.</p>';
          return;
        }

        renderTitles(vacanciesData);
        checkUrlAndShowPopup();
        
        // Handle vacancy content expansion/collapse
        if (popupContainer) {
          const contentHeaders = popupContainer.querySelectorAll('.vacancy_content_header');
          contentHeaders.forEach(header => {
            header.addEventListener('click', () => {
              const vacancyContent = header.closest('.vacancy_content');
              const openButton = header.querySelector('.open_button');
              const vacancyPoints = vacancyContent.querySelector('.vacancy_points');
              
              if (vacancyContent && openButton && vacancyPoints) {
                const isExpanded = vacancyContent.classList.contains('expanded');
                
                if (isExpanded) {
                  // Collapse: remove expanded class and reset height
                  vacancyContent.classList.remove('expanded');
                  openButton.classList.remove('active');
                  vacancyContent.style.height = ''; // Let CSS handle collapsed height
                } else {
                  // Expand: calculate full height
                  const headerHeight = header.offsetHeight;
                  const pointsHeight = vacancyPoints.scrollHeight;
                  const padding = 40; // Extra padding
                  const totalHeight = headerHeight + pointsHeight + padding;
                  
                  vacancyContent.classList.add('expanded');
                  openButton.classList.add('active');
                  vacancyContent.style.height = `${totalHeight}px`;
                }
              }
            });
          });
        }
        
        // Handle back button in popup
        const backButton = popupContainer?.querySelector('.back_button');
        if (backButton) {
          backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '';
            showListView();
          });
        }
      })
      .catch(() => {
        if (vacanciesList) {
          vacanciesList.innerHTML = '<p class="paragraph">Не удалось загрузить вакансии. Повторите попытку позже.</p>';
        }
      });

    // Handle hash changes (direct links and browser back/forward)
    window.addEventListener('hashchange', checkUrlAndShowPopup);
  }

  // Handle FAQ content expansion/collapse on main page
  const faqContentHeaders = document.querySelectorAll('.faq_content_header');
  faqContentHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const faqContent = header.closest('.faq_content');
      const openButton = header.querySelector('.open_button');
      const faqPoint = faqContent.querySelector('.faq_point');
      
      if (faqContent && openButton && faqPoint) {
        const isExpanded = faqContent.classList.contains('expanded');
        
        if (isExpanded) {
          // Collapse: remove expanded class and reset height
          faqContent.classList.remove('expanded');
          openButton.classList.remove('active');
          faqContent.style.height = ''; // Let CSS handle collapsed height
        } else {
          // Expand: calculate full height
          const headerHeight = header.offsetHeight;
          const pointHeight = faqPoint.scrollHeight;
          const padding = 40; // Extra padding
          const totalHeight = headerHeight + pointHeight + padding;
          
          faqContent.classList.add('expanded');
          openButton.classList.add('active');
          faqContent.style.height = `${totalHeight}px`;
        }
      }
    });
  });

  // Handle "Open all FAQ" toggle button
  const openFaqButton = document.querySelector('.open_faq');
  if (openFaqButton) {
    openFaqButton.addEventListener('click', () => {
      const faqContainer = openFaqButton.parentElement; // Get the parent div with class "flex column"
      const isShowingAll = faqContainer && faqContainer.classList.contains('show-all');
      
      if (isShowingAll) {
        // Hide extra FAQ items, show only first 4
        faqContainer.classList.remove('show-all');
        openFaqButton.classList.remove('active');
        openFaqButton.innerHTML = `Открыть все вопросы <svg xmlns="http://www.w3.org/2000/svg" width="45px" height="45px" viewBox="0 0 65 65" fill="none">
          <path d="M49 27L33.4919 42.5081C33.2202 42.7798 32.7798 42.7798 32.5081 42.5081L17 27" stroke="#8B8B8B" stroke-width="2.2" stroke-linecap="round"></path>
        </svg>`;
      } else {
        // Show all FAQ items
        faqContainer.classList.add('show-all');
        openFaqButton.classList.add('active');
        openFaqButton.innerHTML = `Скрыть вопросы <svg xmlns="http://www.w3.org/2000/svg" width="45px" height="45px" viewBox="0 0 65 65" fill="none">
          <path d="M49 27L33.4919 42.5081C33.2202 42.7798 32.7798 42.7798 32.5081 42.5081L17 27" stroke="#8B8B8B" stroke-width="2.2" stroke-linecap="round"></path>
        </svg>`;
      }
    });
  }

  // Form: validation and error handling on form/contact pages
  const form = document.querySelector('form.form_container');
  if (form) {
    const submitButton = form.querySelector('.CTA_2_button');
    const inputs = Array.from(form.querySelectorAll('.form_inputs input'));

    const validatorsByType = {
      name: (v) => v.trim().length >= 2,
      // Accept any formatting; require 11 digits starting with 7
      phone: (v) => {
        const digits = (v || '').replace(/\D/g, '');
        // Consider valid only when formatted fully: +7 (XXX) XXX XX XX => 11 digits starting with 7
        return digits.length === 11 && digits.startsWith('7');
      },
      vacancy: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      // Allow unicode and simple domain like "домен.рф" or "site.ru"
      site: (v) => /^\S+\.\S{2,}$/.test(v.trim())
    };

    // Phone mask helpers
    const extractDigits = (value) => (value || '').replace(/\D/g, '');
    const normalizePhoneDigits = (value) => {
      let digits = extractDigits(value);
      if (!digits) return '';
      // If starts with 8 -> replace with 7; if starts with not 7/8 and length >= 10, prepend 7
      if (digits[0] === '8') digits = '7' + digits.slice(1);
      else if (digits[0] !== '7') digits = '7' + digits;
      return digits.slice(0, 11);
    };
    const formatPhone = (value) => {
      const d = normalizePhoneDigits(value);
      if (!d) return '';
      const parts = [d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10]];
      // Build +7 (XXX) XXX XX XX progressively
      let out = '+7';
      if (parts[0] !== undefined) out += ' (' + parts[0];
      if (parts[1] !== undefined) out += parts[1];
      if (parts[2] !== undefined) out += parts[2] + ')';
      if (parts[3] !== undefined) out += ' ' + parts[3];
      if (parts[4] !== undefined) out += parts[4];
      if (parts[5] !== undefined) out += parts[5];
      if (parts[6] !== undefined) out += ' ' + parts[6];
      if (parts[7] !== undefined) out += parts[7];
      if (parts[8] !== undefined) out += ' ' + parts[8];
      if (parts[9] !== undefined) out += parts[9];
      return out;
    };

    const resolveType = (input) => {
      const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      if (placeholder.includes('электронная почта')) return 'email';
      if (placeholder.includes('номер телефона')) return 'phone';
      if (placeholder.includes('интернет-магазин') || placeholder.includes('сайт')) return 'site';
      if (placeholder.includes('вакансия') || placeholder.includes('интересующее направление')) return 'vacancy';
      if (placeholder.includes('как вас зовут')) return 'name';
      return 'text';
    };

    const isRequired = (input) => {
      // считаем обязательными те поля, у которых есть соседний .error
      const wrapper = input.parentElement;
      return !!(wrapper && wrapper.querySelector('.error'));
    };

    const showError = (input, show) => {
      const wrapper = input.parentElement;
      const errorEl = wrapper ? wrapper.querySelector('.error') : null;
      if (errorEl) errorEl.classList.toggle('active', !!show);
    };

    const isValueValid = (input) => {
      const type = resolveType(input);
      const validator = validatorsByType[type];
      const valid = validator ? validator(input.value) : input.value.trim() !== '';
      return !isRequired(input) ? true : valid;
    };

    const validateInput = (input) => {
      const valid = isValueValid(input);
      if (isRequired(input)) showError(input, !valid);
      return valid;
    };

    const updateSubmitState = () => {
      const requiredInputs = inputs.filter((i) => isRequired(i));
      const allValid = requiredInputs.every((i) => isValueValid(i));
      if (submitButton) submitButton.classList.toggle('disabled', !allValid);
    };

    inputs.forEach((input) => {
      // Apply phone mask on input/paste
      if (resolveType(input) === 'phone') {
        input.setAttribute('inputmode', 'tel');
        const applyMask = () => {
          const formatted = formatPhone(input.value);
          input.value = formatted;
        };
        input.addEventListener('input', () => {
          applyMask();
          // If error shown, revalidate live
          const wrapper = input.parentElement;
          const err = wrapper && wrapper.querySelector('.error');
          if (err && err.classList.contains('active')) validateInput(input);
          updateSubmitState();
        });
        input.addEventListener('paste', (e) => {
          // Delay to let the paste apply, then mask
          requestAnimationFrame(() => {
            applyMask();
            updateSubmitState();
          });
        });
        // Initial mask if there is prefilled value
        if (input.value) input.value = formatPhone(input.value);
      }

      input.addEventListener('blur', () => {
        validateInput(input);
        updateSubmitState();
      });
      input.addEventListener('input', () => {
        // Если ошибка показана — переvalidate на вводе, чтобы убрать, когда исправили
        const wrapper = input.parentElement;
        const err = wrapper && wrapper.querySelector('.error');
        if (err && err.classList.contains('active')) validateInput(input);
        updateSubmitState();
      });
    });

    form.addEventListener('submit', (e) => {
      const requiredInputs = inputs.filter((i) => isRequired(i));
      const allValid = requiredInputs.every((i) => validateInput(i));
      if (!allValid) e.preventDefault();
    });

    // Initialize state on load
    updateSubmitState();
  }
});
