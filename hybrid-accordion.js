(function() {
    'use strict';

    // Global registry for all accordion instances
    const accordionRegistry = [];
    
    // Hash navigation scheduling
    let hashNavigationScheduled = false;

    // Utility functions for new schema parsing
    function parseTimeValue(value) {
        if (typeof value === 'number') {
            return value / 1000; // Assume milliseconds, convert to seconds
        }
        
        if (typeof value === 'string') {
            const trimmed = value.trim();
            
            if (trimmed.endsWith('ms')) {
                return parseFloat(trimmed.slice(0, -2)) / 1000;
            }
            
            if (trimmed.endsWith('s')) {
                return parseFloat(trimmed.slice(0, -1));
            }
            
            // Unitless string numbers - assume milliseconds
            const parsed = parseFloat(trimmed);
            if (!isNaN(parsed)) {
                return parsed / 1000;
            }
        }
        
        return 0.4; // Default fallback
    }

    function parseBooleanAttribute(element, attributeName) {
        // Check if attribute exists (presence-only)
        if (element.hasAttribute(attributeName)) {
            const value = element.getAttribute(attributeName);
            
            // Empty attribute or no value = true (presence-only)
            if (value === '' || value === null) {
                return true;
            }
            
            // Explicit string values
            if (value === 'true') return true;
            if (value === 'false') return false;
            
            // Presence wins over any other value
            return true;
        }
        
        return false; // Attribute not present
    }

    // Default configuration
    const defaultOptions = {
        containerSelector: '[data-acc="container"]',
        itemSelector: '[data-acc="item"]', 
        headerSelector: '[data-acc="header"]',
        bodySelector: '[data-acc="panel"]',
        iconSelector: '[data-acc="icon"]',
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
            closeOnSecondClick: true,
            closeNestedOnParentClose: false
        },

        schema: {
            enabled: false
        },
        scrollToView: {
            enabled: false,
            delay: 0.1  // Additional delay after animation completion (seconds)
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
            this.startOpen = parseBooleanAttribute(this.element, 'data-acc-open');
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
                    if (!this.accordion.options.interactions.closeOnSecondClick) {
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
            if (this.accordion.options.interactions.openOnHover) {
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
                if (!this.accordion.options.interactions.closeOnSecondClick) return;
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
            
            // Close nested items if enabled
            if (this.accordion.options.interactions.closeNestedOnParentClose) {
                this.closeNestedItems();
            }
            
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
            // If reduced motion is preferred, just use the user-configured delay (convert to ms)
            if (this.accordion.prefersReducedMotion && this.accordion.options.animation.respectMotionPreference) {
                return (this.accordion.options.scrollToView.delay || 0) * 1000;
            }
            
            // Animation duration (convert to ms) + user-configured post-animation delay (convert to ms)
            const animationDurationMs = this.accordion.options.animation.duration * 1000;
            const postAnimationDelayMs = (this.accordion.options.scrollToView.delay || 0) * 1000;
            
            return animationDurationMs + postAnimationDelayMs;
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

        closeNestedItems() {
            // Find all nested accordion containers within this item's body
            const nestedContainers = this.body.querySelectorAll(this.accordion.options.containerSelector);
            
            nestedContainers.forEach(container => {
                // Find the accordion instance for this container
                const nestedAccordion = accordionRegistry.find(acc => acc.element === container);
                
                if (nestedAccordion) {
                    // Close all open items in the nested accordion
                    nestedAccordion.items.forEach(nestedItem => {
                        if (nestedItem.isOpen) {
                            nestedItem.close();
                        }
                    });
                }
            });
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
                if (attr.name.startsWith('data-acc-')) {
                    const key = attr.name.replace('data-acc-', '');
                    
                    // Handle different attribute types
                    let value;
                    if (key === 'duration' || key === 'scroll-delay') {
                        value = parseTimeValue(attr.value);
                    } else if (this.isBooleanAttribute(key)) {
                        value = parseBooleanAttribute(this.element, attr.name);
                    } else {
                        value = attr.value; // String values like ease
                    }
                    
                    this.containerConfig[key] = value;
                }
            }
        }

        isBooleanAttribute(key) {
            const booleanAttributes = [
                'single-open', 'open-first', 'open-on-hover', 
                'close-on-second-click', 'close-nested-on-parent-close',
                'respect-motion', 'scroll-into-view', 'schema'
            ];
            return booleanAttributes.includes(key);
        }


        mergeOptions(defaults, options) {
            // Start from defaults with structured merge
            const merged = {
                ...defaults,
                animation: { ...defaults.animation },
                interactions: { ...defaults.interactions },
                schema: { ...defaults.schema },
                scrollToView: { ...defaults.scrollToView }
            };

            // Map kebab-case keys from new data-acc-* attributes to nested option paths
            const attributeMapping = {
                // Animation options
                'duration': ['animation', 'duration'],
                'ease': ['animation', 'ease'],
                'respect-motion': ['animation', 'respectMotionPreference'],
                
                // Interaction options  
                'single-open': ['interactions', 'singleOpen'],
                'open-first': ['interactions', 'openFirstItem'],
                'open-on-hover': ['interactions', 'openOnHover'],
                'close-on-second-click': ['interactions', 'closeOnSecondClick'],
                'close-nested-on-parent-close': ['interactions', 'closeNestedOnParentClose'],
                
                // Scroll options
                'scroll-into-view': ['scrollToView', 'enabled'],
                'scroll-delay': ['scrollToView', 'delay'],
                
                // Schema
                'schema': ['schema', 'enabled']
            };

            // Apply container attributes using new mapping
            Object.keys(this.containerConfig).forEach(key => {
                if (attributeMapping[key]) {
                    const path = attributeMapping[key];
                    let current = merged;
                    for (let i = 0; i < path.length - 1; i++) {
                        if (!current[path[i]]) current[path[i]] = {};
                        current = current[path[i]];
                    }
                    current[path[path.length - 1]] = this.containerConfig[key];
                } else {
                    // Unknown attribute, ignore (as per schema spec)
                    console.warn(`Unknown data-acc-${key} attribute ignored`);
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
