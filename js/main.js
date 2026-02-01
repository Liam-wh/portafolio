document.addEventListener('DOMContentLoaded', () => {

    // 1. Inicialización de AOS (Animaciones repetitivas)
    AOS.init({ 
        duration: 1000, 
        once: false, // Permite que se anime cada vez que haces scroll
        offset: 100,
        mirror: true // Anima también al hacer scroll hacia arriba
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
    const bsCollapse = new bootstrap.Collapse(menuToggle, {toggle: false});
    navLinksClick.forEach((l) => {
        l.addEventListener('click', () => {
            if (menuToggle.classList.contains('show')) bsCollapse.hide();
        });
    });

    // 6. Botón "Volver Arriba"
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
    });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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

    // 8. Seguridad (Bloquear clic derecho en imágenes)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // 9. API de Likes (Backend Propio en Render)
    const likeBtn = document.getElementById('likeBtn');
    const likesCountSpan = document.getElementById('likes-count');
    const likeIcon = document.getElementById('like-icon');

    if (likeBtn) {
        const API_URL = likeBtn.getAttribute('data-api-url');
        
        // Cargar likes iniciales
        fetch(API_URL)
            .then(res => res.json())
            .then(data => { likesCountSpan.textContent = data.count; })
            .catch(() => { likesCountSpan.textContent = "-"; });

        // Dar like
        likeBtn.addEventListener('click', () => {
            likeIcon.classList.add('heart-beat');
            setTimeout(() => likeIcon.classList.remove('heart-beat'), 500);
            likeBtn.style.pointerEvents = 'none';

            fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'} })
                .then(res => res.json())
                .then(data => {
                    likesCountSpan.textContent = data.count;
                    likesCountSpan.classList.add('text-accent');
                })
                .catch(err => console.error(err))
                .finally(() => { likeBtn.style.pointerEvents = 'auto'; });
        });
    }

    // 10. API de Geolocalización (Nueva API más estable)
    const locationSpan = document.getElementById('visitor-location');
    
    fetch('https://ipwhois.app/json/')
        .then(res => { 
            if(!res.ok) throw new Error('Error de red'); 
            return res.json(); 
        })
        .then(data => {
            // Esta API devuelve 'success' true/false
            if (!data.success) throw new Error('Fallo en la API');

            const city = data.city || 'Ubicación';
            const country = data.country || 'Desconocida';
            locationSpan.innerHTML = `Conectado desde: <strong>${city}, ${country}</strong>`;
        })
        .catch((err) => { 
            console.error("Error GeoIP:", err); // Para que ver en consola si falla
            locationSpan.innerHTML = 'Ubicación no disponible'; 
            // Opcional: Ocultar el icono si falla
            const geoIcon = document.getElementById('geo-icon');
            if(geoIcon) geoIcon.style.opacity = '0.2';
        });

});