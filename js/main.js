document.addEventListener('DOMContentLoaded', () => {

    // 1. Inicialización de AOS
    AOS.init({ 
        duration: 1000, 
        once: true,
        offset: 100,
        mirror: false
    });

    // 2. Barras de Progreso (Efecto "Llenado y Vaciado" infinito)
    const progressBars = document.querySelectorAll('.progress-bar');
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const bar = entry.target;
            const targetWidth = bar.getAttribute('data-width');
            // Si entra en pantalla se llena, si sale se vacía
            if (entry.isIntersecting) {
                bar.style.width = targetWidth;
            } else {
                bar.style.width = '0%';
            }
        });
    }, { threshold: 0.1 });
    progressBars.forEach(bar => barObserver.observe(bar));

    // 3. Menú Activo (ScrollSpy Manual)
    const sections = document.querySelectorAll("section[id]");
    const menuLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const navbar = document.getElementById('mainNavbar');
    const navHeight = (navbar ? navbar.offsetHeight : 80) + 30;

    function activeMenu() {
        let currentSectionId = "";
        const scrollPosition = window.scrollY;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - navHeight;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute("id");
            }
        });

        menuLinks.forEach((link) => {
            link.classList.remove("active");
            if (currentSectionId && link.getAttribute("href") === "#" + currentSectionId) {
                link.classList.add("active");
            }
        });

        // Forzar "Inicio" activo si estamos arriba del todo
        if (scrollPosition < 100) {
            menuLinks.forEach(l => l.classList.remove('active'));
            const homeLink = document.querySelector('.navbar-nav .nav-link[href="#inicio"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }
    window.addEventListener("scroll", activeMenu);
    setTimeout(activeMenu, 100);

    // 4. Efecto Typewriter (Texto que se escribe solo)
    const textElement = document.querySelector('.typewriter-text');
    const phrases = ['Ingeniero de Sistemas', 'Software Developer', 'Network & Infrastructure', 'Backend Java & Python'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        if (!textElement) return;
        const currentPhrase = phrases[phraseIndex];
        let typeSpeed = isDeleting ? 50 : 100;

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pausa al terminar frase
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    if (textElement) type();

    // 5. Navegación Móvil (Cerrar menú al hacer clic)
    const navLinksClick = document.querySelectorAll('.nav-link-click');
    const menuToggle = document.getElementById('navbarNav');
    const bsCollapse = menuToggle ? new bootstrap.Collapse(menuToggle, {toggle: false}) : null;
    navLinksClick.forEach((l) => {
        l.addEventListener('click', () => {
            if (menuToggle && bsCollapse && menuToggle.classList.contains('show')) bsCollapse.hide();
        });
    });

    // 6. Botón "Volver Arriba"
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 7. Formulario de Contacto (AJAX)
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
            submitBtn.disabled = true;

            fetch("https://formsubmit.co/ajax/williamhuacotoh@gmail.com", {
                method: "POST",
                body: new FormData(contactForm)
            })
            .then(res => res.json())
            .then(() => {
                successMessage.classList.remove('d-none');
                contactForm.reset();
                setTimeout(() => {
                    successMessage.classList.add('d-none');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }, 5000);
            })
            .catch(err => {
                console.error(err);
                submitBtn.innerHTML = "Error. Intenta de nuevo.";
                submitBtn.disabled = false;
            });
        });
    }

    // 8. API de Likes (Backend Propio en Render)
    const likeBtn = document.getElementById('likeBtn');
    const likesCountSpan = document.getElementById('likes-count');
    const likeIcon = document.getElementById('like-icon');

    if (likeBtn) {
        const API_URL = likeBtn.getAttribute('data-api-url');
        const showLikesCount = (count) => {
            if (!likesCountSpan || count === undefined || count === null || Number.isNaN(Number(count))) return;
            likesCountSpan.textContent = count;
            likesCountSpan.classList.remove('d-none');
        };
        
        // Cargar likes iniciales
        fetch(API_URL)
            .then(res => res.json())
            .then(data => showLikesCount(data.count))
            .catch(err => console.error(err));

        // Dar like
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.remove('liked');
            void likeBtn.offsetWidth;
            likeBtn.classList.add('liked');
            likeIcon.classList.add('heart-beat');
            setTimeout(() => likeIcon.classList.remove('heart-beat'), 500);
            likeBtn.style.pointerEvents = 'none';

            fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'} })
                .then(res => res.json())
                .then(data => {
                    showLikesCount(data.count);
                    if (likesCountSpan) likesCountSpan.classList.add('text-accent');
                })
                .catch(err => console.error(err))
                .finally(() => {
                    likeBtn.style.pointerEvents = 'auto';
                    setTimeout(() => likeBtn.classList.remove('liked'), 850);
                });
        });
    }

    // 9. API de Geolocalización
    const locationSpan = document.getElementById('visitor-location');
    const geoIcon = document.getElementById('geo-icon');

    if (locationSpan) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        fetch('https://ipapi.co/json/', { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error('Error de red');
                return res.json();
            })
            .then(data => {
                const city = data.city || 'Ubicación';
                const country = data.country_name || data.country || 'desconocida';
                locationSpan.textContent = '';
                locationSpan.append('Conectado desde: ');
                const strong = document.createElement('strong');
                strong.textContent = `${city}, ${country}`;
                locationSpan.append(strong);
            })
            .catch((err) => {
                console.error("Error GeoIP:", err);
                locationSpan.textContent = 'Ubicación no disponible';
                if (geoIcon) geoIcon.style.opacity = '0.2';
            })
            .finally(() => clearTimeout(timeoutId));
    }

    // 10. Descarga privada del CV
    const secretTrigger = document.getElementById('secretCvTrigger');
    const secretInput = document.getElementById('secretCvKey');
    const secretError = document.getElementById('secretCvError');
    const secretDownload = document.getElementById('secretCvDownload');
    const secretModalEl = document.getElementById('secretCvModal');
    const cvPath = 'docs/cv_William_Huacoto.pdf';

    if (secretTrigger && secretModalEl && secretInput && secretDownload) {
        const secretModal = new bootstrap.Modal(secretModalEl);

        function resetSecretModal() {
            secretInput.value = '';
            if (secretError) secretError.classList.add('d-none');
        }

        function downloadCv() {
            if (secretInput.value.trim() !== '6001') {
                if (secretError) secretError.classList.remove('d-none');
                secretInput.focus();
                return;
            }

            const downloadLink = document.createElement('a');
            downloadLink.href = cvPath;
            downloadLink.download = 'CV_William_Huacoto.pdf';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            secretModal.hide();
        }

        secretTrigger.addEventListener('click', () => {
            resetSecretModal();
            secretModal.show();
        });

        secretModalEl.addEventListener('shown.bs.modal', () => secretInput.focus());
        secretInput.addEventListener('input', () => {
            if (secretError) secretError.classList.add('d-none');
        });
        secretInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') downloadCv();
        });
        secretDownload.addEventListener('click', downloadCv);
    }

});
