/**
 * Hybrid Accordion Component
 * 
 * Combines the best features from multiple accordion implementations:
 * - Semantic <details>/<summary> HTML structure (required)
 * - GSAP animations (lazy timelines) with motion-preference respect
 * - Configurable via data attributes or options (explicit shallow merges)
 * - Optional Schema.org FAQ markup and scroll-into-view
 * 
 * Usage (semantic only):
 * <div data-accordion>
 *   <details data-accordion-item data-accordion-start-open="true">
 *     <summary data-accordion-header>
 *       Question
 *       <span data-accordion-icon>+</span>
 *     </summary>
 *     <div data-accordion-body>Answer content</div>
 *   </details>
 * </div>
 */

(function() {
    'use strict';

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
            openOnHover: false,
            closeOnSecondClick: true
        },

        schema: {
            enabled: true
        },
        scrollToView: {
            enabled: false,
            offset: 100,
            delay: 200,
            duration: 800,
            behavior: 'smooth'
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

            // Scroll to view if enabled
            if (this.accordion.options.scrollToView.enabled && !this.accordion.isInitialLoad) {
                setTimeout(() => {
                    this.scrollIntoView();
                }, this.accordion.options.scrollToView.delay);
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

        scrollIntoView() {
            const { offset, duration, behavior } = this.accordion.options.scrollToView;
            const elementPosition = this.element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            if (duration && duration !== 'smooth') {
                const start = window.pageYOffset;
                const distance = offsetPosition - start;
                const startTime = performance.now();
                
                function animate(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    const ease = t => 1 - Math.pow(1 - t, 3);
                    
                    window.scrollTo(0, start + (distance * ease(progress)));
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                }
                
                requestAnimationFrame(animate);
            } else {
                window.scrollTo({
                    top: offsetPosition,
                    behavior: behavior || 'smooth'
                });
            }
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
                scrollToViewOffset: ['scrollToView', 'offset'],
                scrollToViewDelay: ['scrollToView', 'delay'],
                scrollToViewDuration: ['scrollToView', 'duration'],
                scrollToViewBehavior: ['scrollToView', 'behavior']
            };

            const interactionKeys = ['singleOpen', 'startOpen', 'openOnHover', 'closeOnSecondClick'];

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
            const items = this.element.querySelectorAll(this.options.itemSelector);
            this.items = Array.from(items).map(item => new AccordionItem(item, this));
            
            // Handle resize events
            window.addEventListener('resize', () => {
                this.items.forEach(item => {
                    if (item.isOpen && item.body.style.height !== 'auto') {
                        item.body.style.height = 'auto';
                    }
                });
            });
            
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

    // Auto-initialize accordions
    function initAccordions(options = {}) {
        const accordionElements = document.querySelectorAll(options.containerSelector || defaultOptions.containerSelector);
        return Array.from(accordionElements).map(element => new Accordion(element, options));
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initAccordions());
    } else {
        initAccordions();
    }

    // Export for manual initialization
    window.HybridAccordion = {
        Accordion,
        AccordionItem,
        initAccordions,
        defaultOptions
    };

})();
