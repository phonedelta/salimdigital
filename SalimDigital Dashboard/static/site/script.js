// ============ DARK MODE THEME TOGGLE ============
function initThemeToggle() {
    const themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;

    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('dark');
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIcon('light');
    }

    // Toggle theme on button click
    themeBtn.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const newTheme = isDarkMode ? 'dark' : 'light';
        
        // Save preference
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;
    
    const icon = themeBtn.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    // Also update mobile theme button
    const mobileThemeBtn = document.getElementById('mobileThemeBtn');
    if (mobileThemeBtn) {
        const mobileIcon = mobileThemeBtn.querySelector('i');
        if (theme === 'dark') {
            mobileIcon.classList.remove('fa-moon');
            mobileIcon.classList.add('fa-sun');
        } else {
            mobileIcon.classList.remove('fa-sun');
            mobileIcon.classList.add('fa-moon');
        }
    }
}

// Initialize theme on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

// ============ PAGE NAVIGATION ============
function showPage(pageId, product) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });


    // Show selected page or scroll to section
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        // Si la page n'existe pas, scroll vers la section (ex: testimonials)
        const section = document.getElementById(pageId) || document.querySelector(`section#${pageId}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Sélection automatique du produit si précisé
    if (pageId === 'order' && product) {
        const select = document.getElementById('product');
        if (select) {
            select.value = product;
        }
    }
}

// Function to close mobile menu
function closeMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
    }
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
    }
}

// HAMBURGER MENU
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
    }

    // Close hamburger menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('nav') && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });

    // Mobile theme toggle
    const mobileThemeBtn = document.getElementById('mobileThemeBtn');
    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', function () {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            const newTheme = isDarkMode ? 'dark' : 'light';
            
            // Save preference
            localStorage.setItem('theme', newTheme);
            
            // Update icons for both desktop and mobile
            const themeBtn = document.getElementById('themeBtn');
            if (themeBtn) {
                const icon = themeBtn.querySelector('i');
                if (newTheme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
            
            const icon = mobileThemeBtn.querySelector('i');
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }

            // Close hamburger menu after theme change
            if (navMenu.style.display === 'flex') {
                navMenu.style.display = 'none';
            }
        });
    }

    // Navbar scroll effect - PRECISE STATE MANAGEMENT
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // Appliquer la classe scrolled SEULEMENT si scrollY > 50
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });



    // ORDER FORM SUBMISSION
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitButton = orderForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

            // Collecte des données du formulaire avec validation
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const product = document.getElementById('product').value;
            const quantity = document.getElementById('quantity').value;

            // Validation des champs requis
            if (!fullName) {
                alert('Veuillez saisir votre nom complet.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            if (!email) {
                alert('Veuillez saisir votre email.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            if (!phone) {
                alert('Veuillez saisir votre numéro de téléphone.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            if (!product) {
                alert('Veuillez sélectionner un produit.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            const formData = {
                timestamp: new Date().toISOString(),
                fullName: fullName,
                email: email,
                phone: phone,
                product: product,
                quantity: quantity
            };

            console.log('📤 Données validées:', formData);

            try {
                // Envoyer la commande au serveur local
                const response = await fetch('/submit-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(formData)
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de l\'envoi de la commande');
                }

                const result = await response.json();
                console.log('✅ Commande envoyée:', result);

                // Réinitialisation du formulaire et message de succès
                orderForm.reset();
                showOrderSuccess();

                // Réactivation bouton et restauration texte
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;

            } catch (error) {
                console.error('❌ Erreur lors de l\'envoi:', error);
                alert('Erreur: ' + (error.message || error) + '\nVérifiez la console (F12) pour plus de détails.');
                
                // Réactivation du bouton
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    function showOrderSuccess() {
        const form = document.getElementById('orderForm');
        const successMessage = document.getElementById('successMessage');

        if (form && successMessage) {
            form.style.display = 'none';
            successMessage.style.display = 'block';
        }
    }
});

// SMOOTH SCROLL FOR NAVIGATION LINKS
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Don't preventDefault for links that trigger function calls
            if (this.onclick && this.onclick.toString().includes('showPage')) {
                return;
            }

            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// ADD ANIMATION ON SCROLL
window.addEventListener('scroll', function () {
    const cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');

    cards.forEach(card => {
        const cardPosition = card.getBoundingClientRect();
        const isVisible = cardPosition.top < window.innerHeight - 100;

        if (isVisible) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// INITIALIZE SCROLL ANIMATIONS
document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// LIGHT BOX EFFECT ON HOVER
document.addEventListener('DOMContentLoaded', function () {
    const hoverElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');

    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            this.style.cursor = 'pointer';
        });
    });
});
