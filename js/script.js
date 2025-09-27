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

            // --- Event Listeners ---

            // For sidebar navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('href'); // Keep the '#'
                    window.location.hash = pageId;
                });
            });

            // For project cards
            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', function() {
                    const pageId = this.dataset.page; // e.g., "project-1"
                    window.location.hash = pageId; // Set the hash to trigger navigation
                });
            });

            // For breadcrumb links on project detail pages
            // Note: We use event delegation on the document to handle links added in the future.
            document.addEventListener('click', function(e) {
                if (e.target.matches('.breadcrumb-link')) {
                    e.preventDefault();
                    window.location.hash = e.target.getAttribute('href');
                }
            });

            // For Table of Contents links to scroll smoothly
            document.querySelectorAll('.project-toc a').forEach(link => {
                link.addEventListener('click', function(e) {
                    // Prevent the default anchor behavior AND stop our router from firing
                    e.preventDefault(); 
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // Smoothly scroll the target heading into view
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
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