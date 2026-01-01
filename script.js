document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded - initializing scroll lock...');
    
    // DOM Elements
    const imageRevealSection = document.getElementById('image-reveal');
    const images = [
        document.getElementById('image1'),
        document.getElementById('image2'),
        document.getElementById('image3')
    ];
    const navTitle = document.getElementById('nav-title');
    
    // Debug elements
    const debugSection = document.getElementById('debug-section');
    const debugScroll = document.getElementById('debug-scroll');
    const debugImageState = document.getElementById('debug-image-state');
    const debugImage1 = document.getElementById('debug-image1');
    const debugImage2 = document.getElementById('debug-image2');
    const debugImage3 = document.getElementById('debug-image3');
    const debugToggle = document.getElementById('debug-toggle');
    const debugOverlay = document.querySelector('.debug-overlay');
    
    // State
    let currentImageIndex = 0;
    let isTransitioning = false;
    let isScrollLocked = false;
    let scrollTimeout = null;
    let lastScrollPosition = window.scrollY;
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();
    const TRANSITION_DURATION = 800;
    
    // Create scroll lock indicator
    const lockIndicator = document.createElement('div');
    lockIndicator.className = 'scroll-lock-indicator';
    lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
    document.body.appendChild(lockIndicator);
    
    // Debug panel setup - Start hidden
    let debugVisible = false;
    debugOverlay.classList.add('hidden');
    
    // Toggle debug overlay
    debugToggle.addEventListener('click', function() {
        debugVisible = !debugVisible;
        debugOverlay.classList.toggle('hidden');
        debugToggle.innerHTML = debugVisible ? 
            '<i class="fas fa-code"></i> Hide Debug' : 
            '<i class="fas fa-code"></i> Show Debug';
    });
    
    // Console commands for debug panel
    window.showDebug = function() {
        debugVisible = true;
        debugOverlay.classList.remove('hidden');
        debugToggle.innerHTML = '<i class="fas fa-code"></i> Hide Debug';
        console.log('Debug panel shown. Type hideDebug() to hide.');
    };
    
    window.hideDebug = function() {
        debugVisible = false;
        debugOverlay.classList.add('hidden');
        debugToggle.innerHTML = '<i class="fas fa-code"></i> Show Debug';
        console.log('Debug panel hidden. Type showDebug() to show.');
    };
    
    window.toggleDebug = function() {
        debugToggle.click();
    };
    
    // Console help message
    console.log('%c=== Debug Controls ===', 'color: #64ffda; font-weight: bold;');
    console.log('%cType showDebug() to show debug panel', 'color: #a8b2d1;');
    console.log('%cType hideDebug() to hide debug panel', 'color: #a8b2d1;');
    console.log('%cType toggleDebug() to toggle debug panel', 'color: #a8b2d1;');
    console.log('%cOr click the "Toggle Debug" button in the panel', 'color: #a8b2d1;');
    
    // Initialize images with proper clipping states
    function initImages() {
        console.log('Initializing images...');
        images.forEach((img, index) => {
            // Remove any existing transitions initially
            img.style.transition = 'none';
            
            if (index === 0) {
                // First image fully visible
                img.style.clipPath = 'inset(0% 0% 0% 0%)';
                img.style.opacity = '1';
                img.style.zIndex = '10';
            } else {
                // Other images hidden at bottom
                img.style.clipPath = 'inset(100% 0% 0% 0%)';
                img.style.opacity = '1';
                img.style.zIndex = (9 - index).toString();
            }
        });
        
        // Set transition for animation
        setTimeout(() => {
            images.forEach(img => {
                img.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }, 100);
    }
    
    // Check if section is in viewport (more permissive for fast scrolling)
    function isSectionInViewport() {
        if (!imageRevealSection) return false;
        
        const rect = imageRevealSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // More permissive check for fast scrolling
        // Check if any part of the section is in viewport
        return rect.top < viewportHeight * 0.8 && rect.bottom > viewportHeight * 0.2;
    }
    
    // Check if we're entering the section from above
    function isEnteringSectionFromTop() {
        if (!imageRevealSection) return false;
        
        const rect = imageRevealSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If top of section is in the upper half of viewport
        return rect.top >= 0 && rect.top < viewportHeight * 0.5;
    }
    
    // Check if we're at the section (more accurate for fast scrolling)
    function isAtSection() {
        if (!imageRevealSection) return false;
        
        const rect = imageRevealSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if section occupies majority of viewport
        const sectionHeight = rect.bottom - rect.top;
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        
        return visibleHeight >= viewportHeight * 0.7; // 70% of viewport
    }
    
    // Check if we've scrolled past the section
    function isScrolledPastSection() {
        if (!imageRevealSection) return false;
        
        const rect = imageRevealSection.getBoundingClientRect();
        // If section top is above viewport (we've passed it)
        return rect.top < -100;
    }
    
    // Check if we're above the section (scrolling back up)
    function isAboveSection() {
        if (!imageRevealSection) return false;
        
        const rect = imageRevealSection.getBoundingClientRect();
        // If section bottom is below viewport (we're above it)
        return rect.bottom > window.innerHeight + 100;
    }
    
    // Force lock to section (snap to it)
    function snapToSection() {
        console.log('Snapping to section...');
        
        // Immediately lock scroll
        if (!isScrollLocked) {
            lockScroll();
        }
        
        // Snap to section smoothly
        imageRevealSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Reset image to first one
        if (currentImageIndex !== 0) {
            showImageImmediately(0);
        }
    }
    
    // Animate transition: current clips up, next reveals up
    function animateTransitionToNext() {
        if (isTransitioning || currentImageIndex >= images.length - 1) {
            // If on last image, unlock scroll and go to next section
            if (currentImageIndex >= images.length - 1 && !isTransitioning) {
                unlockScroll();
                // Scroll to next section
                const nextSection = document.getElementById('section-work');
                if (nextSection) {
                    setTimeout(() => {
                        nextSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
            return;
        }
        
        console.log(`Animating: Image ${currentImageIndex + 1} → Image ${currentImageIndex + 2}`);
        isTransitioning = true;
        
        const currentImg = images[currentImageIndex];
        const nextImg = images[currentImageIndex + 1];
        const oldIndex = currentImageIndex;
        const newIndex = currentImageIndex + 1;
        
        // Set z-index for proper stacking
        currentImg.style.zIndex = '10';
        nextImg.style.zIndex = '11'; // Next image on top during transition
        
        // Ensure next image starts from bottom
        nextImg.style.clipPath = 'inset(100% 0% 0% 0%)';
        
        // Small delay to ensure styles are applied
        setTimeout(() => {
            // Animate: current clips out from bottom, next reveals from bottom
            currentImg.style.clipPath = 'inset(0% 0% 100% 0%)'; // Clip up out of view
            nextImg.style.clipPath = 'inset(0% 0% 0% 0%)'; // Reveal fully
            
            // Update nav title only (no image label)
            const labels = ['Experiences', 'Details', 'Tech Stack'];
            navTitle.textContent = labels[newIndex];
            
            // Update debug
            debugImageState.textContent = `Transition: ${oldIndex + 1} → ${newIndex + 1}`;
            debugImage1.textContent = oldIndex === 0 ? 'Clipping up' : (newIndex === 0 ? 'Revealing' : 'Hidden');
            debugImage2.textContent = oldIndex === 1 ? 'Clipping up' : (newIndex === 1 ? 'Revealing' : 'Hidden');
            debugImage3.textContent = oldIndex === 2 ? 'Clipping up' : (newIndex === 2 ? 'Revealing' : 'Hidden');
        }, 10);
        
        // Complete transition
        setTimeout(() => {
            currentImageIndex = newIndex;
            
            // Reset z-index
            images.forEach((img, i) => {
                img.style.zIndex = i === currentImageIndex ? '10' : (9 - i).toString();
            });
            
            isTransitioning = false;
            console.log(`Animation complete. Current image: ${currentImageIndex + 1}`);
            
            // If now on last image, show unlock hint
            if (currentImageIndex === images.length - 1) {
                lockIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Scroll to continue';
            } else {
                lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
            }
        }, TRANSITION_DURATION);
    }
    
    // Animate transition: current clips down, previous reveals down
    function animateTransitionToPrevious() {
        if (isTransitioning || currentImageIndex <= 0) {
            // If on first image, unlock scroll and go to previous section
            if (currentImageIndex <= 0 && !isTransitioning) {
                unlockScroll();
                // Scroll to previous section (buffer section)
                const prevSection = document.getElementById('section-buffer');
                if (prevSection) {
                    setTimeout(() => {
                        prevSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
            return;
        }
        
        console.log(`Animating: Image ${currentImageIndex + 1} → Image ${currentImageIndex}`);
        isTransitioning = true;
        
        const currentImg = images[currentImageIndex];
        const prevImg = images[currentImageIndex - 1];
        const oldIndex = currentImageIndex;
        const newIndex = currentImageIndex - 1;
        
        // Set z-index for proper stacking
        currentImg.style.zIndex = '10';
        prevImg.style.zIndex = '11'; // Previous image on top during transition
        
        // Ensure previous image starts from top (hidden)
        prevImg.style.clipPath = 'inset(100% 0% 0% 0%)';
        
        // Small delay to ensure styles are applied
        setTimeout(() => {
            // Animate: current clips down out of view, previous reveals down
            currentImg.style.clipPath = 'inset(100% 0% 0% 0%)'; // Clip down out of view
            prevImg.style.clipPath = 'inset(0% 0% 0% 0%)'; // Reveal fully
            
            // Update nav title only (no image label)
            const labels = ['Experiences', 'Details', 'Tech Stack'];
            navTitle.textContent = labels[newIndex];
            
            // Update debug
            debugImageState.textContent = `Transition: ${oldIndex + 1} → ${newIndex + 1}`;
            debugImage1.textContent = oldIndex === 0 ? 'Clipping down' : (newIndex === 0 ? 'Revealing' : 'Hidden');
            debugImage2.textContent = oldIndex === 1 ? 'Clipping down' : (newIndex === 1 ? 'Revealing' : 'Hidden');
            debugImage3.textContent = oldIndex === 2 ? 'Clipping down' : (newIndex === 2 ? 'Revealing' : 'Hidden');
        }, 10);
        
        // Complete transition
        setTimeout(() => {
            currentImageIndex = newIndex;
            
            // Reset z-index
            images.forEach((img, i) => {
                img.style.zIndex = i === currentImageIndex ? '10' : (9 - i).toString();
            });
            
            isTransitioning = false;
            console.log(`Animation complete. Current image: ${currentImageIndex + 1}`);
            
            // If now on first image, show unlock hint for scrolling up
            if (currentImageIndex === 0) {
                lockIndicator.innerHTML = '<i class="fas fa-arrow-up"></i> Scroll to go back';
            } else {
                lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
            }
        }, TRANSITION_DURATION);
    }
    
    // Show image immediately (no animation)
    function showImageImmediately(index) {
        if (index < 0 || index >= images.length) return;
        
        console.log(`Showing image ${index + 1} immediately`);
        currentImageIndex = index;
        
        images.forEach((img, i) => {
            img.style.transition = 'none';
            if (i === index) {
                img.style.clipPath = 'inset(0% 0% 0% 0%)';
                img.style.zIndex = '10';
            } else {
                img.style.clipPath = 'inset(100% 0% 0% 0%)';
                img.style.zIndex = (9 - i).toString();
            }
        });
        
        // Update nav title only (no image label)
        const labels = ['Experiences', 'Details', 'Tech Stack'];
        navTitle.textContent = labels[index];
        
        // Restore transitions after a moment
        setTimeout(() => {
            images.forEach(img => {
                img.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }, 50);
        
        // Update debug
        debugImageState.textContent = `Image ${index + 1} visible`;
        debugImage1.textContent = index === 0 ? 'Visible' : 'Hidden';
        debugImage2.textContent = index === 1 ? 'Visible' : 'Hidden';
        debugImage3.textContent = index === 2 ? 'Visible' : 'Hidden';
    }
    
    // Lock scroll to section
    function lockScroll() {
        if (isScrollLocked) return;
        
        console.log('🔒 Locking scroll to image section');
        isScrollLocked = true;
        lockIndicator.classList.add('visible');
        
        // Show first image if not already showing
        if (currentImageIndex !== 0) {
            showImageImmediately(0);
        }
        
        // Update lock indicator based on current image
        if (currentImageIndex === 0) {
            lockIndicator.innerHTML = '<i class="fas fa-arrow-up"></i> Scroll to go back';
        } else if (currentImageIndex === images.length - 1) {
            lockIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Scroll to continue';
        } else {
            lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
        }
        
        // Add scroll lock to body
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.width = '100%';
        
        debugImageState.textContent = 'Scroll locked - Image 1 visible';
    }
    
    // Unlock scroll
    function unlockScroll() {
        if (!isScrollLocked) return;
        
        console.log('🔓 Unlocking scroll');
        isScrollLocked = false;
        lockIndicator.classList.remove('visible');
        
        // Restore scroll
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.width = '';
        
        debugImageState.textContent = 'Scroll unlocked';
    }
    
    // Handle wheel events for image transitions
    function handleWheel(e) {
        if (!isScrollLocked || isTransitioning) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (e.deltaY > 0) {
            // Scrolling down - next image
            animateTransitionToNext();
        } else if (e.deltaY < 0) {
            // Scrolling up - previous image
            animateTransitionToPrevious();
        }
    }
    
    // Calculate scroll velocity
    function calculateScrollVelocity(currentScroll) {
        const now = Date.now();
        const timeDelta = now - lastScrollTime;
        const scrollDelta = currentScroll - lastScrollPosition;
        
        if (timeDelta > 0) {
            scrollVelocity = Math.abs(scrollDelta / timeDelta);
        }
        
        lastScrollTime = now;
        lastScrollPosition = currentScroll;
        
        return scrollVelocity;
    }
    
    // Handle touch events for mobile
    let touchStartY = 0;
    let touchStartTime = 0;
    
    function handleTouchStart(e) {
        if (!isScrollLocked || isTransitioning) return;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }
    
    function handleTouchEnd(e) {
        if (!isScrollLocked || isTransitioning) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        const deltaTime = Date.now() - touchStartTime;
        
        // Only trigger on significant swipe (min 50px) and quick enough (max 500ms)
        if (Math.abs(deltaY) > 50 && deltaTime < 500) {
            if (deltaY > 0) {
                // Swipe down - next image
                animateTransitionToNext();
            } else {
                // Swipe up - previous image
                animateTransitionToPrevious();
            }
        }
    }
    
    // Update header and debug info
    function updateScrollInfo() {
        const scrollY = window.scrollY || window.pageYOffset;
        const sections = [
            { id: 'section-hero', name: 'Welcome' },
            { id: 'section-about', name: 'About Me' },
            { id: 'section-buffer', name: 'Continue' },
            { id: 'image-reveal', name: 'Image Reveal' },
            { id: 'section-work', name: 'Work Experience' },
            { id: 'section-education', name: 'Education' },
            { id: 'section-projects', name: 'Projects' },
            { id: 'section-military', name: 'Military' },
            { id: 'section-hobbies', name: 'Hobbies' },
            { id: 'section-contact', name: 'Contact' }
        ];
        
        // Find current section
        let currentSectionName = 'Unknown';
        for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el) {
                const elTop = el.offsetTop;
                const elBottom = elTop + el.offsetHeight;
                
                if (scrollY >= elTop - 100 && scrollY < elBottom - 100) {
                    currentSectionName = section.name;
                    break;
                }
            }
        }
        
        // Update debug
        debugSection.textContent = currentSectionName;
        debugScroll.textContent = `${Math.round(scrollY)}px`;
        
        // Only update nav title if NOT in image section OR if scroll is unlocked
        if (currentSectionName !== 'Image Reveal' || !isScrollLocked) {
            // Use section name for other sections
            navTitle.textContent = currentSectionName;
        }
        // Note: Nav title for image section is updated in animation functions
    }
    
    // Main scroll handler with velocity detection
    function handleScroll() {
        const currentScroll = window.scrollY || window.pageYOffset;
        
        // Calculate scroll velocity
        const velocity = calculateScrollVelocity(currentScroll);
        
        // Update debug
        updateScrollInfo();
        
        // Check section conditions
        const sectionInView = isSectionInViewport();
        const atSection = isAtSection();
        const enteringFromTop = isEnteringSectionFromTop();
        const sectionPassed = isScrolledPastSection();
        const aboveSection = isAboveSection();
        
        // Determine if we should lock/unlock
        if ((sectionInView || atSection || enteringFromTop) && !isScrollLocked) {
            // Section is in view - lock scroll immediately
            lockScroll();
            
            // If scrolling fast, snap to section
            if (velocity > 2) { // High velocity threshold
                setTimeout(snapToSection, 50);
            }
        } else if ((!sectionInView && isScrollLocked && (sectionPassed || aboveSection))) {
            // Section left view, passed, or above - unlock scroll
            unlockScroll();
        } else if (isScrollLocked && !sectionInView && !atSection && !enteringFromTop) {
            // If locked but section is not in view at all, unlock
            unlockScroll();
        }
    }
    
    // More responsive scroll handler (less debounce for fast scrolling)
    function handleScrollResponsive() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        // Process immediately for fast scrolling detection
        handleScroll();
        
        // Still debounce for performance, but with shorter delay
        scrollTimeout = setTimeout(() => {
            handleScroll();
        }, 50);
    }
    
    // Initialize everything
    function init() {
        console.log('Initializing scroll lock system...');
        
        // Initialize images
        initImages();
        
        // Add event listeners
        window.addEventListener('scroll', handleScrollResponsive);
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Touch events for mobile
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Initial check
        setTimeout(() => {
            handleScroll();
            updateScrollInfo();
            
            // If already in section on load, lock it
            if (isSectionInViewport() || isAtSection()) {
                lockScroll();
            }
        }, 500);
        
        console.log('Initialization complete');
    }
    
    // Start when page loads
    window.addEventListener('load', init);
});
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Script loaded - initializing scroll lock...');
    
//     // DOM Elements
//     const imageRevealSection = document.getElementById('image-reveal');
//     const images = [
//         document.getElementById('image1'),
//         document.getElementById('image2'),
//         document.getElementById('image3')
//     ];
//     const imageLabel = document.getElementById('image-label');
//     const navTitle = document.getElementById('nav-title');
    
//     // Debug elements
//     const debugSection = document.getElementById('debug-section');
//     const debugScroll = document.getElementById('debug-scroll');
//     const debugImageState = document.getElementById('debug-image-state');
//     const debugImage1 = document.getElementById('debug-image1');
//     const debugImage2 = document.getElementById('debug-image2');
//     const debugImage3 = document.getElementById('debug-image3');
//     const debugToggle = document.getElementById('debug-toggle');
//     const debugOverlay = document.querySelector('.debug-overlay');
    
//     // State
//     let currentImageIndex = 0;
//     let isTransitioning = false;
//     let isScrollLocked = false;
//     let scrollTimeout = null;
//     let lastScrollPosition = window.scrollY;
//     const TRANSITION_DURATION = 800;
    
//     // Create scroll lock indicator
//     const lockIndicator = document.createElement('div');
//     lockIndicator.className = 'scroll-lock-indicator';
//     lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
//     document.body.appendChild(lockIndicator);
    
//     // Toggle debug overlay
//     let debugVisible = true;
//     debugToggle.addEventListener('click', function() {
//         debugVisible = !debugVisible;
//         debugOverlay.classList.toggle('hidden');
//         debugToggle.innerHTML = debugVisible ? 
//             '<i class="fas fa-code"></i> Hide Debug' : 
//             '<i class="fas fa-code"></i> Show Debug';
//     });
    
//     // Initialize images with proper clipping states
//     function initImages() {
//         console.log('Initializing images...');
//         images.forEach((img, index) => {
//             // Remove any existing transitions initially
//             img.style.transition = 'none';
            
//             if (index === 0) {
//                 // First image fully visible
//                 img.style.clipPath = 'inset(0% 0% 0% 0%)';
//                 img.style.opacity = '1';
//                 img.style.zIndex = '10';
//             } else {
//                 // Other images hidden at bottom
//                 img.style.clipPath = 'inset(100% 0% 0% 0%)';
//                 img.style.opacity = '1';
//                 img.style.zIndex = (9 - index).toString();
//             }
//         });
        
//         // Set transition for animation
//         setTimeout(() => {
//             images.forEach(img => {
//                 img.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
//             });
//         }, 100);
//     }
    
//     // Check if section is in viewport
//     function isSectionInViewport() {
//         if (!imageRevealSection) return false;
        
//         const rect = imageRevealSection.getBoundingClientRect();
//         const viewportHeight = window.innerHeight;
        
//         // Check if section is fully in viewport
//         const sectionTop = rect.top;
//         const sectionBottom = rect.bottom;
        
//         // Section is considered "in view" when:
//         // 1. Top is at or near viewport top
//         // 2. Bottom is at or near viewport bottom
//         return sectionTop >= 0 && sectionTop <= 100 && 
//                sectionBottom >= viewportHeight - 100 && 
//                sectionBottom <= viewportHeight + 100;
//     }
    
//     // Check if we're at the top of the section (entering from above)
//     function isAtTopOfSection() {
//         if (!imageRevealSection) return false;
        
//         const rect = imageRevealSection.getBoundingClientRect();
//         // If top of section is near top of viewport (entering section)
//         return rect.top >= -50 && rect.top <= 150;
//     }
    
//     // Check if we've scrolled past the section
//     function isScrolledPastSection() {
//         if (!imageRevealSection) return false;
        
//         const rect = imageRevealSection.getBoundingClientRect();
//         // If section bottom is above viewport (scrolled past)
//         return rect.bottom < -50;
//     }
    
//     // Check if we're above the section (scrolling back up)
//     function isAboveSection() {
//         if (!imageRevealSection) return false;
        
//         const rect = imageRevealSection.getBoundingClientRect();
//         // If section top is below viewport bottom (we're above it)
//         return rect.top > window.innerHeight;
//     }
    
//     // Animate transition: current clips up, next reveals up
//     function animateTransitionToNext() {
//         if (isTransitioning || currentImageIndex >= images.length - 1) {
//             // If on last image, unlock scroll and go to next section
//             if (currentImageIndex >= images.length - 1 && !isTransitioning) {
//                 unlockScroll();
//                 // Scroll to next section
//                 const nextSection = document.getElementById('section-work');
//                 if (nextSection) {
//                     setTimeout(() => {
//                         nextSection.scrollIntoView({ behavior: 'smooth' });
//                     }, 100);
//                 }
//             }
//             return;
//         }
        
//         console.log(`Animating: Image ${currentImageIndex + 1} → Image ${currentImageIndex + 2}`);
//         isTransitioning = true;
        
//         const currentImg = images[currentImageIndex];
//         const nextImg = images[currentImageIndex + 1];
//         const oldIndex = currentImageIndex;
//         const newIndex = currentImageIndex + 1;
        
//         // Set z-index for proper stacking
//         currentImg.style.zIndex = '10';
//         nextImg.style.zIndex = '11'; // Next image on top during transition
        
//         // Ensure next image starts from bottom
//         nextImg.style.clipPath = 'inset(100% 0% 0% 0%)';
        
//         // Small delay to ensure styles are applied
//         setTimeout(() => {
//             // Animate: current clips out from bottom, next reveals from bottom
//             currentImg.style.clipPath = 'inset(0% 0% 100% 0%)'; // Clip up out of view
//             nextImg.style.clipPath = 'inset(0% 0% 0% 0%)'; // Reveal fully
            
//             // Update label
//             const labels = ['Experiences', 'Details', 'Tech Stack'];
//             imageLabel.textContent = labels[newIndex];
//             navTitle.textContent = labels[newIndex];
            
//             // Update debug
//             debugImageState.textContent = `Transition: ${oldIndex + 1} → ${newIndex + 1}`;
//             debugImage1.textContent = oldIndex === 0 ? 'Clipping up' : (newIndex === 0 ? 'Revealing' : 'Hidden');
//             debugImage2.textContent = oldIndex === 1 ? 'Clipping up' : (newIndex === 1 ? 'Revealing' : 'Hidden');
//             debugImage3.textContent = oldIndex === 2 ? 'Clipping up' : (newIndex === 2 ? 'Revealing' : 'Hidden');
//         }, 10);
        
//         // Complete transition
//         setTimeout(() => {
//             currentImageIndex = newIndex;
            
//             // Reset z-index
//             images.forEach((img, i) => {
//                 img.style.zIndex = i === currentImageIndex ? '10' : (9 - i).toString();
//             });
            
//             isTransitioning = false;
//             console.log(`Animation complete. Current image: ${currentImageIndex + 1}`);
            
//             // If now on last image, show unlock hint
//             if (currentImageIndex === images.length - 1) {
//                 lockIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Scroll to continue';
//             } else {
//                 lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
//             }
//         }, TRANSITION_DURATION);
//     }
    
//     // Animate transition: current clips down, previous reveals down
//     function animateTransitionToPrevious() {
//         if (isTransitioning || currentImageIndex <= 0) {
//             // If on first image, unlock scroll and go to previous section
//             if (currentImageIndex <= 0 && !isTransitioning) {
//                 unlockScroll();
//                 // Scroll to previous section (buffer section)
//                 const prevSection = document.getElementById('section-buffer');
//                 if (prevSection) {
//                     setTimeout(() => {
//                         prevSection.scrollIntoView({ behavior: 'smooth' });
//                     }, 100);
//                 }
//             }
//             return;
//         }
        
//         console.log(`Animating: Image ${currentImageIndex + 1} → Image ${currentImageIndex}`);
//         isTransitioning = true;
        
//         const currentImg = images[currentImageIndex];
//         const prevImg = images[currentImageIndex - 1];
//         const oldIndex = currentImageIndex;
//         const newIndex = currentImageIndex - 1;
        
//         // Set z-index for proper stacking
//         currentImg.style.zIndex = '10';
//         prevImg.style.zIndex = '11'; // Previous image on top during transition
        
//         // Ensure previous image starts from top (hidden)
//         prevImg.style.clipPath = 'inset(100% 0% 0% 0%)';
        
//         // Small delay to ensure styles are applied
//         setTimeout(() => {
//             // Animate: current clips down out of view, previous reveals down
//             currentImg.style.clipPath = 'inset(100% 0% 0% 0%)'; // Clip down out of view
//             prevImg.style.clipPath = 'inset(0% 0% 0% 0%)'; // Reveal fully
            
//             // Update label
//             const labels = ['Experiences', 'Details', 'Tech Stack'];
//             imageLabel.textContent = labels[newIndex];
//             navTitle.textContent = labels[newIndex];
            
//             // Update debug
//             debugImageState.textContent = `Transition: ${oldIndex + 1} → ${newIndex + 1}`;
//             debugImage1.textContent = oldIndex === 0 ? 'Clipping down' : (newIndex === 0 ? 'Revealing' : 'Hidden');
//             debugImage2.textContent = oldIndex === 1 ? 'Clipping down' : (newIndex === 1 ? 'Revealing' : 'Hidden');
//             debugImage3.textContent = oldIndex === 2 ? 'Clipping down' : (newIndex === 2 ? 'Revealing' : 'Hidden');
//         }, 10);
        
//         // Complete transition
//         setTimeout(() => {
//             currentImageIndex = newIndex;
            
//             // Reset z-index
//             images.forEach((img, i) => {
//                 img.style.zIndex = i === currentImageIndex ? '10' : (9 - i).toString();
//             });
            
//             isTransitioning = false;
//             console.log(`Animation complete. Current image: ${currentImageIndex + 1}`);
            
//             // If now on first image, show unlock hint for scrolling up
//             if (currentImageIndex === 0) {
//                 lockIndicator.innerHTML = '<i class="fas fa-arrow-up"></i> Scroll to go back';
//             } else {
//                 lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
//             }
//         }, TRANSITION_DURATION);
//     }
    
//     // Show image immediately (no animation)
//     function showImageImmediately(index) {
//         if (index < 0 || index >= images.length) return;
        
//         console.log(`Showing image ${index + 1} immediately`);
//         currentImageIndex = index;
        
//         images.forEach((img, i) => {
//             img.style.transition = 'none';
//             if (i === index) {
//                 img.style.clipPath = 'inset(0% 0% 0% 0%)';
//                 img.style.zIndex = '10';
//             } else {
//                 img.style.clipPath = 'inset(100% 0% 0% 0%)';
//                 img.style.zIndex = (9 - i).toString();
//             }
//         });
        
//         // Update label
//         const labels = ['Experiences', 'Details', 'Tech Stack'];
//         imageLabel.textContent = labels[index];
//         navTitle.textContent = labels[index];
        
//         // Restore transitions after a moment
//         setTimeout(() => {
//             images.forEach(img => {
//                 img.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
//             });
//         }, 50);
        
//         // Update debug
//         debugImageState.textContent = `Image ${index + 1} visible`;
//         debugImage1.textContent = index === 0 ? 'Visible' : 'Hidden';
//         debugImage2.textContent = index === 1 ? 'Visible' : 'Hidden';
//         debugImage3.textContent = index === 2 ? 'Visible' : 'Hidden';
//     }
    
//     // Lock scroll to section
//     function lockScroll() {
//         if (isScrollLocked) return;
        
//         console.log('🔒 Locking scroll to image section');
//         isScrollLocked = true;
//         lockIndicator.classList.add('visible');
        
//         // Show first image if not already showing
//         if (currentImageIndex !== 0) {
//             showImageImmediately(0);
//         }
        
//         // Update lock indicator based on current image
//         if (currentImageIndex === 0) {
//             lockIndicator.innerHTML = '<i class="fas fa-arrow-up"></i> Scroll to go back';
//         } else if (currentImageIndex === images.length - 1) {
//             lockIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Scroll to continue';
//         } else {
//             lockIndicator.innerHTML = '<i class="fas fa-mouse-pointer"></i> Scroll to change images';
//         }
        
//         // Add scroll lock to body
//         document.body.style.overflow = 'hidden';
//         document.body.style.height = '100vh';
//         document.body.style.width = '100%';
        
//         debugImageState.textContent = 'Scroll locked - Image 1 visible';
//     }
    
//     // Unlock scroll
//     function unlockScroll() {
//         if (!isScrollLocked) return;
        
//         console.log('🔓 Unlocking scroll');
//         isScrollLocked = false;
//         lockIndicator.classList.remove('visible');
        
//         // Restore scroll
//         document.body.style.overflow = '';
//         document.body.style.height = '';
//         document.body.style.width = '';
        
//         debugImageState.textContent = 'Scroll unlocked';
//     }
    
//     // Handle wheel events for image transitions
//     function handleWheel(e) {
//         if (!isScrollLocked || isTransitioning) return;
        
//         e.preventDefault();
//         e.stopPropagation();
        
//         if (e.deltaY > 0) {
//             // Scrolling down - next image
//             animateTransitionToNext();
//         } else if (e.deltaY < 0) {
//             // Scrolling up - previous image
//             animateTransitionToPrevious();
//         }
//     }
    
//     // Handle touch events for mobile
//     let touchStartY = 0;
//     let touchStartTime = 0;
    
//     function handleTouchStart(e) {
//         if (!isScrollLocked || isTransitioning) return;
//         touchStartY = e.touches[0].clientY;
//         touchStartTime = Date.now();
//     }
    
//     function handleTouchEnd(e) {
//         if (!isScrollLocked || isTransitioning) return;
        
//         const touchEndY = e.changedTouches[0].clientY;
//         const deltaY = touchStartY - touchEndY;
//         const deltaTime = Date.now() - touchStartTime;
        
//         // Only trigger on significant swipe (min 50px) and quick enough (max 500ms)
//         if (Math.abs(deltaY) > 50 && deltaTime < 500) {
//             if (deltaY > 0) {
//                 // Swipe down - next image
//                 animateTransitionToNext();
//             } else {
//                 // Swipe up - previous image
//                 animateTransitionToPrevious();
//             }
//         }
//     }
    
//     // Update header and debug info
//     function updateScrollInfo() {
//         const scrollY = window.scrollY || window.pageYOffset;
//         const sections = [
//             { id: 'section-hero', name: 'Welcome' },
//             { id: 'section-about', name: 'About Me' },
//             { id: 'section-buffer', name: 'Continue' },
//             { id: 'image-reveal', name: 'Image Reveal' },
//             { id: 'section-work', name: 'Work Experience' },
//             { id: 'section-education', name: 'Education' },
//             { id: 'section-projects', name: 'Projects' },
//             { id: 'section-military', name: 'Military' },
//             { id: 'section-hobbies', name: 'Hobbies' },
//             { id: 'section-contact', name: 'Contact' }
//         ];
        
//         // Find current section
//         let currentSectionName = 'Unknown';
//         for (const section of sections) {
//             const el = document.getElementById(section.id);
//             if (el) {
//                 const elTop = el.offsetTop;
//                 const elBottom = elTop + el.offsetHeight;
                
//                 if (scrollY >= elTop - 100 && scrollY < elBottom - 100) {
//                     currentSectionName = section.name;
//                     break;
//                 }
//             }
//         }
        
//         // Update debug
//         debugSection.textContent = currentSectionName;
//         debugScroll.textContent = `${Math.round(scrollY)}px`;
        
//         // Update nav title based on current image when in image section
//         if (currentSectionName === 'Image Reveal' && isScrollLocked) {
//             const labels = ['Experiences', 'Details', 'Tech Stack'];
//             navTitle.textContent = labels[currentImageIndex];
//         } else if (currentSectionName !== 'Image Reveal') {
//             // Use section name for other sections
//             navTitle.textContent = currentSectionName;
//         }
//     }
    
//     // Main scroll handler
//     function handleScroll() {
//         const currentScroll = window.scrollY || window.pageYOffset;
        
//         // Update debug
//         updateScrollInfo();
        
//         // Check section visibility
//         const sectionInView = isSectionInViewport();
//         const sectionPassed = isScrolledPastSection();
//         const aboveSection = isAboveSection();
//         const atTopOfSection = isAtTopOfSection();
        
//         // Determine if we should lock/unlock
//         if ((sectionInView || atTopOfSection) && !isScrollLocked) {
//             // Section entered view or at top - lock scroll
//             lockScroll();
//         } else if ((!sectionInView && isScrollLocked && (sectionPassed || aboveSection)) || 
//                    (!sectionInView && !atTopOfSection && isScrollLocked)) {
//             // Section left view, passed, or above - unlock scroll
//             unlockScroll();
//         }
        
//         lastScrollPosition = currentScroll;
//     }
    
//     // Debounced scroll handler
//     function debounceScroll() {
//         if (scrollTimeout) clearTimeout(scrollTimeout);
//         scrollTimeout = setTimeout(handleScroll, 100);
//     }
    
//     // Initialize everything
//     function init() {
//         console.log('Initializing scroll lock system...');
        
//         // Initialize images
//         initImages();
        
//         // Add event listeners
//         window.addEventListener('scroll', debounceScroll);
//         window.addEventListener('wheel', handleWheel, { passive: false });
        
//         // Touch events for mobile
//         window.addEventListener('touchstart', handleTouchStart, { passive: true });
//         window.addEventListener('touchend', handleTouchEnd, { passive: true });
        
//         // Initial check
//         setTimeout(() => {
//             handleScroll();
//             updateScrollInfo();
            
//             // If already in section on load, lock it
//             if (isSectionInViewport() || isAtTopOfSection()) {
//                 lockScroll();
//             }
//         }, 500);
        
//         console.log('Initialization complete');
//     }
    
//     // Start when page loads
//     window.addEventListener('load', init);
// });
// document.addEventListener('DOMContentLoaded', function() {
//     // DOM Elements
//     const imageContainer = document.getElementById('image-container');
//     const images = [
//         document.getElementById('image1'),
//         document.getElementById('image2'),
//         document.getElementById('image3')
//     ];
//     const imageLabel = document.getElementById('image-label');
//     const navTitle = document.getElementById('nav-title');
    
//     // Debug elements
//     const debugSection = document.getElementById('debug-section');
//     const debugScroll = document.getElementById('debug-scroll');
//     const debugImageState = document.getElementById('debug-image-state');
//     const debugImage1 = document.getElementById('debug-image1');
//     const debugImage2 = document.getElementById('debug-image2');
//     const debugImage3 = document.getElementById('debug-image3');
//     const debugToggle = document.getElementById('debug-toggle');
//     const debugOverlay = document.querySelector('.debug-overlay');
    
//     // Section configuration with proper order
//     const sections = [
//         { id: 'section-hero', title: 'Welcome', type: 'content' },
//         { id: 'section-about', title: 'About Me', type: 'content' },
//         { id: 'section-image1', title: 'Experiences', type: 'image' },
//         { id: 'section-image2', title: 'Details', type: 'image' },
//         { id: 'section-image3', title: 'Tech Stack', type: 'image' },
//         { id: 'section-work', title: 'Work Experience', type: 'content' },
//         { id: 'section-education', title: 'Education', type: 'content' },
//         { id: 'section-projects', title: 'Projects', type: 'content' },
//         { id: 'section-military', title: 'Military', type: 'content' },
//         { id: 'section-hobbies', title: 'Hobbies', type: 'content' },
//         { id: 'section-contact', title: 'Contact', type: 'content' }
//     ];
    
//     // Store section positions
//     let sectionPositions = [];
    
//     // Toggle debug overlay
//     let debugVisible = true;
//     debugToggle.addEventListener('click', function() {
//         debugVisible = !debugVisible;
//         if (debugVisible) {
//             debugOverlay.classList.remove('hidden');
//             debugToggle.innerHTML = '<i class="fas fa-code"></i> Hide Debug';
//         } else {
//             debugOverlay.classList.add('hidden');
//             debugToggle.innerHTML = '<i class="fas fa-code"></i> Show Debug';
//         }
//     });
    
//     // Calculate section positions
//     function calculateSectionPositions() {
//         sectionPositions = sections.map(section => {
//             const element = document.getElementById(section.id);
//             if (!element) return null;
            
//             const rect = element.getBoundingClientRect();
//             return {
//                 id: section.id,
//                 title: section.title,
//                 type: section.type,
//                 top: rect.top + window.scrollY,
//                 bottom: rect.bottom + window.scrollY,
//                 height: rect.height
//             };
//         }).filter(Boolean);
        
//         console.log('Section positions calculated:', sectionPositions);
//     }
    
//     // Update header title
//     function updateHeaderTitle(sectionId) {
//         const section = sections.find(s => s.id === sectionId);
//         if (section) {
//             navTitle.textContent = section.title;
//         }
//     }
    
//     // Get current section based on scroll position
//     function getCurrentSection(scrollPosition) {
//         const viewportCenter = scrollPosition + (window.innerHeight / 2);
        
//         for (let i = 0; i < sectionPositions.length; i++) {
//             const section = sectionPositions[i];
//             if (viewportCenter >= section.top && viewportCenter <= section.bottom) {
//                 return {
//                     section,
//                     index: i,
//                     progress: (viewportCenter - section.top) / section.height
//                 };
//             }
//         }
        
//         return null;
//     }
    
//     // Update image transitions with corrected logic
//     function updateImageTransitions(currentInfo) {
//         if (!currentInfo) {
//             // Before any image sections
//             imageContainer.classList.remove('visible');
//             return;
//         }
        
//         const { section, index, progress } = currentInfo;
        
//         // Update header
//         updateHeaderTitle(section.id);
//         debugSection.textContent = section.title;
        
//         // Handle different sections
//         if (section.id === 'section-hero' || section.id === 'section-about') {
//             // Hero and About sections - images hidden
//             imageContainer.classList.remove('visible');
//             debugImage1.textContent = '100% hidden';
//             debugImage2.textContent = '100% hidden';
//             debugImage3.textContent = '100% hidden';
//         }
//         else if (section.id === 'section-image1') {
//             // First image section - reveal from bottom to top
//             imageContainer.classList.add('visible');
//             imageLabel.textContent = 'Experiences';
            
//             // Image 1: Reveal from bottom (100% → 0% clip from bottom)
//             const image1ClipBottom = (1 - progress) * 100;
//             images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
            
//             // Other images hidden
//             images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//             images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
//             debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
//             debugImage2.textContent = '100% from top';
//             debugImage3.textContent = '100% from top';
//         }
//         else if (section.id === 'section-image2') {
//             // Second image section - transition from image1 to image2
//             imageContainer.classList.add('visible');
//             imageLabel.textContent = 'Details';
            
//             // Image 1: Clip from bottom (0% → 100%)
//             const image1ClipBottom = progress * 100;
            
//             // Image 2: Reveal from top (100% → 0%)
//             const image2ClipTop = (1 - progress) * 100;
            
//             images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
//             images[1].style.clipPath = `inset(${image2ClipTop}% 0% 0% 0%)`;
//             images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
//             debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
//             debugImage2.textContent = `${image2ClipTop.toFixed(1)}% from top`;
//             debugImage3.textContent = '100% from top';
//         }
//         else if (section.id === 'section-image3') {
//             // Third image section - transition from image2 to image3
//             imageContainer.classList.add('visible');
//             imageLabel.textContent = 'Tech Stack';
            
//             // Image 2: Clip from bottom (0% → 100%)
//             const image2ClipBottom = progress * 100;
            
//             // Image 3: Reveal from top (100% → 0%)
//             const image3ClipTop = (1 - progress) * 100;
            
//             images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
//             images[1].style.clipPath = `inset(0% 0% ${image2ClipBottom}% 0%)`;
//             images[2].style.clipPath = `inset(${image3ClipTop}% 0% 0% 0%)`;
            
//             debugImage1.textContent = '100% hidden';
//             debugImage2.textContent = `${image2ClipBottom.toFixed(1)}% from bottom`;
//             debugImage3.textContent = `${image3ClipTop.toFixed(1)}% from top`;
//         }
//         else {
//             // Content sections after images - third image clips out from bottom to top
//             imageContainer.classList.add('visible');
            
//             // Image 3: Clip from bottom to exit (0% → 100% from bottom)
//             const exitProgress = Math.min(progress * 1.5, 1);
//             const image3ClipBottom = exitProgress * 100;
            
//             images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
//             images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//             images[2].style.clipPath = `inset(0% 0% ${image3ClipBottom}% 0%)`;
            
//             debugImage1.textContent = '100% hidden';
//             debugImage2.textContent = '100% hidden';
//             debugImage3.textContent = `${image3ClipBottom.toFixed(1)}% from bottom`;
            
//             // Hide image container after fully exited
//             if (exitProgress >= 1) {
//                 imageContainer.classList.remove('visible');
//             }
//         }
//     }
    
//     // Main update function
//     function updateScrollEffect() {
//         const scrollPosition = window.scrollY;
        
//         // Update debug info
//         debugScroll.textContent = `${Math.round(scrollPosition)}px`;
        
//         // Get current section
//         const currentInfo = getCurrentSection(scrollPosition);
        
//         // Update image transitions
//         updateImageTransitions(currentInfo);
//     }
    
//     // Initialize
//     function init() {
//         // Set initial clip paths
//         images[0].style.clipPath = 'inset(0% 0% 100% 0%)'; // Start with 100% clipped from bottom
//         images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//         images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
        
//         calculateSectionPositions();
//         updateScrollEffect();
        
//         // Initial header title
//         updateHeaderTitle('section-hero');
//     }
    
//     // Event Listeners
//     window.addEventListener('scroll', function() {
//         requestAnimationFrame(updateScrollEffect);
//     });
    
//     window.addEventListener('resize', function() {
//         calculateSectionPositions();
//         updateScrollEffect();
//     });
    
//     // Initialize
//     init();
// });
// document.addEventListener('DOMContentLoaded', function() {
//     // DOM Elements
//     const imageContainer = document.getElementById('image-container');
//     const images = [
//         document.getElementById('image1'),
//         document.getElementById('image2'),
//         document.getElementById('image3')
//     ];
//     const imageLabel = document.getElementById('image-label');
//     const navTitle = document.getElementById('nav-title');
    
//     // Debug elements
//     const debugSection = document.getElementById('debug-section');
//     const debugScroll = document.getElementById('debug-scroll');
//     const debugImageState = document.getElementById('debug-image-state');
//     const debugImage1 = document.getElementById('debug-image1');
//     const debugImage2 = document.getElementById('debug-image2');
//     const debugImage3 = document.getElementById('debug-image3');
//     const debugToggle = document.getElementById('debug-toggle');
//     const debugOverlay = document.querySelector('.debug-overlay');
    
//     // Section configuration - only key sections for transitions
//     const transitionSections = [
//         { id: 'section-hero', title: 'Welcome', type: 'before-images' },
//         { id: 'section-about', title: 'About Me', type: 'before-images' },
//         { id: 'section-image1', title: 'Experiences', type: 'image' },
//         { id: 'section-image2', title: 'Details', type: 'image' },
//         { id: 'section-image3', title: 'Tech Stack', type: 'image' },
//         { id: 'section-work', title: 'Work Experience', type: 'after-images' }
//     ];
    
//     // Store section boundaries
//     let sectionBoundaries = [];
    
//     // Toggle debug overlay
//     let debugVisible = true;
//     debugToggle.addEventListener('click', function() {
//         debugVisible = !debugVisible;
//         if (debugVisible) {
//             debugOverlay.classList.remove('hidden');
//             debugToggle.innerHTML = '<i class="fas fa-code"></i> Hide Debug';
//         } else {
//             debugOverlay.classList.add('hidden');
//             debugToggle.innerHTML = '<i class="fas fa-code"></i> Show Debug';
//         }
//     });
    
//     // Calculate section boundaries
//     function calculateBoundaries() {
//         sectionBoundaries = [];
        
//         // Get the key transition sections
//         transitionSections.forEach(section => {
//             const element = document.getElementById(section.id);
//             if (element) {
//                 const rect = element.getBoundingClientRect();
//                 sectionBoundaries.push({
//                     id: section.id,
//                     title: section.title,
//                     type: section.type,
//                     top: rect.top + window.scrollY,
//                     bottom: rect.bottom + window.scrollY,
//                     height: rect.height
//                 });
//             }
//         });
        
//         console.log('Section boundaries:', sectionBoundaries);
//     }
    
//     // Update header title
//     function updateHeaderTitle(sectionId) {
//         const section = transitionSections.find(s => s.id === sectionId);
//         if (section) {
//             navTitle.textContent = section.title;
//         }
//     }
    
//     // Get transition progress based on scroll position
//     function getTransitionProgress(scrollPosition, viewportHeight) {
//         const viewportCenter = scrollPosition + (viewportHeight / 2);
        
//         // Find which two sections we're between
//         for (let i = 0; i < sectionBoundaries.length - 1; i++) {
//             const currentSection = sectionBoundaries[i];
//             const nextSection = sectionBoundaries[i + 1];
            
//             // Check if we're in the transition zone between these sections
//             if (viewportCenter >= currentSection.bottom && 
//                 viewportCenter <= nextSection.top) {
                
//                 // Calculate progress between sections (0 to 1)
//                 const transitionRange = nextSection.top - currentSection.bottom;
//                 const progress = (viewportCenter - currentSection.bottom) / transitionRange;
                
//                 return {
//                     fromSection: currentSection,
//                     toSection: nextSection,
//                     progress: Math.max(0, Math.min(1, progress))
//                 };
//             }
//         }
        
//         // Check if we're within a specific section
//         for (let i = 0; i < sectionBoundaries.length; i++) {
//             const section = sectionBoundaries[i];
//             if (viewportCenter >= section.top && viewportCenter <= section.bottom) {
//                 return {
//                     inSection: section,
//                     progress: (viewportCenter - section.top) / section.height
//                 };
//             }
//         }
        
//         return null;
//     }
    
//     // Update image transitions
//     function updateImageTransitions(transitionInfo) {
//         if (!transitionInfo) {
//             imageContainer.classList.remove('visible');
//             return;
//         }
        
//         const viewportHeight = window.innerHeight;
//         const scrollPosition = window.scrollY;
//         const viewportCenter = scrollPosition + (viewportHeight / 2);
        
//         // Determine which image transition we're in
//         if (transitionInfo.inSection) {
//             const section = transitionInfo.inSection;
            
//             // Update header based on current section
//             updateHeaderTitle(section.id);
//             debugSection.textContent = section.title;
            
//             if (section.id === 'section-hero' || section.id === 'section-about') {
//                 // Before image sections - images hidden
//                 imageContainer.classList.remove('visible');
//                 debugImage1.textContent = '100% hidden';
//                 debugImage2.textContent = '100% hidden';
//                 debugImage3.textContent = '100% hidden';
//             }
//             else if (section.id === 'section-image1') {
//                 // First image section - image appears
//                 imageContainer.classList.add('visible');
//                 imageLabel.textContent = 'Experiences';
                
//                 // Image 1 reveals from bottom as we scroll through this section
//                 const revealProgress = transitionInfo.progress;
//                 const image1ClipBottom = (1 - revealProgress) * 100;
                
//                 images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
//                 images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//                 images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
                
//                 debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
//                 debugImage2.textContent = '100% from top';
//                 debugImage3.textContent = '100% from top';
//             }
//             else if (section.id === 'section-work') {
//                 // Work section - images should be hidden
//                 imageContainer.classList.remove('visible');
//             }
//         }
//         else if (transitionInfo.fromSection && transitionInfo.toSection) {
//             // We're between two sections - handle transitions
//             const { fromSection, toSection, progress } = transitionInfo;
            
//             // Update header based on where we are in the transition
//             if (progress < 0.5) {
//                 updateHeaderTitle(fromSection.id);
//                 debugSection.textContent = `${fromSection.title} → ${toSection.title}`;
//             } else {
//                 updateHeaderTitle(toSection.id);
//                 debugSection.textContent = `${fromSection.title} → ${toSection.title}`;
//             }
            
//             // Handle specific transitions
//             if (fromSection.id === 'section-image1' && toSection.id === 'section-image2') {
//                 // Transition from Image 1 to Image 2
//                 imageContainer.classList.add('visible');
//                 imageLabel.textContent = 'Details';
                
//                 // Image 1 clips from bottom, Image 2 reveals from top
//                 const image1ClipBottom = progress * 100;
//                 const image2ClipTop = (1 - progress) * 100;
                
//                 images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
//                 images[1].style.clipPath = `inset(${image2ClipTop}% 0% 0% 0%)`;
//                 images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
                
//                 debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
//                 debugImage2.textContent = `${image2ClipTop.toFixed(1)}% from top`;
//                 debugImage3.textContent = '100% from top';
//             }
//             else if (fromSection.id === 'section-image2' && toSection.id === 'section-image3') {
//                 // Transition from Image 2 to Image 3
//                 imageContainer.classList.add('visible');
//                 imageLabel.textContent = 'Tech Stack';
                
//                 // Image 2 clips from bottom, Image 3 reveals from top
//                 const image2ClipBottom = progress * 100;
//                 const image3ClipTop = (1 - progress) * 100;
                
//                 images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
//                 images[1].style.clipPath = `inset(0% 0% ${image2ClipBottom}% 0%)`;
//                 images[2].style.clipPath = `inset(${image3ClipTop}% 0% 0% 0%)`;
                
//                 debugImage1.textContent = '100% hidden';
//                 debugImage2.textContent = `${image2ClipBottom.toFixed(1)}% from bottom`;
//                 debugImage3.textContent = `${image3ClipTop.toFixed(1)}% from top`;
//             }
//             else if (fromSection.id === 'section-image3' && toSection.id === 'section-work') {
//                 // Transition from Image 3 to Work section
//                 imageContainer.classList.add('visible');
//                 imageLabel.textContent = 'Tech Stack';
                
//                 // Image 3 clips from bottom to exit
//                 const image3ClipBottom = progress * 100;
                
//                 images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
//                 images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//                 images[2].style.clipPath = `inset(0% 0% ${image3ClipBottom}% 0%)`;
                
//                 debugImage1.textContent = '100% hidden';
//                 debugImage2.textContent = '100% hidden';
//                 debugImage3.textContent = `${image3ClipBottom.toFixed(1)}% from bottom`;
                
//                 // Hide container when transition is complete
//                 if (progress >= 0.95) {
//                     imageContainer.classList.remove('visible');
//                 }
//             }
//             else if (fromSection.id === 'section-about' && toSection.id === 'section-image1') {
//                 // Transition from About to Image 1
//                 // Image 1 starts appearing
//                 imageContainer.classList.add('visible');
//                 imageLabel.textContent = 'Experiences';
                
//                 // Image 1 reveals from bottom
//                 const image1ClipBottom = (1 - progress) * 100;
                
//                 images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
//                 images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//                 images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
                
//                 debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
//                 debugImage2.textContent = '100% from top';
//                 debugImage3.textContent = '100% from top';
//             }
//         }
//     }
    
//     // Main update function
//     function updateScrollEffect() {
//         const scrollPosition = window.scrollY;
//         const viewportHeight = window.innerHeight;
        
//         // Update debug info
//         debugScroll.textContent = `${Math.round(scrollPosition)}px`;
        
//         // Get transition progress
//         const transitionInfo = getTransitionProgress(scrollPosition, viewportHeight);
        
//         // Update image transitions
//         updateImageTransitions(transitionInfo);
//     }
    
//     // Initialize
//     function init() {
//         // Set initial clip paths
//         images[0].style.clipPath = 'inset(0% 0% 100% 0%)'; // Start with 100% clipped from bottom
//         images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
//         images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
        
//         calculateBoundaries();
//         updateScrollEffect();
        
//         // Initial header title
//         updateHeaderTitle('section-hero');
//     }
    
//     // Event Listeners
//     window.addEventListener('scroll', function() {
//         requestAnimationFrame(updateScrollEffect);
//     });
    
//     window.addEventListener('resize', function() {
//         calculateBoundaries();
//         updateScrollEffect();
//     });
    
//     // Recalculate after all content loads
//     window.addEventListener('load', function() {
//         setTimeout(init, 100);
//     });
    
//     // Initialize
//     init();
// });