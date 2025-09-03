# Hybrid Accordion

A modern, accessible accordion component that combines the best features from multiple implementations. Built with semantic HTML, GSAP animations, and comprehensive accessibility support.

## Features

### 🎯 **Semantic HTML First**
- **Required** `<details>`/`<summary>` structure for native accessibility
- Progressive enhancement - works without JavaScript
- Built-in keyboard navigation and screen reader support

### 🎬 **Professional Animations**
- GSAP-powered smooth animations with lazy timeline creation
- Automatic motion preference detection (`prefers-reduced-motion`)
- Graceful fallbacks for reduced motion users
- Robust animation cancellation and double-click prevention

### ⚙️ **Zero-Config, Highly Configurable**
- Works out of the box with data attributes
- No JavaScript configuration required for basic usage
- Extensive customization via data attributes or options object

### 🔧 **Advanced Features**
- **URL Hash Navigation**: Automatic navigation to accordion items via URL hash
- Schema.org FAQ markup generation for SEO
- Scroll-to-view functionality using browser-native anchor links
- Nested accordion support (unlimited levels)
- Single-open or multiple-open modes
- Hover interactions
- Icon rotation and state management

### ♿ **Accessibility First**
- Native semantic HTML accessibility
- Motion preference respect
- Focus management
- Screen reader optimized
- WCAG 2.1 compliant

## Quick Start

### 1. Include Dependencies
```html
<!-- GSAP (required) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

```

### 2. Basic HTML Structure
```html
<div data-accordion>
  <details data-accordion-item>
    <summary data-accordion-header>
      Your Question Here
      <span data-accordion-icon>+</span>
    </summary>
    <div data-accordion-body>
      <p>Your answer content here.</p>
    </div>
  </details>
  
  <details data-accordion-item>
    <summary data-accordion-header>
      Another Question
      <span data-accordion-icon>+</span>
    </summary>
    <div data-accordion-body>
      <p>Another answer here.</p>
    </div>
  </details>
</div>
```

### 3. Basic CSS
```css
/* Essential styles for proper animation */
[data-accordion-body] {
  overflow: hidden;
}

/* Icon rotation example */
[data-accordion-icon] {
  transition: transform 0.3s ease;
}

[data-accordion-icon].active {
  transform: rotate(45deg); /* or 180deg */
}

/* Active state styling */
[data-accordion-item].active [data-accordion-header] {
  color: #007bff;
}
```

## Configuration Options

### Container-Level Attributes

Configure the entire accordion via data attributes on the container:

```html
<div data-accordion
     data-accordion-single-open="true"
     data-accordion-open-first-item="true"
     data-accordion-animation-duration="0.6"
     data-accordion-animation-ease="power2.out"
     data-accordion-schema-enabled="true"
     data-accordion-scroll-to-view-enabled="false">
  <!-- accordion items -->
</div>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-accordion-single-open` | boolean | `true` | Only one item can be open at a time |
| `data-accordion-open-first-item` | boolean | `false` | Automatically open the first accordion item on page load |
| `data-accordion-animation-duration` | number | `0.4` | Animation duration in seconds |
| `data-accordion-animation-ease` | string | `"power2.inOut"` | GSAP easing function |
| `data-accordion-animation-respect-motion-preference` | boolean | `true` | Respect user's motion preferences |
| `data-accordion-schema-enabled` | boolean | `false` | Generate Schema.org FAQ markup |
| `data-accordion-scroll-to-view-enabled` | boolean | `false` | Scroll to item when opened using anchor links |
| `data-accordion-scroll-to-view-delay` | number | `100` | Additional delay after animation completion (ms) |

**Note:** URL hash navigation takes priority over the `open-first-item` setting. If the page loads with a hash (e.g., `#faq-item-2`), the targeted item will open instead of the first item, even when `data-accordion-open-first-item="true"` is set.

### Item-Level Attributes

Configure individual accordion items:

```html
<details data-accordion-item 
         data-accordion-start-open="true"
         data-accordion-close-on-second-click="false"
         data-accordion-open-on-hover="true">
  <!-- item content -->
</details>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-accordion-start-open` | boolean | `false` | Start this item in open state |
| `data-accordion-close-on-second-click` | boolean | `true` | Allow closing by clicking again |
| `data-accordion-open-on-hover` | boolean | `false` | Open on hover instead of click |

