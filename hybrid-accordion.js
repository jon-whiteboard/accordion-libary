(function() {
    'use strict';

    // Global registry for all accordion instances
    const accordionRegistry = [];
    
    // Hash navigation scheduling
    let hashNavigationScheduled = false;

    // Default configuration
    const defaultOptions = {
        containerSelector: '[data-accordion]',
        itemSelector: '[data-accordion-item]', 
        headerSelector: '[data-accordion-header]',
        bodySelector: '[data-accordion-body]',
        iconSelector: '[data-accordion-icon]',
        activeClass: 'active',
        animation: {
            duration: 0.4,
            ease: 'power2.inOut',
            respectMotionPreference: true
        },
        interactions: {
            singleOpen: true,
            startOpen: false,
            openFirstItem: false,
            openOnHover: false,
            closeOnSecondClick: true
        },

        schema: {
            enabled: false
        },
        scrollToView: {
            enabled: false,
            delay: 100  // Additional delay after animation completion (ms)
        }
    };

    class AccordionItem {
        constructor(element, accordion) {
            this.element = element;
            this.accordion = accordion;
            this.header = element.querySelector(accordion.options.headerSelector);
            this.body = element.querySelector(accordion.options.bodySelector);
            this.icon = element.querySelector(accordion.options.iconSelector);
            
            // Parse item-specific attributes
            this.parseAttributes();
            
            // Assume semantic HTML (<details>/<summary>)
            this.setupAccessibility();
            
            // Set up animations (lazy timeline creation)
            this.setupAnimations();
            
            // Bind events
            this.bindEvents();
            
            // Set initial state
            this.isOpen = false;
            this.setInitialState();
            
            // Add schema markup if enabled
            if (this.accordion.options.schema.enabled) {
                this.setupSchema();
            }
        }

        parseAttributes() {
            this.startOpen = this.element.getAttribute('data-accordion-start-open') === 'true';
            this.closeOnSecondClick = this.element.getAttribute('data-accordion-close-on-second-click') !== 'false';
            this.openOnHover = this.element.getAttribute('data-accordion-open-on-hover') === 'true';
        }

        setupAccessibility() {
            // Require semantic HTML elements
            this.isSemanticHTML = this.element.tagName.toLowerCase() === 'details' && 
                                  this.header && this.header.tagName.toLowerCase() === 'summary';
            if (!this.isSemanticHTML) {
                console.error('HybridAccordion requires <details>/<summary> markup for each item.');
            }
        }

        setupAnimations() {
            // Defer GSAP timeline creation until first open
            this.openTimeline = null;
        }

        createTimelineIfNeeded() {
            if (this.openTimeline) return;
            if (this.accordion.prefersReducedMotion && this.accordion.options.animation.respectMotionPreference) return;

            const { duration, ease } = this.accordion.options.animation;

            this.openTimeline = gsap.timeline({
                paused: true,
                onComplete: () => {
                    this.body.style.height = 'auto';
                    this.refreshScrollTrigger();
                },
                onReverseComplete: () => {
                    if (this.isSemanticHTML) {
                        this.element.removeAttribute('open');
                    }
                    this.refreshScrollTrigger();
                }
            });

            this.openTimeline.fromTo(
                this.body,
                { height: 0, overflow: 'hidden' },
                { height: 'auto', duration, ease }
            );
        }



        bindEvents() {
            // Handle semantic <details>/<summary> elements only
            this.header.addEventListener('click', (event) => {
                if (this.element.hasAttribute('open')) {
                    const containerAllowsClose = !!this.accordion.options.interactions.closeOnSecondClick;
                    if (!this.closeOnSecondClick || !containerAllowsClose) {
                        event.preventDefault();
                        return;
                    }
                    event.preventDefault();
                    this.close();
                }
            });

            // Handle toggle event for both opening and closing
            this.element.addEventListener('toggle', () => {
                if (this.element.open) {
                    // Element was opened via native browser behavior
                    if (!this.isOpen) {
                        // Handle single open mode
                        if (this.accordion.options.interactions.singleOpen) {
                            this.accordion.closeAllExcept(this);
                        }
                        
                        this.isOpen = true;
                        this.addActiveClasses();
                    }
                    this.handleOpen();
                } else {
                    // Element was closed via native browser behavior
                    if (this.isOpen) {
                        this.isOpen = false;
                        this.removeActiveClasses();
                    }
                }
            });

            // Add hover support if enabled
            if (this.openOnHover || this.accordion.options.interactions.openOnHover) {
                this.header.addEventListener('mouseenter', () => {
                    if (!this.isOpen) {
                        this.open();
                    }
                });
            }
        }

        setInitialState() {
            if (this.startOpen) {
                this.isOpen = true;
                this.addActiveClasses();
                
                // Set open attribute for semantic elements
                if (this.isSemanticHTML) {
                    this.element.setAttribute('open', '');
                }
                
                this.body.style.height = 'auto';
            } else {
                this.isOpen = false;
                
                // Remove open attribute for semantic elements
                if (this.isSemanticHTML) {
                    this.element.removeAttribute('open');
                }
                
                gsap.set(this.body, { height: 0, overflow: 'hidden' });
            }
        }

        toggle() {
            if (this.isOpen) {
                const allowClose = !!(this.closeOnSecondClick && this.accordion.options.interactions.closeOnSecondClick);
                if (!allowClose) return;
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            // Handle single open mode
            if (this.accordion.options.interactions.singleOpen) {
                this.accordion.closeAllExcept(this);
            }

            this.isOpen = true;
            this.addActiveClasses();
            
            // Set open attribute for semantic elements
            if (this.isSemanticHTML) {
                this.element.setAttribute('open', '');
            }
            this.handleOpen();
        }

        handleOpen() {
            
            if (this.accordion.prefersReducedMotion && this.accordion.options.animation.respectMotionPreference) {
                // No animation for reduced motion
                this.body.style.height = 'auto';
            } else {
                // Animate opening with GSAP
                this.createTimelineIfNeeded();
                if (this.openTimeline) {
                    this.openTimeline.invalidate();
                    this.openTimeline.play();
                } else {
                    this.body.style.height = 'auto';
                }
            }

            // Scroll to view if enabled - using anchor link approach
            if (this.accordion.options.scrollToView.enabled && !this.accordion.isInitialLoad) {
                // Use animation duration as delay to ensure animations complete before scrolling
                const scrollDelay = this.getScrollDelay();
                setTimeout(() => {
                    this.scrollToAnchor();
                }, scrollDelay);
            }
        }

        close() {
            this.isOpen = false;
            this.removeActiveClasses();
            
            if (this.accordion.prefersReducedMotion && this.accordion.options.animation.respectMotionPreference) {
                // No animation for reduced motion
                if (this.isSemanticHTML) {
                    this.element.removeAttribute('open');
                }
                this.body.style.height = '0';
                this.body.style.overflow = 'hidden';
            } else {
                // Animate closing with GSAP (if exists) or fallback instantly
                if (this.openTimeline) {
                    // Recalculate the current content height before closing
                    const currentHeight = this.body.scrollHeight;
                    
                    // If the content height has changed since timeline creation, invalidate and recreate
                    if (this.body.style.height === 'auto') {
                        gsap.set(this.body, { height: currentHeight });
                    }
                    
                    this.openTimeline.invalidate();
                    this.openTimeline.reverse();
                } else {
                    if (this.isSemanticHTML) {
                        this.element.removeAttribute('open');
                    }
                    this.body.style.height = '0';
                    this.body.style.overflow = 'hidden';
                }
            }
        }

        getScrollDelay() {
            // If reduced motion is preferred, just use the user-configured delay
            if (this.accordion.prefersReducedMotion && this.accordion.options.animation.respectMotionPreference) {
                return this.accordion.options.scrollToView.delay || 0;
            }
            
            // Animation duration (convert to ms) + user-configured post-animation delay
            const animationDurationMs = this.accordion.options.animation.duration * 1000;
            const postAnimationDelay = this.accordion.options.scrollToView.delay || 0;
            
            return animationDurationMs + postAnimationDelay;
        }

        scrollToAnchor() {
            // Ensure the accordion item has an ID for anchor linking
            if (!this.element.id) {
                this.element.id = this.generateUniqueId();
            }
            
            // Use browser-native anchor scrolling
            window.location.hash = this.element.id;
        }

        generateUniqueId() {
            // If element already has an ID, validate it's unique and return it
            if (this.element.id) {
                const existingId = this.element.id;
                // Check if the existing ID is actually unique in the document
                const elementsWithSameId = document.querySelectorAll(`#${CSS.escape(existingId)}`);
                if (elementsWithSameId.length === 1) {
                    // ID is unique, use it
                    return existingId;
                }
                // If not unique, we'll generate a new one based on the existing ID
                let baseId = existingId;
                let counter = 1;
                let uniqueId = `${baseId}-${counter}`;
                
                while (document.getElementById(uniqueId)) {
                    counter++;
                    uniqueId = `${baseId}-${counter}`;
                }
                
                return uniqueId;
            }

            // Generate ID from header text content if available
            const headerText = this.header ? this.header.textContent.trim() : '';
            let baseId = 'accordion-item';
            
            if (headerText) {
                baseId = headerText
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/-+/g, '-') // Replace multiple hyphens with single
                    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
                    .substring(0, 50); // Limit length
                
                // Fallback if cleaning resulted in empty string
                if (!baseId) {
                    baseId = 'accordion-item';
                }
            }
            
            // Ensure uniqueness by checking existing IDs
            let uniqueId = baseId;
            let counter = 1;
            
            while (document.getElementById(uniqueId)) {
                uniqueId = `${baseId}-${counter}`;
                counter++;
            }
            
            return uniqueId;
        }

        setupSchema() {
            this.element.setAttribute('itemscope', '');
            this.element.setAttribute('itemtype', 'https://schema.org/Question');
            this.header.setAttribute('itemprop', 'name');
            
            // Create wrapper for existing content
            const bodyContent = this.body.children;
            const answerWrapper = document.createElement('div');
            answerWrapper.setAttribute('itemscope', '');
            answerWrapper.setAttribute('itemprop', 'acceptedAnswer');
            answerWrapper.setAttribute('itemtype', 'https://schema.org/Answer');
            
            const textWrapper = document.createElement('div');
            textWrapper.setAttribute('itemprop', 'text');
            
            // Move all existing content into the new wrappers
            while (bodyContent.length > 0) {
                textWrapper.appendChild(bodyContent[0]);
            }
            
            answerWrapper.appendChild(textWrapper);
            this.body.appendChild(answerWrapper);
        }

        refreshScrollTrigger() {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }

        addActiveClasses() {
            const { activeClass } = this.accordion.options;
            this.element.classList.add(activeClass);
            if (this.header) this.header.classList.add(activeClass);
            if (this.icon) this.icon.classList.add(activeClass);
        }

        removeActiveClasses() {
            const { activeClass } = this.accordion.options;
            this.element.classList.remove(activeClass);
            if (this.header) this.header.classList.remove(activeClass);
            if (this.icon) this.icon.classList.remove(activeClass);
        }

        // ARIA attributes and ID generation are unnecessary with semantic HTML
    }

    class Accordion {
        constructor(element, options = {}) {
            // Check for GSAP dependency
            if (typeof gsap === 'undefined') {
                console.error('GSAP is required for the Hybrid Accordion. Please include GSAP before initializing the accordion.');
                return;
            }

            this.element = element;
            this.isInitialLoad = true;
            
            // Parse attributes from the accordion container
            this.parseContainerAttributes();
            
            // Merge options
            this.options = this.mergeOptions(defaultOptions, options);
            
            // Centralized motion preference
            this.prefersReducedMotion = false;
            try {
                const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                this.prefersReducedMotion = motionMediaQuery.matches;
                motionMediaQuery.addEventListener('change', (event) => {
                    this.prefersReducedMotion = event.matches;
                });
            } catch (error) {
                this.prefersReducedMotion = false;
            }
            
            // Add FAQ schema markup to container if enabled
            if (this.options.schema.enabled) {
                element.setAttribute('itemscope', '');
                element.setAttribute('itemtype', 'https://schema.org/FAQPage');
            }
            
            // Register this accordion instance globally
            accordionRegistry.push(this);
            
            this.initialize();
        }

        parseContainerAttributes() {
            // Parse container-level configuration from data attributes
            this.containerConfig = {};
            
            const attrs = this.element.attributes;
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                if (attr.name.startsWith('data-accordion-')) {
                    const key = attr.name.replace('data-accordion-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    this.containerConfig[key] = this.parseAttributeValue(attr.value);
                }
            }
        }

        parseAttributeValue(value) {
            // Parse string values to appropriate types
            if (value === 'true') return true;
            if (value === 'false') return false;
            if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);
            return value;
        }

        mergeOptions(defaults, options) {
            // Start from defaults
            const merged = JSON.parse(JSON.stringify(defaults));

            // Map camelCase keys from data-attributes to nested option paths
            const nestedMap = {
                animationDuration: ['animation', 'duration'],
                animationEase: ['animation', 'ease'],
                animationRespectMotionPreference: ['animation', 'respectMotionPreference'],
                schemaEnabled: ['schema', 'enabled'],
                scrollToViewEnabled: ['scrollToView', 'enabled'],
                scrollToViewDelay: ['scrollToView', 'delay']
            };

            const interactionKeys = ['singleOpen', 'startOpen', 'openFirstItem', 'openOnHover', 'closeOnSecondClick'];

            // Apply container attributes
            Object.keys(this.containerConfig).forEach(key => {
                if (nestedMap[key]) {
                    const path = nestedMap[key];
                    let current = merged;
                    for (let i = 0; i < path.length - 1; i++) {
                        if (!current[path[i]]) current[path[i]] = {};
                        current = current[path[i]];
                    }
                    current[path[path.length - 1]] = this.containerConfig[key];
                } else if (interactionKeys.includes(key)) {
                    merged.interactions[key] = this.containerConfig[key];
                } else {
                    merged[key] = this.containerConfig[key];
                }
            });

            // Apply passed options with shallow per-section merges
            const result = { ...merged };
            const sections = ['animation', 'interactions', 'schema', 'scrollToView'];
            sections.forEach((section) => {
                result[section] = { ...merged[section], ...(options[section] || {}) };
            });
            Object.keys(options).forEach((key) => {
                if (!sections.includes(key)) {
                    result[key] = options[key];
                }
            });

            return result;
        }

        // ID management is not required for semantic-only implementation

        initialize() {
            const allItems = this.element.querySelectorAll(this.options.itemSelector);
            const scopedItems = Array.from(allItems).filter((item) => {
                const nearestContainer = item.closest(this.options.containerSelector);
                return nearestContainer === this.element;
            });
            this.items = scopedItems.map(item => new AccordionItem(item, this));
            
            // Handle resize events
            window.addEventListener('resize', () => {
                this.items.forEach(item => {
                    if (item.isOpen) {
                        // Reset height to auto to accommodate content changes
                        if (item.body.style.height !== 'auto') {
                            item.body.style.height = 'auto';
                        }
                        // Clear any cached timeline since content dimensions may have changed
                        if (item.openTimeline) {
                            item.openTimeline.invalidate();
                        }
                    }
                });
            });
            
            // Open first item if option is enabled and no items are already set to start open
            if (this.options.interactions.openFirstItem && this.items.length > 0) {
                const hasItemsSetToStartOpen = this.items.some(item => item.startOpen);
                if (!hasItemsSetToStartOpen) {
                    // Open the first item
                    this.items[0].startOpen = true;
                    this.items[0].setInitialState();
                }
            }
            
            // Schedule hash navigation check after all accordions are likely initialized
            scheduleHashNavigation();
            
            // Mark as initialized
            setTimeout(() => {
                this.isInitialLoad = false;
            }, 100);
        }

        closeAllExcept(exceptItem) {
            // Only close siblings within the same accordion container
            this.items.forEach(item => {
                if (item !== exceptItem && item.isOpen) {
                    // Check if items are siblings (same parent accordion container)
                    if (item.element.parentElement === exceptItem.element.parentElement) {
                        item.close();
                    }
                }
            });
        }


    }

    // Simplified hash navigation - combines scheduling and processing
    function scheduleHashNavigation() {
        if (hashNavigationScheduled) return;
        hashNavigationScheduled = true;
        setTimeout(() => {
            processUrlHash();
            hashNavigationScheduled = false;
        }, 50);
    }

    // Streamlined hash processing
    function processUrlHash() {
        const hash = window.location.hash;
        if (!hash || hash.length <= 1) return;

        const targetId = hash.substring(1);
        let targetItem = findItemById(targetId);
        
        // Generate missing IDs if no match found
        if (!targetItem) {
            generateMissingIds();
            targetItem = findItemById(targetId);
        }
        
        if (targetItem) {
            navigateToItem(targetItem);
        }
    }

    // Consolidated item search and ID generation
    function findItemById(targetId) {
        for (const accordion of accordionRegistry) {
            const item = accordion.items.find(item => item.element.id === targetId);
            if (item) return item;
        }
        return null;
    }

    function generateMissingIds() {
        accordionRegistry.forEach(accordion => {
            accordion.items.forEach(item => {
                if (!item.element.id) {
                    item.element.id = item.generateUniqueId();
                }
            });
        });
    }

    // Simplified navigation with ancestor support
    function navigateToItem(targetItem) {
        const ancestors = getAncestors(targetItem);
        
        // Close non-ancestor open items
        accordionRegistry.forEach(accordion => {
            accordion.items.forEach(item => {
                if (item.isOpen && item !== targetItem && !ancestors.includes(item)) {
                    item.close();
                }
            });
        });
        
        // Open ancestors and target
        [...ancestors, targetItem].forEach(item => {
            if (!item.isOpen) item.open();
        });
        
        // Smart scroll timing based on longest animation
        const delay = Math.max(...accordionRegistry.map(acc => 
            acc.prefersReducedMotion && acc.options.animation.respectMotionPreference ? 0 : acc.options.animation.duration * 1000
        )) + 50;
        
        setTimeout(() => {
            targetItem.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, delay);
    }

    // Simplified ancestor detection
    function getAncestors(targetItem) {
        const ancestors = [];
        let element = targetItem.element.parentElement;
        
        while (element && element !== document.body) {
            // Check all accordions for an item matching this element
            for (const accordion of accordionRegistry) {
                const ancestorItem = accordion.items.find(item => item.element === element);
                if (ancestorItem) {
                    ancestors.unshift(ancestorItem);
                    break;
                }
            }
            element = element.parentElement;
        }
        
        return ancestors;
    }

    // Auto-initialize accordions
    function initAccordions(options = {}) {
        const accordionElements = document.querySelectorAll(options.containerSelector || defaultOptions.containerSelector);
        return Array.from(accordionElements).map(element => new Accordion(element, options));
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAccordions();
            setupHashChangeListener();
        });
    } else {
        initAccordions();
        setupHashChangeListener();
    }

    // Set up hash change listener for runtime navigation
    function setupHashChangeListener() {
        window.addEventListener('hashchange', () => {
            setTimeout(processUrlHash, 10);
        });
    }

    // Export for manual initialization
    window.HybridAccordion = {
        Accordion,
        AccordionItem,
        initAccordions,
        defaultOptions
    };

})();
