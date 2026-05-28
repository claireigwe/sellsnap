const fs = require('fs');
const path = require('path');

const colorFile = path.resolve(__dirname, 'color-token.json');
const typoFile = path.resolve(__dirname, 'design-tokens.tokens.json');
const outputFile = path.resolve(__dirname, 'tokens.css');

try {
  const colors = JSON.parse(fs.readFileSync(colorFile, 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(typoFile, 'utf8'));

  let cssContent = `/* \n  Auto-generated CSS variables from Design Tokens\n*/\n\n:root {\n  /* Typography Tokens */\n`;

  // Helper to convert camelCase to kebab-case
  const camelToKebab = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  // Process Typography
  const typography = tokens.typography;
  if (typography) {
    for (const group of Object.keys(typography)) {
      const groupData = typography[group];
      for (const variant of Object.keys(groupData)) {
        const variantData = groupData[variant];
        
        for (const prop of Object.keys(variantData)) {
          const propInfo = variantData[prop];
          let value = propInfo.value;
          const type = propInfo.type;

          if (type === 'dimension' && value !== 0 && value !== '0') {
            value = `${value}px`;
          } else if (type === 'string' && prop.toLowerCase().includes('fontfamily') && typeof value === 'string' && value.includes(' ')) {
            value = `"${value}"`;
          }

          const cssVarName = `--${variant}-${camelToKebab(prop)}`;
          cssContent += `  ${cssVarName}: ${value};\n`;
        }
      }
    }
  }

  cssContent += `\n  /* Light Color Roles */\n`;
  const lightRoles = colors?.color?.role?.light;

  // Resolve aliases (e.g. "{color.key.primary}" -> "hsl(...)")
  function resolveColorReference(refValue) {
    if (typeof refValue === 'string' && refValue.startsWith('{') && refValue.endsWith('}')) {
      const keyPath = refValue.slice(1, -1).split('.');
      let curr = colors;
      for (const key of keyPath) {
        if (curr[key] !== undefined) {
          curr = curr[key];
        } else {
          return refValue; // Unresolvable
        }
      }
      return curr === colors ? refValue : curr; 
    }
    return refValue;
  }

  if (lightRoles) {
    for (const role of Object.keys(lightRoles)) {
      const roleValue = lightRoles[role];
      const resolvedValue = resolveColorReference(roleValue);
      cssContent += `  --color-${camelToKebab(role)}: ${resolvedValue};\n`;
    }
  }

  cssContent += `}\n\n`;

  // Process Color Roles (Dark Theme)
  const darkRoles = colors?.color?.role?.dark;
  if (darkRoles) {
    cssContent += `/* Dark Color Roles */\n`;
    cssContent += `.dark, [data-theme="dark"] {\n`;
    for (const role of Object.keys(darkRoles)) {
      const roleValue = darkRoles[role];
      const resolvedValue = resolveColorReference(roleValue);
      cssContent += `  --color-${camelToKebab(role)}: ${resolvedValue};\n`;
    }
    cssContent += `}\n`;
  }

  fs.writeFileSync(outputFile, cssContent);
  console.log(`Successfully generated CSS tokens at ${outputFile}`);

} catch (err) {
  console.error("Error reading or converting tokens:", err);
}
