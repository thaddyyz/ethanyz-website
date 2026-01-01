// Modal functionality
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalImages = document.getElementById('modal-images');
const modalSections = document.getElementById('modal-sections');
const modalLinks = document.getElementById('modal-links');
const modalProgress = document.getElementById('modal-progress');
let scrollUpdateTimeout;

// Sample data structure for modals
const modalData = {
    'work-exp-1': {
        title: 'Technical Project Manager / Systems Engineer',
        date: '2022 - Present',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Key Experiences',
                icon: 'fas fa-briefcase',
                items: [
                    'Led development of electric motorcycle power electronics systems',
                    'Designed battery pack and BMS components for EV applications',
                    'Managed cross-functional team of engineers and technicians',
                    'Implemented agile project management methodologies'
                ]
            },
            {
                title: 'Key Contributions',
                icon: 'fas fa-trophy',
                items: [
                    'Reduced testing time by 40% through automated test bench development',
                    'Improved battery efficiency by 15% through firmware optimization',
                    'Successfully delivered 3 major product iterations ahead of schedule',
                    'Mentored 5 junior engineers in systems engineering principles'
                ]
            },
            {
                title: 'Reflections',
                icon: 'fas fa-lightbulb',
                items: [
                    'Learned the importance of clear communication in cross-functional teams',
                    'Gained deeper understanding of power electronics and thermal management',
                    'Developed strong problem-solving skills in high-pressure environments',
                    'Appreciated the value of continuous learning in fast-evolving tech field'
                ]
            }
        ],
        links: [] // Empty for work experience
    },
    'project-1': {
        title: 'Currentplex',
        date: '2021',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Key Experiences',
                icon: 'fas fa-bolt',
                items: [
                    'Developed adaptable power allocation system for EV charging networks',
                    'Researched infrastructure challenges in urban EV adoption',
                    'Collaborated with electrical engineers on circuit design',
                    'Conducted market analysis for product positioning'
                ]
            },
            {
                title: 'Technical Contributions',
                icon: 'fas fa-cogs',
                items: [
                    'Designed smart power distribution algorithm',
                    'Implemented real-time monitoring system',
                    'Created user interface for network operators',
                    'Developed predictive maintenance features'
                ]
            }
        ],
        links: [
            {
                text: 'View GitHub Repository',
                url: 'https://github.com/yourusername/currentplex',
                icon: 'fab fa-github'
            },
            {
                text: 'View Live Demo',
                url: 'https://currentplex-demo.com',
                icon: 'fas fa-external-link-alt'
            }
        ]
    }
    // Add more entries for each card
};

function updateProgressBar() {
    const modalContent = document.getElementById('modal-content');
    const scrollTop = modalContent.scrollTop;
    const scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    modalProgress.style.width = `${scrollPercentage}%`;
}

