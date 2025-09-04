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
<div data-acc="container">
  <details data-acc="item">
    <summary data-acc="header">
      Your Question Here
      <span data-acc="icon">+</span>
    </summary>
    <div data-acc="panel">
      <p>Your answer content here.</p>
    </div>
  </details>
  
  <details data-acc="item">
    <summary data-acc="header">
      Another Question
      <span data-acc="icon">+</span>
    </summary>
    <div data-acc="panel">
      <p>Another answer here.</p>
    </div>
  </details>
</div>
```

### 3. Basic CSS
```css
/* Essential styles for proper animation */
[data-acc="panel"] {
  overflow: hidden;
}

/* Icon rotation example */
[data-acc="icon"] {
  transition: transform 0.3s ease;
}

[data-acc="icon"].active {
  transform: rotate(45deg); /* or 180deg */
}

/* Active state styling */
[data-acc="item"].active [data-acc="header"] {
  color: #007bff;
}
```

## Configuration Options

### Container-Level Attributes

Configure the entire accordion via data attributes on the container:

```html
<div data-acc="container"
     data-acc-single-open="true"
     data-acc-open-first="false"
     data-acc-open-on-hover="false"
     data-acc-close-on-second-click="false"
     data-acc-close-nested-on-parent-close="false"
     data-acc-duration="600ms"
     data-acc-ease="power2.out"
     data-acc-schema="false"
     data-acc-scroll-into-view="false">
  <!-- accordion items -->
</div>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-acc-single-open` | boolean | `true` | Only one item can be open at a time |
| `data-acc-open-first` | boolean | `false` | Automatically open the first accordion item on page load |
| `data-acc-open-on-hover` | boolean | `false` | Open accordion items on hover instead of click |
| `data-acc-close-on-second-click` | boolean | `true` | Allow closing accordion items by clicking the header again |
| `data-acc-close-nested-on-parent-close` | boolean | `false` | Automatically close nested accordion items when parent closes |
| `data-acc-duration` | time | `400ms` | Animation duration (`400ms`, `0.4s`, or `400`) |
| `data-acc-ease` | string | `"power2.inOut"` | GSAP easing function |
| `data-acc-respect-motion` | boolean | `true` | Respect user's motion preferences |
| `data-acc-schema` | boolean | `false` | Generate Schema.org FAQ markup |
| `data-acc-scroll-into-view` | boolean | `false` | Scroll to item when opened using anchor links |
| `data-acc-scroll-delay` | time | `150ms` | Additional delay after animation completion |

**Boolean Attributes**: Optionally, use presence-only for true (`data-acc-single-open`) or explicit values (`data-acc-single-open="false"`).

**Time Values**: Accepts milliseconds (`400ms`), seconds (`0.4s`), or unitless numbers (`400` = milliseconds).

**Note:** URL hash navigation takes priority over the `open-first` setting. If the page loads with a hash (e.g., `#faq-item-2`), the targeted item will open instead of the first item, even when `data-acc-open-first` is set.

**Note:** `schema` doesn't play nicely when items are nested inside the accordion with `schema` enabled.

### Item-Level Attributes

Configure individual accordion items:

```html
<details data-acc="item" data-acc-open>
  <!-- item content -->
</details>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-acc-open` | boolean | `false` | Start this item in open state |

**Note:** Individual item settings (`data-acc-open`) take precedence over container-level settings (`data-acc-open-first`). If any item has `data-acc-open`, the `open-first` feature will be automatically disabled.

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
  containerSelector: '[data-acc="container"]',
  itemSelector: '[data-acc="item"]',
  headerSelector: '[data-acc="header"]',
  bodySelector: '[data-acc="panel"]',
  iconSelector: '[data-acc="icon"]',
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
    closeOnSecondClick: true,
    closeNestedOnParentClose: false
  },
  
  // Schema.org FAQ markup
  schema: {
    enabled: false
  },
  
  // Scroll behavior - uses browser-native anchor links
  scrollToView: {
    enabled: false,
    delay: 0.1  // Additional delay after animation completion (seconds)
  }
};
```

## Advanced Usage

### Nested Accordions
Accordions can be nested to unlimited depth. Each level operates independently:

```html
<div data-acc="container" data-acc-single-open>
  <details data-acc="item">
    <summary data-acc="header">Parent Item</summary>
    <div data-acc="panel">
      <p>Parent content...</p>
      
      <!-- Nested accordion with different settings -->
      <div data-acc="container" data-acc-single-open="false" data-acc-duration="0.6s">
        <details data-acc="item">
          <summary data-acc="header">Child Item 1</summary>
          <div data-acc="panel">
            <p>Child content...</p>
          </div>
        </details>
        
        <details data-acc="item">
          <summary data-acc="header">Child Item 2</summary>
          <div data-acc="panel">
            <p>More child content...</p>
          </div>
        </details>
      </div>
    </div>
  </details>
</div>
```

### Schema.org SEO Support
Automatic FAQ markup generation for search engines:

```html
<!-- This markup is automatically generated when schema is enabled -->
<div data-acc="container" data-acc-schema itemscope itemtype="https://schema.org/FAQPage">
  <details data-acc="item" itemscope itemtype="https://schema.org/Question">
    <summary data-acc="header" itemprop="name">Question</summary>
    <div data-acc="panel">
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
<div data-acc="container" 
     data-acc-scroll-into-view
     data-acc-scroll-delay="150ms">
  <!-- items will scroll into view when opened via anchor links -->
