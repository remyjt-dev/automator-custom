# Automator Customizer Script

This repository hosts the JavaScript snippet that controls AI Agents visibility based on SaaS plan status.

## Usage

Add this script tag to any page where you want to control AI Agents visibility:

```html
<script src="https://yourusername.github.io/automator-custom/automator-customizer.min.js"></script>
```

## How it works

The script:
1. Extracts location_id from URLs like `https://app.automator.ai/v2/location/QJ103qxfEO9Dj2mFP0BJ/dashboard`
2. Makes API calls to check SaaS plan status
3. Hides AI Agents elements for premium plans:
   - "Paid - Professional"
   - "Trial - Professional" 
   - "Trial - Ultimate"
   - "Trial Premium"
4. Shows AI Agents elements only for basic plans

## Files

- `automator-customizer.js` - Full readable version
- `automator-customizer.min.js` - Minified version for embedding