// Function to open modal
function openModal(modalId) {
    const data = modalData[modalId];
    if (!data) {
        console.error('No data found for modal:', modalId);
        return;
    }
    
    // Set basic info
    modalTitle.textContent = data.title;
    modalDate.textContent = data.date;
    
    // Clear previous content
    modalImages.innerHTML = '';
    modalSections.innerHTML = '';
    modalLinks.innerHTML = '';
    
    // Add images
    data.images.forEach(imageUrl => {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'modal-image';
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="${data.title}">`;
        modalImages.appendChild(imageDiv);
    });
    
    // Add sections
    data.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'modal-section';
        
        const itemsHtml = section.items.map(item => 
            `<li>${item}</li>`
        ).join('');
        
        sectionDiv.innerHTML = `
            <h4><i class="${section.icon}"></i> ${section.title}</h4>
            <ul class="dot-list">${itemsHtml}</ul>
        `;
        
        modalSections.appendChild(sectionDiv);
    });
    
    // Add links (for projects)
    if (data.links && data.links.length > 0) {
        data.links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.className = 'modal-link';
            linkElement.target = '_blank';
            linkElement.innerHTML = `
                <i class="${link.icon}"></i> ${link.text}
            `;
            modalLinks.appendChild(linkElement);
        });
    }
    
    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset progress bar
    modalProgress.style.width = '0%';
    
    // Wait for content to render, then attach scroll listener
    setTimeout(() => {
        const modalContent = document.getElementById('modal-content');
        
        // Remove previous listeners if any
        modalContent.removeEventListener('scroll', updateProgressBar);
        
        // Add new scroll listener with throttling
        modalContent.addEventListener('scroll', () => {
            // Throttle the progress bar updates
            if (scrollUpdateTimeout) {
                clearTimeout(scrollUpdateTimeout);
            }
            
            scrollUpdateTimeout = setTimeout(() => {
                updateProgressBar();
            }, 10); // Update every 10ms while scrolling
        });
        
        // Initial progress bar update
        updateProgressBar();
    }, 50);
}

// Function to close modal (updated)
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset progress bar
    modalProgress.style.width = '0%';
    
    // Remove scroll listener
    const modalContent = document.getElementById('modal-content');
    modalContent.removeEventListener('scroll', updateProgressBar);
    
    // Clear timeout
    if (scrollUpdateTimeout) {
        clearTimeout(scrollUpdateTimeout);
    }
}
// function openModal(modalId) {
//     const data = modalData[modalId];
//     if (!data) {
//         console.error('No data found for modal:', modalId);
//         return;
//     }
    
//     // Set basic info
//     modalTitle.textContent = data.title;
//     modalDate.textContent = data.date;
    
//     // Clear previous content
//     modalImages.innerHTML = '';
//     modalSections.innerHTML = '';
//     modalLinks.innerHTML = '';
    
//     // Add images
//     data.images.forEach(imageUrl => {
//         const imageDiv = document.createElement('div');
//         imageDiv.className = 'modal-image';
//         imageDiv.innerHTML = `<img src="${imageUrl}" alt="${data.title}">`;
//         modalImages.appendChild(imageDiv);
//     });
    
//     // Add sections
//     data.sections.forEach(section => {
//         const sectionDiv = document.createElement('div');
//         sectionDiv.className = 'modal-section';
        
//         const itemsHtml = section.items.map(item => 
//             `<li>${item}</li>`
//         ).join('');
        
//         sectionDiv.innerHTML = `
//             <h4><i class="${section.icon}"></i> ${section.title}</h4>
//             <ul class="dot-list">${itemsHtml}</ul>
//         `;
        
//         modalSections.appendChild(sectionDiv);
//     });
    
//     // Add links (for projects)
//     if (data.links && data.links.length > 0) {
//         data.links.forEach(link => {
//             const linkElement = document.createElement('a');
//             linkElement.href = link.url;
//             linkElement.className = 'modal-link';
//             linkElement.target = '_blank';
//             linkElement.innerHTML = `
//                 <i class="${link.icon}"></i> ${link.text}
//             `;
//             modalLinks.appendChild(linkElement);
//         });
//     }
    
//     // Show modal
//     modalOverlay.classList.add('active');
//     document.body.style.overflow = 'hidden';
// }

// // Function to close modal
// function closeModal() {
//     modalOverlay.classList.remove('active');
//     document.body.style.overflow = '';
// }

// Event listeners
modalClose.addEventListener('click', closeModal);
// modalOverlay.addEventListener('click', (e) => {
//     if (e.target === modalOverlay) {
//         closeModal();
//     }
// });

modalOverlay.addEventListener('click', (e) => {
    // Check if click is on the overlay itself (not modal content or close button)
    if (e.target === modalOverlay || e.target.closest('.modal-close')) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// keyboard navigation with progress bar awareness
document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Optional: Add arrow key navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const modalContent = document.getElementById('modal-content');
        const scrollAmount = e.key === 'ArrowDown' ? 100 : -100;
        modalContent.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
});

// Initialize modal buttons
function initModalButtons() {
    const detailButtons = document.querySelectorAll('.card-link');
    
    detailButtons.forEach((button) => {
        button.href = '#';
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get modal ID based on button's data attribute or card content
            const modalId = button.getAttribute('data-modal-id') || 
                           getModalIdFromCard(button.closest('.glass-card'));
            
            if (modalId) {
                openModal(modalId);
            }
        });
        
        button.innerHTML = 'View Details <i class="fas fa-external-link-alt"></i>';
    });
}

// Helper function to get modal ID from card
function getModalIdFromCard(card) {
    if (!card) return null;
    
    const title = card.querySelector('h3').textContent;
    const date = card.querySelector('.card-date').textContent;
    
    // Map card content to modal IDs
    if (title.includes('Currentplex')) return 'project-1';
    if (title.includes('Technical Project Manager')) return 'work-exp-1';
    if (title.includes('Power Electronics')) return 'work-exp-2';
    if (title.includes('Software Intern')) return 'work-exp-3';
    if (title.includes('Project Developer')) return 'work-exp-4';
    if (title.includes('Formula SAE')) return 'project-2';
    if (title.includes('Autonomous Wheelchair')) return 'project-3';
    
    return null;
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Your existing scroll lock code...
    
    // Initialize modal buttons after a delay
    setTimeout(initModalButtons, 1000);
});