**Note:** Individual item settings (`data-accordion-start-open`) take precedence over container-level settings (`data-accordion-open-first-item`). If any item has `data-accordion-start-open="true"`, the `open-first-item` feature will be automatically disabled.

## JavaScript API

### Auto-Initialization
The accordion automatically initializes on DOM ready. No JavaScript required for basic usage.

### Manual Initialization
```javascript
// Initialize all accordions on page
HybridAccordion.initAccordions();

// Initialize with custom options
HybridAccordion.initAccordions({
  animation: {
    duration: 0.5,
    ease: 'power2.out'
  },
  interactions: {
    singleOpen: false
  }
});

// Create individual accordion instance
const accordion = new HybridAccordion.Accordion(element, options);
```

### Options Object
```javascript
const options = {
  // Selectors
  containerSelector: '[data-accordion]',
  itemSelector: '[data-accordion-item]',
  headerSelector: '[data-accordion-header]',
  bodySelector: '[data-accordion-body]',
  iconSelector: '[data-accordion-icon]',
  activeClass: 'active',
  
  // Animation settings
  animation: {
    duration: 0.4,
    ease: 'power2.inOut',
    respectMotionPreference: true
  },
  
  // Interaction behavior
  interactions: {
    singleOpen: true,
    startOpen: false,
    openFirstItem: false,
    openOnHover: false,
    closeOnSecondClick: true
  },
  
  // Schema.org FAQ markup
  schema: {
    enabled: false
  },
  
  // Scroll behavior - uses browser-native anchor links
  scrollToView: {
    enabled: false,
    delay: 100  // Additional delay after animation completion (ms)
  }
};
```

## Advanced Usage

### Nested Accordions
Accordions can be nested to unlimited depth. Each level operates independently:

```html
<div data-accordion data-accordion-single-open="true">
  <details data-accordion-item>
    <summary data-accordion-header>Parent Item</summary>
    <div data-accordion-body>
      <p>Parent content...</p>
      
      <!-- Nested accordion with different settings -->
      <div data-accordion data-accordion-single-open="false" data-accordion-animation-duration="0.6">
        <details data-accordion-item>
          <summary data-accordion-header>Child Item 1</summary>
          <div data-accordion-body>
            <p>Child content...</p>
          </div>
        </details>
        
        <details data-accordion-item>
          <summary data-accordion-header>Child Item 2</summary>
          <div data-accordion-body>
            <p>More child content...</p>
          </div>
        </details>
      </div>
    </div>
  </details>
</div>
```

### Hover Interactions
Enable hover-to-open for better user experience:

```html
<div data-accordion data-accordion-open-on-hover="true">
  <!-- items will open on hover -->
</div>
```

### Schema.org SEO Support
Automatic FAQ markup generation for search engines:

```html
<!-- This markup is automatically generated when schema is enabled -->
<div data-accordion itemscope itemtype="https://schema.org/FAQPage">
  <details data-accordion-item itemscope itemtype="https://schema.org/Question">
    <summary data-accordion-header itemprop="name">Question</summary>
    <div data-accordion-body>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <div itemprop="text">
          Answer content
        </div>
      </div>
    </div>
  </details>
</div>
```

### Scroll-to-View
Automatically scroll to opened items using browser-native anchor links:

```html
<div data-accordion 
     data-accordion-scroll-to-view-enabled="true"
     data-accordion-scroll-to-view-delay="150">
  <!-- items will scroll into view when opened via anchor links -->
</div>
```

### URL Hash Navigation
Automatically navigate to accordion items via URL hash on page load and hash changes:

```html
<!-- Manual IDs - for predictable URLs -->
<div data-accordion>
  <details data-accordion-item id="pricing-faq">
    <summary data-accordion-header">Pricing Questions</summary>
    <div data-accordion-body">
      <p>Pricing details...</p>
    </div>
  </details>
  
  <details data-accordion-item id="technical-support">
    <summary data-accordion-header">Technical Support</summary>
    <div data-accordion-body">
      <p>Support information...</p>
    </div>
  </details>
</div>

<!-- Generated IDs - based on header text -->
<div data-accordion>
  <details data-accordion-item>
    <summary data-accordion-header">How do I reset my password?</summary>
    <!-- Auto-generates ID: "how-do-i-reset-my-password" -->
    <div data-accordion-body">
      <p>Password reset instructions...</p>
    </div>
  </details>
</div>
```

**URL Examples:**
- `https://example.com/faq#pricing-faq` → Opens "Pricing Questions" item
- `https://example.com/help#how-do-i-reset-my-password` → Opens password reset item
- Works with nested accordions (opens all ancestor items automatically)

**Features:**
- ✅ **Zero Configuration**: Works automatically with any accordion
- ✅ **Manual or Generated IDs**: Supports both approaches
- ✅ **Nested Support**: Opens ancestor items for nested accordions
- ✅ **Smart State Management**: Closes items opened by default when navigating to hash target
- ✅ **Priority Over Auto-Open**: Hash navigation takes priority over `data-accordion-open-first-item` setting
- ✅ **Cross-Accordion**: Works across multiple accordion instances on the same page
- ✅ **Runtime Navigation**: Responds to hash changes after page load
- ✅ **Animation Aware**: Waits for longest animation to complete before scrolling

## Styling

### CSS Classes Applied
The accordion automatically applies classes for easy styling:

```css
/* When an accordion item is open */
[data-accordion-item].active { }
[data-accordion-header].active { }
[data-accordion-icon].active { }

/* Basic styling example */
[data-accordion] {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

[data-accordion-item] {
  border-bottom: 1px solid #eee;
}

[data-accordion-header] {
  padding: 1rem;
  cursor: pointer;
  background: #f8f9fa;
  border: none;
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[data-accordion-header]:hover {
  background: #e9ecef;
}

[data-accordion-header].active {
  background: #007bff;
  color: white;
}

[data-accordion-body] {
  padding: 1rem;
}

[data-accordion-icon] {
  transition: transform 0.3s ease;
}

[data-accordion-icon].active {
  transform: rotate(180deg);
}
```

## Browser Support

- **Modern Browsers**: Full support with all features
- **Older Browsers**: Graceful degradation to native `<details>`/`<summary>` behavior
- **No JavaScript**: Basic accordion functionality still works

### Requirements
- **GSAP 3.x**: Required for animations
- **Modern Browser**: `<details>`/`<summary>` support (IE 11+ with polyfill)

## Accessibility

### Built-in Features
- ✅ Semantic HTML structure
- ✅ Native keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Motion preference respect
- ✅ Progressive enhancement

### WCAG 2.1 Compliance
The accordion meets WCAG 2.1 AA standards:
- **Keyboard Accessible**: Full keyboard navigation
- **Screen Reader Friendly**: Semantic markup provides context
- **Motion Sensitive**: Respects `prefers-reduced-motion`
- **Focus Visible**: Clear focus indicators

## Performance

### Optimizations
- **Lazy Timeline Creation**: GSAP timelines created only when needed
- **Event Delegation**: Efficient event handling
- **RequestAnimationFrame**: Smooth animations
- **ScrollTrigger Integration**: Automatic layout refresh

### Best Practices
- Use `data-accordion-animation-duration` to control performance
- Set `data-accordion-animation-respect-motion-preference="true"` for accessibility
- Consider `data-accordion-single-open="true"` for better performance with many items

## Edge Cases & Troubleshooting

### Common Issues

#### Animation Not Working
```javascript
// Check if GSAP is loaded
if (typeof gsap === 'undefined') {
  console.error('GSAP is required for Hybrid Accordion');
}
```

#### Icons Not Rotating
```css
/* Ensure icon has transition */
[data-accordion-icon] {
  transition: transform 0.3s ease;
  display: inline-block; /* Required for rotation */
}
```

#### Content Not Showing
```html
<!-- Ensure proper structure -->
<details data-accordion-item>
  <summary data-accordion-header>Header</summary>
  <div data-accordion-body>Content</div> <!-- Must be div, not direct content -->
</details>
```

### Known Limitations

