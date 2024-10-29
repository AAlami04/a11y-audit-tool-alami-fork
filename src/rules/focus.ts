export function checkFocus(html: string): boolean {
  const focusRules = [
    checkSkipToMainContent,
    checkFocusIndicator,
    checkKeyboardAccessible,
    checkFocusOrder,
    checkFocusTrap,
  ];

  return focusRules.every(check => check(html));
}

/**
 * Skip to Main Content
 * Ensures the "Skip to main content" link is the first focusable element, hidden with "sr-only" or similar class.
 */
function checkSkipToMainContent(html: string): boolean {
  const skipLinkRegex = /<a[^>]+class=["'][^"']*sr-only[^"']*["'][^>]*>.*?Skip to main content<\/a>/i;
  const firstFocusableElementRegex = /<(a|button|input|textarea|select)\b[^>]*>/i;

  const firstMatch = firstFocusableElementRegex.exec(html);
  if (firstMatch && skipLinkRegex.test(firstMatch[0])) {
    return true;
  }

  console.warn(`"Skip to main content" link is missing or not the first focusable element.`);
  return false;
}

/**
 * Focus Indicator
 * Ensures all keyboard-operable elements have a visible focus indicator.
 */
function checkFocusIndicator(html: string): boolean {
  const focusableElementsRegex = /<(button|a|input|select|textarea)\b([^>]*)>/gi;
  let match;
  let isValid = true;

  while ((match = focusableElementsRegex.exec(html)) !== null) {
    const styles = match[2];
    if (!/\boutline\b/.test(styles) && !/\bborder\b/.test(styles)) {
      console.warn(`Element ${match[0]} may lack a visible focus indicator.`);
      isValid = false;
    }
  }
  return isValid;
}

/**
 * Keyboard Accessibility
 * Ensures all clickable elements are accessible via keyboard (i.e., focusable).
 */
function checkKeyboardAccessible(html: string): boolean {
  const clickableElementsRegex = /<(button|a|input|select)\b([^>]*)>/gi;
  let match;
  let isValid = true;

  while ((match = clickableElementsRegex.exec(html)) !== null) {
    const tabIndexMatch = /\btabindex=["']-?\d+["']/i.test(match[2]);
    if (!tabIndexMatch) {
      console.warn(`Clickable element ${match[0]} is not keyboard accessible.`);
      isValid = false;
    }
  }
  return isValid;
}

/**
 * Focus Order
 * Ensures logical and meaningful focus order based on tabindex attributes.
 */
function checkFocusOrder(html: string): boolean {
  const focusableElements = Array.from(html.matchAll(/<(button|a|input|select|textarea|div)\b([^>]*)>/gi));
  const tabIndexes = focusableElements.map(element => {
    const tabIndexMatch = element[2].match(/\btabindex=["'](\d+)["']/);
    return tabIndexMatch ? parseInt(tabIndexMatch[1], 10) : 0;
  });

  const isOrdered = tabIndexes.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  if (!isOrdered) {
    console.warn(`Focus order is not logical or meaningful.`);
  }

  return isOrdered;
}

/**
 * Focus Trap Prevention
 * Ensures there’s no focus trap within interactive components like modals.
 */
function checkFocusTrap(html: string): boolean {
  const modalRegex = /<div[^>]*\brole=["']dialog["'][^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  let isValid = true;

  while ((match = modalRegex.exec(html)) !== null) {
    const modalContent = match[1];
    const hasFocusableContent = /(button|a|input|select|textarea)\b/i.test(modalContent);
    if (!hasFocusableContent) {
      console.warn(`Modal/dialog lacks focusable elements, causing a potential focus trap.`);
      isValid = false;
    }
  }
  return isValid;
}
