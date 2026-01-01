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
    let isScrolling = false;
    let scrollTimeout;
    let currentSnapPosition = 0;
    let isUserScrolling = true; // Track if user is actively scrolling
    
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
    
    // Create transition markers at specific positions
    function createTransitionMarkers() {
        // Get all sections
        const sections = [
            'section-hero',
            'section-about',
            'section-buffer',
            'section-image1',
            'section-image2',
            'section-image3',
            'section-work',
            'section-education',
            'section-projects',
            'section-military',
            'section-hobbies',
            'section-contact'
        ];
        
        // Get section positions
        const sectionPositions = sections.map(sectionId => {
            const element = document.getElementById(sectionId);
            if (!element) return null;
            
            return {
                id: sectionId,
                top: element.offsetTop,
                bottom: element.offsetTop + element.offsetHeight,
                height: element.offsetHeight
            };
        }).filter(Boolean);
        
        // Create markers at key transition points - FOCUS ON IMAGE FULL STATES
        const markers = [
            // Buffer to Image 1
            { id: 'buffer-mid', section: 'section-buffer', offset: 0.5, label: 'Image 1 Start Reveal' },
            { id: 'image1-start', section: 'section-image1', offset: 0, label: 'Image 1 Section Start' },
            
            // KEY: Image 1 FULLY VISIBLE point (0% clip from top)
            { id: 'image1-full', section: 'section-image1', offset: 0.3, label: 'Image 1 Full (0% clip)' },
            
            // Image 1 to Image 2 transition
            { id: 'image1-to-2', section: 'section-image1', offset: 0.8, label: 'Image 1→2 Transition' },
            { id: 'image2-start', section: 'section-image2', offset: 0, label: 'Image 2 Section Start' },
            
            // KEY: Image 2 FULLY VISIBLE point (0% clip from top)
            { id: 'image2-full', section: 'section-image2', offset: 0.3, label: 'Image 2 Full (0% clip)' },
            
            // Image 2 to Image 3 transition
            { id: 'image2-to-3', section: 'section-image2', offset: 0.8, label: 'Image 2→3 Transition' },
            { id: 'image3-start', section: 'section-image3', offset: 0, label: 'Image 3 Section Start' },
            
            // KEY: Image 3 FULLY VISIBLE point (0% clip from top)
            { id: 'image3-full', section: 'section-image3', offset: 0.3, label: 'Image 3 Full (0% clip)' },
            
            // Image 3 exit
            { id: 'image3-exit', section: 'section-image3', offset: 0.8, label: 'Image 3 Exit Start' },
            { id: 'work-start', section: 'section-work', offset: 0, label: 'Work Section Start' }
        ];
        
        // Calculate marker positions
        return markers.map(marker => {
            const section = sectionPositions.find(s => s.id === marker.section);
            if (!section) return null;
            
            return {
                id: marker.id,
                label: marker.label,
                position: section.top + (section.height * marker.offset),
                section: marker.section,
                offset: marker.offset
            };
        }).filter(Boolean);
    }
    
    // Get transition progress using markers
    function getTransitionProgress(scrollPosition, viewportHeight) {
        const markers = createTransitionMarkers();
        const viewportCenter = scrollPosition + (viewportHeight / 2);
        
        // Sort markers by position
        markers.sort((a, b) => a.position - b.position);
        
        // Find which markers we're between
        for (let i = 0; i < markers.length - 1; i++) {
            const currentMarker = markers[i];
            const nextMarker = markers[i + 1];
            
            if (viewportCenter >= currentMarker.position && viewportCenter <= nextMarker.position) {
                const progress = (viewportCenter - currentMarker.position) / 
                               (nextMarker.position - currentMarker.position);
                
                return {
                    fromMarker: currentMarker,
                    toMarker: nextMarker,
                    progress: Math.max(0, Math.min(1, progress))
                };
            }
        }
        
        // If at the end, return last marker
        if (markers.length > 0) {
            const lastMarker = markers[markers.length - 1];
            if (viewportCenter >= lastMarker.position) {
                return {
                    fromMarker: lastMarker,
                    toMarker: lastMarker,
                    progress: 1
                };
            }
        }
        
        return null;
    }
    
    // Get snap points for proximity snap - FOCUS ON FULL IMAGE POSITIONS
    function getSnapPoints() {
        const markers = createTransitionMarkers();
        
        // We only want to snap to KEY positions where images are fully visible
        const keySnapMarkers = markers.filter(marker => 
            marker.id.includes('full') || // Full image positions
            marker.id.includes('start') || // Section starts
            marker.id.includes('mid') // Mid points
        );
        
        return keySnapMarkers.map(marker => ({
            id: marker.id,
            position: marker.position,
            label: marker.label
        }));
    }
    
    // Apply proximity snap - ONLY when user stops scrolling
    function applyProximitySnap(scrollPosition, viewportHeight) {
        if (isScrolling || !isUserScrolling) return;
        
        const snapPoints = getSnapPoints();
        const snapThreshold = viewportHeight * 0.2; // 20% of viewport for more sensitive snap
        
        // Find the closest snap point
        let closestSnap = null;
        let minDistance = Infinity;
        
        snapPoints.forEach(snapPoint => {
            const distance = Math.abs(scrollPosition + (viewportHeight / 2) - snapPoint.position);
            if (distance < minDistance && distance < snapThreshold) {
                minDistance = distance;
                closestSnap = snapPoint;
            }
        });
        
        // Snap to the closest point (only if it's different from current)
        if (closestSnap && Math.abs(scrollPosition + (viewportHeight / 2) - closestSnap.position) > 10) {
            isScrolling = true;
            isUserScrolling = false;
            currentSnapPosition = closestSnap.position;
            
            // Calculate target scroll position (center the viewport on the snap point)
            const targetScroll = closestSnap.position - (viewportHeight / 2);
            
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
            
            console.log(`Snapping to: ${closestSnap.label} at ${closestSnap.position}px`);
            
            // Reset flags after animation
            setTimeout(() => {
                isScrolling = false;
                isUserScrolling = true;
            }, 600);
        }
    }
    
    // Update image transitions with emphasis on FULL VISIBLE states
    function updateImageTransitions(transitionInfo) {
        if (!transitionInfo) {
            imageContainer.classList.remove('visible');
            return;
        }
        
        const { fromMarker, toMarker, progress } = transitionInfo;
        
        // Update header based on transition
        if (fromMarker.section) {
            updateHeaderTitle(fromMarker.section);
        }
        debugSection.textContent = `${fromMarker.label || fromMarker.id} → ${toMarker.label || toMarker.id}`;
        
        // Handle specific marker transitions with emphasis on 0% clip points
        if (fromMarker.id === 'buffer-mid' && toMarker.id === 'image1-start') {
            // Buffer → Image 1: Start revealing Image 1
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Experiences';
            
            // Image 1 reveals from bottom
            const image1ClipBottom = (1 - progress) * 100;
            
            images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
            debugImage2.textContent = '100% from top';
            debugImage3.textContent = '100% from top';
        }
        else if (fromMarker.id === 'image1-start' && toMarker.id === 'image1-full') {
            // Key transition: Image 1 becomes FULLY VISIBLE (0% clip)
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Experiences';
            
            // Progress from buffer-mid to image1-full should reach 0% clip
            // At image1-full marker, clip should be 0%
            const effectiveProgress = progress;
            const image1ClipBottom = (1 - effectiveProgress) * 50; // Reduce to 0% by image1-full
            
            images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom (Goal: 0%)`;
            debugImage2.textContent = '100% from top';
            debugImage3.textContent = '100% from top';
            
            // At image1-full marker, ensure clip is 0%
            if (fromMarker.id === 'image1-full' || toMarker.id === 'image1-full') {
                images[0].style.clipPath = 'inset(0% 0% 0% 0%)';
                debugImage1.textContent = '0% from bottom (FULLY VISIBLE)';
            }
        }
        else if (fromMarker.id === 'image1-full' && toMarker.id === 'image1-to-2') {
            // Image 1 remains fully visible, prepare for transition
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Experiences';
            
            // Image 1 stays fully visible
            images[0].style.clipPath = 'inset(0% 0% 0% 0%)';
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = '0% from bottom (FULLY VISIBLE)';
            debugImage2.textContent = '100% from top';
            debugImage3.textContent = '100% from top';
        }
        else if (fromMarker.id === 'image1-to-2' && toMarker.id === 'image2-start') {
            // Transition: Image 1 → Image 2
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Details';
            
            // Image 1 clips from bottom, Image 2 reveals from top
            const image1ClipBottom = progress * 100;
            const image2ClipTop = (1 - progress) * 100;
            
            images[0].style.clipPath = `inset(0% 0% ${image1ClipBottom}% 0%)`;
            images[1].style.clipPath = `inset(${image2ClipTop}% 0% 0% 0%)`;
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = `${image1ClipBottom.toFixed(1)}% from bottom`;
            debugImage2.textContent = `${image2ClipTop.toFixed(1)}% from top`;
            debugImage3.textContent = '100% from top';
        }
        else if (fromMarker.id === 'image2-start' && toMarker.id === 'image2-full') {
            // Key transition: Image 2 becomes FULLY VISIBLE (0% clip)
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Details';
            
            const effectiveProgress = progress;
            const image2ClipTop = (1 - effectiveProgress) * 50;
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = `inset(${image2ClipTop}% 0% 0% 0%)`;
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = `${image2ClipTop.toFixed(1)}% from top (Goal: 0%)`;
            debugImage3.textContent = '100% from top';
            
            // At image2-full marker, ensure clip is 0%
            if (fromMarker.id === 'image2-full' || toMarker.id === 'image2-full') {
                images[1].style.clipPath = 'inset(0% 0% 0% 0%)';
                debugImage2.textContent = '0% from top (FULLY VISIBLE)';
            }
        }
        else if (fromMarker.id === 'image2-full' && toMarker.id === 'image2-to-3') {
            // Image 2 remains fully visible
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Details';
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = 'inset(0% 0% 0% 0%)';
            images[2].style.clipPath = 'inset(100% 0% 0% 0%)';
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = '0% from top (FULLY VISIBLE)';
            debugImage3.textContent = '100% from top';
        }
        else if (fromMarker.id === 'image2-to-3' && toMarker.id === 'image3-start') {
            // Transition: Image 2 → Image 3
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Tech Stack';
            
            const image2ClipBottom = progress * 100;
            const image3ClipTop = (1 - progress) * 100;
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = `inset(0% 0% ${image2ClipBottom}% 0%)`;
            images[2].style.clipPath = `inset(${image3ClipTop}% 0% 0% 0%)`;
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = `${image2ClipBottom.toFixed(1)}% from bottom`;
            debugImage3.textContent = `${image3ClipTop.toFixed(1)}% from top`;
        }
        else if (fromMarker.id === 'image3-start' && toMarker.id === 'image3-full') {
            // Key transition: Image 3 becomes FULLY VISIBLE (0% clip)
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Tech Stack';
            
            const effectiveProgress = progress;
            const image3ClipTop = (1 - effectiveProgress) * 50;
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = `inset(${image3ClipTop}% 0% 0% 0%)`;
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = '100% hidden';
            debugImage3.textContent = `${image3ClipTop.toFixed(1)}% from top (Goal: 0%)`;
            
            // At image3-full marker, ensure clip is 0%
            if (fromMarker.id === 'image3-full' || toMarker.id === 'image3-full') {
                images[2].style.clipPath = 'inset(0% 0% 0% 0%)';
                debugImage3.textContent = '0% from top (FULLY VISIBLE)';
            }
        }
        else if (fromMarker.id === 'image3-full' && toMarker.id === 'image3-exit') {
            // Image 3 remains fully visible
            imageContainer.classList.add('visible');
            imageLabel.textContent = 'Tech Stack';
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = 'inset(0% 0% 0% 0%)';
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = '100% hidden';
            debugImage3.textContent = '0% from top (FULLY VISIBLE)';
        }
        else if (fromMarker.id === 'image3-exit' && toMarker.id === 'work-start') {
            // Image 3 exits
            imageContainer.classList.add('visible');
            
            const image3ClipBottom = progress * 100;
            
            images[0].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[1].style.clipPath = 'inset(100% 0% 0% 0%)';
            images[2].style.clipPath = `inset(0% 0% ${image3ClipBottom}% 0%)`;
            
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = '100% hidden';
            debugImage3.textContent = `${image3ClipBottom.toFixed(1)}% from bottom`;
            
            if (progress >= 0.95) {
                imageContainer.classList.remove('visible');
            }
        }
        else if (fromMarker.id.startsWith('section-')) {
            // Default: hide images
            imageContainer.classList.remove('visible');
            debugImage1.textContent = '100% hidden';
            debugImage2.textContent = '100% hidden';
            debugImage3.textContent = '100% hidden';
        }
    }
    
    // Update header title
    function updateHeaderTitle(sectionId) {
        const titleMap = {
            'section-hero': 'Welcome',
            'section-about': 'About Me',
            'section-buffer': 'Continue',
            'section-image1': 'Experiences',
            'section-image2': 'Details', 
            'section-image3': 'Tech Stack',
            'section-work': 'Work Experience',
            'section-education': 'Education',
            'section-projects': 'Projects',
            'section-military': 'Military',
            'section-hobbies': 'Hobbies',
            'section-contact': 'Contact'
        };
        
        if (titleMap[sectionId]) {
            navTitle.textContent = titleMap[sectionId];
        }
    }
    
    // Track user scrolling
    let userScrollTimeout;
    function trackUserScrolling() {
        isUserScrolling = true;
        if (userScrollTimeout) clearTimeout(userScrollTimeout);
        
        // User is considered "done scrolling" after 150ms of no activity
        userScrollTimeout = setTimeout(() => {
            isUserScrolling = false;
        }, 150);
    }
    
    // Main update function
    function updateScrollEffect() {
        const scrollPosition = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // Update debug info
        debugScroll.textContent = `${Math.round(scrollPosition)}px`;
        
        // Get transition progress
        const transitionInfo = getTransitionProgress(scrollPosition, viewportHeight);
        
        // Update image transitions
        updateImageTransitions(transitionInfo);
        
        // Apply proximity snap only when user stops scrolling
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            if (!isScrolling && !isUserScrolling) {
                applyProximitySnap(scrollPosition, viewportHeight);
            }
        }, 200);
    }
    
    // Initialize
    function init() {
        // Set initial clip paths
        images.forEach((img, index) => {
            img.style.clipPath = 'inset(100% 0% 0% 0%)';
        });
        
        updateScrollEffect();
        updateHeaderTitle('section-hero');
    }
    
    // Event Listeners
    let animationFrame;
    window.addEventListener('scroll', function() {
        trackUserScrolling(); // Track that user is actively scrolling
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        animationFrame = requestAnimationFrame(updateScrollEffect);
    });
    
    window.addEventListener('resize', function() {
        updateScrollEffect();
    });
    
    // Initialize on load
    window.addEventListener('load', function() {
        setTimeout(init, 100);
    });
    
    // Initialize
    init();
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