1. **GSAP Dependency**: Requires GSAP for animations
2. **Semantic HTML Required**: Must use `<details>`/`<summary>` structure
3. **Modern Browser**: Requires `<details>`/`<summary>` support

### Performance Considerations

#### Large Numbers of Items (50+)
```html
<!-- Consider disabling animations for performance -->
<div data-accordion data-accordion-animation-respect-motion-preference="true">
  <!-- Many items -->
</div>
```

#### Complex Nested Structures
- Each nested level creates independent accordion instances
- Consider limiting nesting depth for complexity management
- Use different animation durations for visual hierarchy

#### Dynamic Content
```javascript
// If content changes after initialization, heights may need recalculation
// The accordion handles resize events automatically
```

### User Interaction Handling

The accordion includes robust handling for edge cases in user interaction:

- **Double-click Prevention**: 100ms throttle prevents rapid clicking conflicts
- **Animation Cancellation**: Ongoing animations are gracefully cancelled when interrupted
- **State Consistency**: Accordion maintains consistent visual and functional state during interruptions
- **Smooth Transitions**: Users can click during animations without visual glitches

## Examples

### FAQ Page
```html
<div data-accordion 
     data-accordion-single-open="true" 
     data-accordion-schema-enabled="true">
  
  <details data-accordion-item data-accordion-start-open="true">
    <summary data-accordion-header>
      How do I get started?
      <span data-accordion-icon>+</span>
    </summary>
    <div data-accordion-body>
      <p>Getting started is easy! Just include the script and use semantic HTML.</p>
    </div>
  </details>
  
  <details data-accordion-item>
    <summary data-accordion-header>
      Is it accessible?
      <span data-accordion-icon>+</span>
    </summary>
    <div data-accordion-body>
      <p>Yes! Built with semantic HTML for maximum accessibility.</p>
    </div>
  </details>
</div>
```

### Product Feature List
```html
<div data-accordion 
     data-accordion-single-open="false" 
     data-accordion-open-on-hover="true"
     data-accordion-animation-duration="0.6">
  
  <details data-accordion-item>
    <summary data-accordion-header>
      Feature One
      <span data-accordion-icon">→</span>
    </summary>
    <div data-accordion-body>
      <p>Detailed feature description...</p>
    </div>
  </details>
</div>
```

### Nested Navigation
```html
<div data-accordion data-accordion-single-open="true">
  <details data-accordion-item>
    <summary data-accordion-header>
      Products
      <span data-accordion-icon>▼</span>
    </summary>
    <div data-accordion-body>
      
      <div data-accordion data-accordion-single-open="false">
        <details data-accordion-item>
          <summary data-accordion-header>Software</summary>
          <div data-accordion-body>
            <ul>
              <li>Web Apps</li>
              <li>Mobile Apps</li>
              <li>Desktop Apps</li>
            </ul>
          </div>
        </details>
        
        <details data-accordion-item>
          <summary data-accordion-header">Hardware</summary>
          <div data-accordion-body">
            <ul>
              <li>Computers</li>
              <li>Peripherals</li>
              <li>Accessories</li>
            </ul>
          </div>
        </details>
      </div>
      
    </div>
  </details>
</div>
```


## Contributing

### Development Setup
1. Clone the repository
2. Open `hybrid-accordion-demo.html` in a browser
3. Modify `hybrid-accordion.js`
4. Test changes in the demo

### Testing Checklist
- [ ] Basic open/close functionality
- [ ] Single-open mode
- [ ] Multiple-open mode
- [ ] Hover interactions
- [ ] Nested accordions
- [ ] Schema.org markup generation
- [ ] Motion preference respect
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.1.0
- **New**: URL Hash Navigation - automatic navigation to accordion items via URL hash
- **New**: Smart animation timing - scroll timing based on longest animation duration
- **Enhancement**: Cross-accordion hash navigation support
- **Enhancement**: Nested accordion hash navigation with ancestor opening
- **Enhancement**: Runtime hash change detection for dynamic navigation

### v1.0.0
- Initial release
- Semantic HTML structure
- GSAP animations
- Motion preference support
- Schema.org integration
- Nested accordion support
- Comprehensive configuration options
