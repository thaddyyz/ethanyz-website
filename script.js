document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageContainer = document.getElementById('image-container');
    const images = [
        document.getElementById('image1'),
        document.getElementById('image2'),
        document.getElementById('image3')
    ];
    const imageLabel = document.getElementById('image-label');
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
    let currentImage = 0; // 0 = image1, 1 = image2, 2 = image3, -1 = hidden
    let targetImage = -1;
    let isAnimating = false;
    let animationStart = 0;
    const ANIMATION_DURATION = 800;
    
    // Scroll tracking
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let scrollThreshold = 50; // pixels to trigger transition
    let scrollAccumulator = 0;
    
    // Section tracking
    let sections = {};
    let currentSection = null;
    let nextScrollTriggersTransition = false;
    
    // Toggle debug overlay
    let debugVisible = true;
    debugToggle.addEventListener('click', function() {
        debugVisible = !debugVisible;
        if (debugVisible) {
            debugOverlay.classList.remove('hidden');
            debugToggle.innerHTML = '<i class="fas fa-code"></i> Hide Debug';
        } else {
            debugOverlay.classList.add('hidden');
            debugToggle.innerHTML = '<i class="fas fa-code"></i> Show Debug';
        }
    });
    
    // Initialize sections
    function initSections() {
        const sectionIds = [
            'section-hero', 'section-about', 'section-buffer',
            'section-image1', 'section-image2', 'section-image3',
            'section-work', 'section-education', 'section-projects',
            'section-military', 'section-hobbies', 'section-contact'
        ];
        
        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                sections[id] = {
                    element: el,
                    top: el.offsetTop,
                    bottom: el.offsetTop + el.offsetHeight,
                    height: el.offsetHeight
                };
            }
        });
    }
    
    // Get current section
    function getCurrentSection() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollY + (viewportHeight / 2);
        
        for (const [id, section] of Object.entries(sections)) {
            if (viewportCenter >= section.top && viewportCenter <= section.bottom) {
                return id;
            }
        }
        return null;
    }
    
    // Update header
    function updateHeader() {
        const section = getCurrentSection();
        if (!section) return;
        
        const sectionName = section.replace('section-', '').replace(/-/g, ' ');
        const displayName = sectionName.replace(/\b\w/g, l => l.toUpperCase());
        
        // Special cases for image sections
        if (section === 'section-image1') {
            navTitle.textContent = 'Experiences';
        } else if (section === 'section-image2') {
            navTitle.textContent = 'Details';
        } else if (section === 'section-image3') {
            navTitle.textContent = 'Tech Stack';
        } else {
            navTitle.textContent = displayName;
        }
        
        debugSection.textContent = displayName;
    }
    
    // Start transition to new image
    function transitionTo(newImageIndex) {
        if (newImageIndex === currentImage || isAnimating) return;
        
        console.log(`Transition: ${currentImage} → ${newImageIndex}`);
        
        targetImage = newImageIndex;
        isAnimating = true;
        animationStart = Date.now();
        
        // Show container if transitioning to an image
        if (newImageIndex >= 0) {
            imageContainer.classList.add('visible');
        }
        
        // Start animation
        requestAnimationFrame(animateTransition);
    }
    
    // Animation loop
    function animateTransition() {
        const now = Date.now();
        const elapsed = now - animationStart;
        let progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        
        // Apply easing
        progress = easeInOutCubic(progress);
        
        // Apply transition based on direction
        if (scrollDirection === 'down') {
            applyTransitionDown(progress);
        } else {
            applyTransitionUp(progress);
        }
        
        // Update debug
        debugImageState.textContent = `${currentImage} → ${targetImage} (${Math.round(progress * 100)}%)`;
        
        if (progress < 1) {
            requestAnimationFrame(animateTransition);
        } else {
            // Animation complete
            currentImage = targetImage;
            isAnimating = false;
            nextScrollTriggersTransition = true; // Ready for next scroll
            
            // Hide if no image
            if (currentImage === -1) {
                imageContainer.classList.remove('visible');
            }
            
            console.log(`Transition complete: ${currentImage}`);
        }
    }
    
    // Apply transition for scrolling DOWN
    function applyTransitionDown(progress) {
        if (currentImage === -1 && targetImage === 0) {
            // Enter: Image 1 appears from bottom
            const clipBottom = 100 - (progress * 100);
            images[0].style.clipPath = `inset(0% 0% ${clipBottom}% 0%)`;
            imageLabel.textContent = 'Experiences';
            debugImage1.textContent = `${clipBottom.toFixed(1)}% from bottom`;
        }
        else if (currentImage === 0 && targetImage === 1) {
            // Image 1 → Image 2
            const image1Clip = progress * 100;
            const image2Clip = 100 - (progress * 100);
            images[0].style.clipPath = `inset(0% 0% ${image1Clip}% 0%)`;
            images[1].style.clipPath = `inset(${image2Clip}% 0% 0% 0%)`;
            imageLabel.textContent = 'Details';
            debugImage1.textContent = `${image1Clip.toFixed(1)}% from bottom`;
            debugImage2.textContent = `${image2Clip.toFixed(1)}% from top`;
        }
        else if (currentImage === 1 && targetImage === 2) {
            // Image 2 → Image 3
            const image2Clip = progress * 100;
            const image3Clip = 100 - (progress * 100);
            images[1].style.clipPath = `inset(0% 0% ${image2Clip}% 0%)`;
            images[2].style.clipPath = `inset(${image3Clip}% 0% 0% 0%)`;
            imageLabel.textContent = 'Tech Stack';
            debugImage2.textContent = `${image2Clip.toFixed(1)}% from bottom`;
            debugImage3.textContent = `${image3Clip.toFixed(1)}% from top`;
        }
        else if (currentImage === 2 && targetImage === -1) {
            // Exit: Image 3 disappears from bottom
            const clipBottom = progress * 100;
            images[2].style.clipPath = `inset(0% 0% ${clipBottom}% 0%)`;
            debugImage3.textContent = `${clipBottom.toFixed(1)}% from bottom`;
        }
    }
    
    // Apply transition for scrolling UP (reverse)
    function applyTransitionUp(progress) {
        if (currentImage === 0 && targetImage === -1) {
            // Reverse enter: Image 1 disappears to bottom
            const clipBottom = progress * 100;
            images[0].style.clipPath = `inset(0% 0% ${clipBottom}% 0%)`;
            debugImage1.textContent = `${clipBottom.toFixed(1)}% from bottom`;
        }
        else if (currentImage === 1 && targetImage === 0) {
            // Reverse Image 2 → Image 1
            const image1Clip = 100 - (progress * 100);
            const image2Clip = progress * 100;
            images[0].style.clipPath = `inset(0% 0% ${image1Clip}% 0%)`;
            images[1].style.clipPath = `inset(${image2Clip}% 0% 0% 0%)`;
            imageLabel.textContent = 'Experiences';
            debugImage1.textContent = `${image1Clip.toFixed(1)}% from bottom`;
            debugImage2.textContent = `${image2Clip.toFixed(1)}% from top`;
        }
        else if (currentImage === 2 && targetImage === 1) {
            // Reverse Image 3 → Image 2
            const image2Clip = 100 - (progress * 100);
            const image3Clip = progress * 100;
            images[1].style.clipPath = `inset(0% 0% ${image2Clip}% 0%)`;
            images[2].style.clipPath = `inset(${image3Clip}% 0% 0% 0%)`;
            imageLabel.textContent = 'Details';
            debugImage2.textContent = `${image2Clip.toFixed(1)}% from bottom`;
            debugImage3.textContent = `${image3Clip.toFixed(1)}% from top`;
        }
        else if (currentImage === -1 && targetImage === 2) {
            // Reverse exit: Image 3 appears from bottom
            const clipBottom = 100 - (progress * 100);
            images[2].style.clipPath = `inset(0% 0% ${clipBottom}% 0%)`;
            imageLabel.textContent = 'Tech Stack';
            debugImage3.textContent = `${clipBottom.toFixed(1)}% from bottom`;
        }
    }
    
    // Easing function
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Handle scroll for immediate transitions
    function handleScroll() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // Determine scroll direction and delta
        scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const scrollDelta = Math.abs(scrollY - lastScrollY);
        lastScrollY = scrollY;
        
        // Accumulate scroll for threshold
        scrollAccumulator += scrollDelta;
        
        // Update debug
        debugScroll.textContent = `${Math.round(scrollY)}px (${scrollDirection}, acc: ${Math.round(scrollAccumulator)})`;
        
        // Update header
        updateHeader();
        
        // Get current section
        const newSection = getCurrentSection();
        
        // Reset accumulator and trigger transition when threshold reached
        if (scrollAccumulator >= scrollThreshold && nextScrollTriggersTransition && !isAnimating) {
            scrollAccumulator = 0;
            
            // Determine next image based on current state and scroll direction
            let nextImage = currentImage;
            
            if (scrollDirection === 'down') {
                // Scrolling down - progress through images
                if (currentImage === -1 && (newSection === 'section-buffer' || newSection === 'section-image1')) {
                    nextImage = 0; // Enter image 1
                } else if (currentImage === 0 && newSection === 'section-image2') {
                    nextImage = 1; // Image 1 → 2
                } else if (currentImage === 1 && newSection === 'section-image3') {
                    nextImage = 2; // Image 2 → 3
                } else if (currentImage === 2 && newSection === 'section-work') {
                    nextImage = -1; // Exit
                }
            } else {
                // Scrolling up - reverse through images
                if (currentImage === 2 && newSection === 'section-image2') {
                    nextImage = 1; // Image 3 → 2
                } else if (currentImage === 1 && newSection === 'section-image1') {
                    nextImage = 0; // Image 2 → 1
                } else if (currentImage === 0 && newSection === 'section-buffer') {
                    nextImage = -1; // Exit (reverse enter)
                } else if (currentImage === -1 && newSection === 'section-image3') {
                    nextImage = 2; // Re-enter image 3 (from work)
                }
            }
            
            // Start transition if image changed
            if (nextImage !== currentImage && !isAnimating) {
                transitionTo(nextImage);
                nextScrollTriggersTransition = false; // Wait for current animation to finish
            }
        }
        
        // If we changed sections, reset accumulator to allow immediate transition
        if (newSection !== currentSection) {
            currentSection = newSection;
            scrollAccumulator = scrollThreshold; // Force transition on next scroll
        }
    }
    
    // Initialize
    function init() {
        // Initialize sections
        initSections();
        
        // Set initial state
        images.forEach(img => {
            img.style.clipPath = 'inset(100% 0% 0% 0%)';
        });
        
        currentImage = -1;
        targetImage = -1;
        currentSection = getCurrentSection();
        nextScrollTriggersTransition = true;
        
        // Initial update
        updateHeader();
        
        // Event listeners
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', () => {
            initSections();
        });
    }
    
    // Initialize on load
    window.addEventListener('load', () => {
        setTimeout(init, 100);
    });
});
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