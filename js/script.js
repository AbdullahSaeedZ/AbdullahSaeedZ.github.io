        // Wait for the entire HTML document to be loaded and parsed
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar');

            // --- Theme Toggle Functionality ---
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            themeToggleBtn.addEventListener('click', () => { // When the theme button is clicked
                const body = document.body;
                const themeIcon = document.getElementById('theme-icon');
                const currentTheme = body.getAttribute('data-theme');

                if (currentTheme === 'dark') {
                    body.setAttribute('data-theme', 'light');
                    themeIcon.className = 'fas fa-sun';
                } else {
                    body.setAttribute('data-theme', 'dark');
                    themeIcon.className = 'fas fa-moon';
                }
            });

            // --- Sidebar Toggle for Mobile Devices ---
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            mobileMenuBtn.addEventListener('click', () => { // When the mobile menu button is clicked
                sidebar.classList.toggle('open');
            });

            // Helper function to explicitly close the sidebar
            const closeSidebar = () => {
                sidebar.classList.remove('open');
            };

            let projectObserver = null; // To hold the IntersectionObserver instance

            // --- Page Navigation Logic ---
            const showPage = (pageId) => {
                // If no pageId is provided, default to 'home'
                if (!pageId) {
                    pageId = 'home';
                }

                // Disconnect any existing project observer before changing pages
                if (projectObserver) {
                    projectObserver.disconnect();
                    projectObserver = null;
                }

                // Hide all pages
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });

                // Show the selected page
                const pageToShow = document.getElementById(pageId);
                if (pageToShow) {
                    pageToShow.classList.add('active');

                    // If the new page is a project page, set up its scroll spy
                    if (pageId.startsWith('project-') || pageId.startsWith('util-')) {
                        setupScrollSpy(pageId);
                    }
                }

                // Update the active link in the sidebar
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    const linkHref = link.getAttribute('href').substring(1);

                    // If the link's href matches the pageId, it's a direct match.
                    // If the pageId starts with 'project', we are on a project detail page, so highlight the 'projects' link.
                    if (linkHref === pageId || ((pageId.startsWith('project-') || pageId.startsWith('util-')) && linkHref === 'projects')) {
                        link.classList.add('active');
                    }
                });

                // Scroll to the top of the page on navigation
                window.scrollTo(0, 0);
                closeSidebar(); // Close sidebar after selection
            };

            // --- Unified Global Click Handler ---
            // This single event listener manages all clicks for SPA navigation,
            // project cards, and smooth scrolling, while correctly ignoring
            // external links (http), mailto links, and download links.
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                const card = e.target.closest('.project-card');

                // Handle project card clicks
                if (card) {
                    const pageId = card.dataset.page;
                    if (pageId) {
                        window.location.hash = pageId;
                    }
                    return; // Done
                }

                // Handle all `<a>` tag clicks
                if (link) {
                    const href = link.getAttribute('href');

                    // If it's an internal SPA link (starts with '#')
                    if (href && href.startsWith('#')) {
                        e.preventDefault(); // Prevent default jump
                        
                        // If it's a Table of Contents link, scroll smoothly
                        if (link.closest('.project-toc')) {
                            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            // Otherwise, it's a main navigation link, so change the page
                            window.location.hash = href;
                        }
                    }
                    // For all other links (mailto:, https://, download), do nothing and let the browser handle it.
                }
            });

            // --- Copy Email Functionality ---
            const copyEmailBtn = document.getElementById('copy-email-btn');
            if (copyEmailBtn) {
                copyEmailBtn.addEventListener('click', function() {
                    const email = this.dataset.email;
                    navigator.clipboard.writeText(email).then(() => {
                        // Create and show tooltip on success
                        let tooltip = this.querySelector('.tooltip');
                        if (!tooltip) {
                            tooltip = document.createElement('span');
                            tooltip.className = 'tooltip';
                            tooltip.textContent = 'Copied!';
                            this.appendChild(tooltip);
                        }
                        
                        tooltip.classList.add('visible');

                        // Hide the tooltip after 2 seconds
                        setTimeout(() => {
                            tooltip.classList.remove('visible');
                        }, 2000);
                    });
                });
            }

            // --- Scroll to Top Button with Inactivity Timeout ---
            const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
            let inactivityTimer; // To hold the timer

            // This function shows the button (if scrolled down) and resets the inactivity timer
            const handleUserActivity = () => {
                // Clear any existing timer to prevent premature hiding
                clearTimeout(inactivityTimer);

                if (window.scrollY > 300) {
                    // If scrolled down, make the button visible
                    scrollToTopBtn.classList.add('visible');

                    // Set a new timer to hide the button after 2 seconds of inactivity
                    inactivityTimer = setTimeout(() => {
                        scrollToTopBtn.classList.remove('visible');
                    }, 2000);
                } else {
                    // If near the top, keep the button hidden
                    scrollToTopBtn.classList.remove('visible');
                }
            };

            // Listen for any user activity
            window.addEventListener('scroll', handleUserActivity);
            window.addEventListener('mousemove', handleUserActivity);
            window.addEventListener('touchstart', handleUserActivity);

            // Handle the click event to scroll to the top
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });


            // --- Handle URL Hash Changes and Initial Load ---

            // Function to show page based on the current URL hash
            const handleHashChange = () => {
                const pageId = window.location.hash.substring(1);
                showPage(pageId);
            };

            window.addEventListener('hashchange', handleHashChange); // Listen for hash changes
            handleHashChange(); // Handle initial page load (e.g., from a bookmark or refresh)

            // --- Scroll Spy Setup Function for Project Pages ---
            function setupScrollSpy(pageId) {
                const activePage = document.getElementById(pageId);
                if (!activePage) return;

                const tocLinks = activePage.querySelectorAll('.project-toc li a');
                const sections = activePage.querySelectorAll('.project-content h2');

                if (tocLinks.length === 0 || sections.length === 0) return;

                const intersectingSections = new Map();

                projectObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        intersectingSections.set(entry.target, entry.isIntersecting);
                    });

                    let activeSectionId = '';

                    for (const section of sections) {
                        if (intersectingSections.get(section)) {
                            activeSectionId = section.id;
                            break;
                        }
                    }

                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === activeSectionId) {
                            link.classList.add('active');
                        }
                    });
                }, {
                    rootMargin: '0px 0px -80% 0px',
                    threshold: 0
                });

                sections.forEach(section => projectObserver.observe(section));
            }
        });