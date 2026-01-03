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
        date: '2022 - 2024',
        images: [
            '../images/softwareion2.jpg',
            '../images/pe2.jpg'
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
                    'This was my first professional experience during my bachelor’s degree, and I thoroughly enjoyed it due to the unique mix of hardware, software, and cross-cultural collaboration. I worked closely with team members from six different countries, which shaped both my technical growth and professional mindset early on.',
                    'One of my earliest lessons was the importance of quality. I initially believed that my first project—delivering the company’s first fully functional, automated Hardware-In-Loop (HIL) testing setup for vehicle systems—was well within my capabilities. I even added extra features I thought the team would find valuable, such as remote control functionality so an embedded engineer based in Vietnam could run tests independently. I completed the setup and code within six weeks and was proud of the outcome. However, during my CTO’s code review, I learned a hard lesson: while the system worked, the code quality was far below industry expectations. I had to rewrite the entire program from scratch. That experience fundamentally changed how I approach engineering—quality, maintainability, and clarity matter just as much as functionality.',
                    'My role at ION Mobility evolved rapidly. As a software intern, I had to pick up new languages and frameworks. As a firmware engineer working on power electronics, I had to understand specialised tools and low-level systems. As a project manager, I had to learn how to communicate clearly across disciplines. As a systems engineer, I needed a working understanding of nearly every subsystem in the vehicle to translate user needs into actionable technical requirements. Each transition exposed how much I did not yet know. I learned that the fastest way to grow was to talk to people, identify my gaps, and actively seek ways to fill them. Learning became less about documentation alone and more about collaboration.',
                    'I also learned how team dynamics can define success. Early on, we were a small development team of seven without a project manager. We delivered, but slowly and inefficiently. When an experienced project manager joined, the transition was difficult—technical leads felt constrained, and engineers struggled to accept direction from someone unfamiliar with their technical challenges. Within six months, he was let go. Later, I was asked to step into a project management role for vehicle systems, despite initially requesting to remain purely a software engineer. I immediately felt the shift—engineers and technical leads I had worked closely with became more guarded. To overcome this, I adopted a collaborative approach: asking instead of directing, spending time understanding constraints, helping with debugging, building tools for engineers, and being present as part of the team rather than above it. Trust took time, but by the point I left, all prioritised features and critical bugs were cleared for the V1 release. I learned that leadership, especially as a young manager among experienced engineers, is earned through empathy, contribution, and consistency—not authority.',
                    'Fourth, I learned about the value of communication: manny issues we faced boiled down to communication, which was challenging for 2 reasons, working culture, technical language. I learned to never assume as just be clear what I say, often checking in with product owners and developer on the clarity of espectations and deliverables.',
                    'Finally, I learned about the value of my value. One of the most important lessons came toward the end of my time at ION Mobility. My CEO often told me, “Your job is to put out fires.” I interpreted this as finding opportunities to add value wherever possible. In doing so, I identified several systemic issues—how digital keys were managed in production, how fragmented diagnostic tools made fault isolation difficult, and how ineffective bug reporting slowed development. Addressing these became some of my most impactful contributions as a TPM and systems engineer. During my exit interview, however, my CEO surprised me by saying he was disappointed. He explained that my unique value was not just solving these problems, but the holistic understanding I had gained by working at the intersection of engineering teams, manufacturing, and management. That perspective was something only I had—but I never escalated it to him. Reflecting on this, I realised that while solving problems was expected of my role, offering strategic insight was not—and that was the value I failed to fully communicate. It reshaped how I now think about ownership, responsibility, and speaking up.',
                ]
            }
        ],
        links: [
            {
                text: 'View ION Mobility Website (Before buyout*)',
                url: 'https://ionmobility.com/'
            },
        ] // Empty for work experience
    },
    'work-exp-2': {
        title: 'Software Lead',
        date: '2022 - Present',
        images: [
            
        ],
        sections: [
            {
                title: 'Key Experiences & Reflections',
                icon: 'fas fa-briefcase',
                items: [
                    'First-time being fully responsible for implementing a full platform',
                    'I faced the challenge not just of decideing the platforms, frameworks to use, but having to be clear of my decisions and justifications.',
                    'However, they key value was being able to adapt my previous experience and observations of how the technical leads in my previous company operated, I had to contact some of the software leads to ask for advise too.',
                    'I also had the chance to apply my new found understanding of systems engineering, espacially when it came to integrating components with the team.'
                ]
            },
            {
                title: 'Key Contributions',
                icon: 'fas fa-trophy',
                items: [
                    'Led the development of its first platform with 2 others in development',
                    'Designed the system architecture, implemented the architecture',
                    'Primarily developed the database, backend services, and POS android application',
                    'Guided the development team on integration',
                    'Interfaced with non-technical teams to plan and deliver product requirements'
                ]
            }
        ],
        links: [
            {
                text: 'View Snappit Website',
                url: 'https://snapp-it.com/'
            },
        ] // Empty for work experience
    },
    'edu-exp-1': {
        title: 'Diploma of Engineering in Engineering Science',
        date: '2015 - 2018',
        images: [
        ],
        sections: [
            {
                title: 'Key Courses',
                icon: 'fas fa-briefcase',
                items: [
                    '',
                    
                ]
            },
            {
                title: 'Reflections',
                icon: 'fas fa-lightbulb',
                items: [
                    'First look into engineering, learning mechanical, electrical, computer, and chemical engineering cources',
                    'Allowed me to explore different engineering doamins',
                    'The best experience was the final year project, as finally there is concrete use of what I learnt',
                ]
            }
        ],
        links: [
        ] // Empty for work experience
    },
    'edu-exp-2': {
        title: 'Bachelors in Computer Engineering',
        date: '2020 - 2023',
        images: [
        ],
        sections: [
            {
                title: 'Key Courses',
                icon: 'fas fa-briefcase',
                items: [
                    'Internet of Things',
                    'Human Robot Interaction',
                    'Electric Vehicles and Power Grid',
                    'Data Structures and algorithms',
                    'Advanced algorithms',
                    'Network'
                ]
            },
            {
                title: 'Reflections',
                icon: 'fas fa-lightbulb',
                items: [
                    'Learned the need to be cross disciplined',
                    'Overall, learning development is difficult, but the challenge should encourage me to create',
                    'In terms of technical knowledge, it was useless, outdated, academic, the greatest lesson is how to approach development',
                    'And most importantly, the connections thought the course, Sheares hall, NUS Overseas College, and Innovation and Design Program that gave me different unique opportunities'
                ]
            }
        ],
        links: [
        ] // Empty for work experience
    },
    'edu-exp-3': {
        title: 'Masters of Science in systems Engineering Management',
        date: '2024 - 2025',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Key Courses',
                icon: 'fas fa-briefcase',
                items: [
                    'Systems Thinking & Engineering Management',
                    'Systems Design',
                    'Project Management',
                    'Risk, Reliability, and Resilience',
                ]
            },
            {
                title: 'Key learning',
                icon: 'fas fa-lightbulb',
                items: [
                    'Solving complex problems first with understanding through rich picture',
                    'Understanding the importance of clear technical requirements',
                    'Understand the requirements at each stage of the full product lifecycle',
                    'Matrix leadership, briging between technical leadership and directional leadership'
                ]
            }
        ],
        links: [] // Empty for work experience
    },
    'project-1': {
        title: 'Other Projects',
        date: '2021',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Projects',
                icon: 'fas fa-bolt',
                items: [
                    'unidirection LiDAR autonomous RC car',
                    'Keyboard mouse commbo',
                    'Hrdroponics pot with automated water, nutient dispending based on pH and electrical conductivity of water.',
                    'RFID device to enter every room in my highschool',
                    'Multiplayer VR karaoke game: 2nd place at SOCTech Showcase'
                ]
            }
        ],
        links: [
        ]
    },
    'project-2': {
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
            }
        ]
    },
    'project-3': {
        title: 'Formula SAE',
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
            }
        ]
    },
    'project-4': {
        title: 'Currentplex',
        date: '2021',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Problem Statement',
                icon: 'fas fa-bolt',
                items: [
                    'Developed adaptable power allocation system for EV charging networks',
                ]
            },
            {
                title: 'Contribution and Learning',
                icon: 'fas fa-cogs',
                items: [
                    'Designed the proposal',
                    'Developed a new power control method, to be ensure sustainability with Singapore’s current power network',
                    'Researched infrastructure challenges in urban EV adoption',
                    'Developed a new power (Current) control circult',
                    'Tested different charging patterns and their characteristics with lithium batteries',
                    'Developed a lot of CAD and animated illustrations'
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
    },
    'project-5': {
        title: 'ProjectShare',
        date: '2021',
        images: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        sections: [
            {
                title: 'Problem Statement',
                icon: 'fas fa-bolt',
                items: [
                    'Connecting with people, networking is fun, there should be a means not just to make it simple, but showcase the joy of meeting and connecting with people.',
                ]
            },
            {
                title: 'Technical Contribution and Learning',
                icon: 'fas fa-cogs',
                items: [
                    'Developed a peer to peer NFC data transfer library in kotlin for use in flutter',
                    'Optimised a stateflow within app, to reduce API calls with offline first design',
                    'Learned how to setup environment for developing and publishing apps, and website',
                    'Developing a scalable backend with a gateway and microservices.',
                    'Developing a diagnostics tool to monitor logs and status from all platforms Supabase, Vercel, GCP, Google Play Console, and Apple Store connect.'
                ]
            }
        ],
        links: [
            {
                text: 'View ProjectShare Website',
                url: 'https://github.com/yourusername/currentplex',
                icon: 'fab fa-github'
            },
            {
                text: 'View My rojectShare profile',
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
    if (title.includes('ProjectShare')) return 'project-5';
    if (title.includes('Currentplex')) return 'project-4';
    if (title.includes('Formula SAE')) return 'project-3';
    if (title.includes('Autonomous Wheelchair')) return 'project-2';
    if (title.includes('Others')) return 'project-1';
    if (title.includes('Snappit')) return 'work-exp-2';
    if (title.includes('ION Mobility')) return 'work-exp-1';
    if (title.includes('University College London')) return 'edu-exp-3';
    if (title.includes('National University of Singapore')) return 'edu-exp-2';
    if (title.includes('Ngee Ann Polytechnic')) return 'edu-exp-1';
    
    
    return null;
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Your existing scroll lock code...
    
    // Initialize modal buttons after a delay
    setTimeout(initModalButtons, 1000);
});