</div>
```

### URL Hash Navigation
Automatically navigate to accordion items via URL hash on page load and hash changes:

```html
<!-- Manual IDs - for predictable URLs -->
<div data-acc="container">
  <details data-acc="item" id="pricing-faq">
    <summary data-acc="header">Pricing Questions</summary>
    <div data-acc="panel">
      <p>Pricing details...</p>
    </div>
  </details>
  
  <details data-acc="item" id="technical-support">
    <summary data-acc="header">Technical Support</summary>
    <div data-acc="panel">
      <p>Support information...</p>
    </div>
  </details>
</div>

<!-- Generated IDs - based on header text -->
<div data-acc="container">
  <details data-acc="item">
    <summary data-acc="header">How do I reset my password?</summary>
    <!-- Auto-generates ID: "how-do-i-reset-my-password" -->
    <div data-acc="panel">
      <p>Password reset instructions...</p>
    </div>
  </details>
</div>
```

**URL Examples:**
- `https://example.com/faq#pricing-faq` → Opens "Pricing Questions" item
- `https://example.com/help#how-do-i-reset-my-password` → Opens password reset item
- Works with nested accordions (opens all ancestor items automatically)

**Scroll-to-View Features:**
- ✅ **Zero Configuration**: Works automatically with any accordion
- ✅ **Manual or Generated IDs**: Supports both approaches
- ✅ **Nested Support**: Opens ancestor items for nested accordions
- ✅ **Smart State Management**: Closes items opened by default when navigating to hash target
- ✅ **Priority Over Auto-Open**: Hash navigation takes priority over `data-acc-open-first` setting
- ✅ **Cross-Accordion**: Works across multiple accordion instances on the same page
- ✅ **Runtime Navigation**: Responds to hash changes after page load
- ✅ **Animation Aware**: Waits for longest animation to complete before scrolling

## Styling

### CSS Classes Applied
The accordion automatically applies classes for easy styling:

```css
/* When an accordion item is open */
[data-acc="item"].active { }
[data-acc="header"].active { }
[data-acc="icon"].active { }
```

## Browser Support

- **Modern Browsers**: Full support with all features
- **Older Browsers**: Graceful degradation to native `<details>`/`<summary>` behavior
- **JavaScript Disabled**: Basic accordion functionality still works

### Requirements
- **GSAP 3.x**: Required for animations

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
- Use `data-acc-duration` to control performance
- Use default `data-acc-respect-motion` for accessibility
- Consider `data-acc-single-open` for better performance with many items

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
[data-acc="icon"] {
  transition: transform 0.3s ease;
  display: inline-block; /* Required for rotation */
}
```

#### Content Not Showing
```html
<!-- Ensure proper structure -->
<details data-acc="item">
  <summary data-acc="header">Header</summary>
  <div data-acc="panel">Content</div> <!-- Must be div, not direct content -->
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
<div data-acc="container" data-acc-respect-motion>
  <!-- Many items -->
</div>
```

#### Complex Nested Structures
- Each nested level creates independent accordion instances
- Consider limiting nesting depth for complexity management
- Use different animation durations for visual hierarchy

### User Interaction Handling

The accordion includes robust handling for edge cases in user interaction:

- **Double-click Prevention**: 100ms throttle prevents rapid clicking conflicts
- **Animation Cancellation**: Ongoing animations are gracefully cancelled when interrupted
- **State Consistency**: Accordion maintains consistent visual and functional state during interruptions
- **Smooth Transitions**: Users can click during animations without visual glitches

## Examples

### FAQ Page
```html
<div data-acc="container" 
     data-acc-single-open 
     data-acc-schema>
  
  <details data-acc="item" data-acc-open>
    <summary data-acc="header">
      How do I get started?
      <span data-acc="icon">+</span>
    </summary>
    <div data-acc="panel">
      <p>Getting started is easy! Just include the script and use semantic HTML.</p>
    </div>
  </details>
  
  <details data-acc="item">
    <summary data-acc="header">
      Is it accessible?
      <span data-acc="icon">+</span>
    </summary>
    <div data-acc="panel">
      <p>Yes! Built with semantic HTML for maximum accessibility.</p>
    </div>
  </details>
</div>
```

### Product Feature List
```html
<div data-acc="container" 
     data-acc-single-open="false" 
     data-acc-open-on-hover
     data-acc-duration="0.6s">
  
  <details data-acc="item">
    <summary data-acc="header">
      Feature One
      <span data-acc="icon">→</span>
    </summary>
    <div data-acc="panel">
      <p>Detailed feature description...</p>
    </div>
  </details>
</div>
```

### Nested Navigation
```html
<div data-acc="container" data-acc-single-open>
  <details data-acc="item">
    <summary data-acc="header">
      Products
      <span data-acc="icon">▼</span>
    </summary>
    <div data-acc="panel">
      
      <div data-acc="container" data-acc-single-open="false">
        <details data-acc="item">
          <summary data-acc="header">Software</summary>
          <div data-acc="panel">
            <ul>
              <li>Web Apps</li>
              <li>Mobile Apps</li>
              <li>Desktop Apps</li>
            </ul>
          </div>
        </details>
        
        <details data-acc="item">
          <summary data-acc="header">Hardware</summary>
          <div data-acc="panel">
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
