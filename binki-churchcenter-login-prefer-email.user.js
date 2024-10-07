// ==UserScript==
// @name binki-churchcenter-login-prefer-email
// @version 1.0.1
// @homepageURL https://github.com/binki/binki-churchcenter-login-prefer-email
// @match https://*.churchcenter.com/*
// @require https://raw.githubusercontent.com/binki/binki-userscript-when-element-query-selector-async/0a9c204bdc304a9e82f1c31d090fdfdf7b554930/binki-userscript-when-element-query-selector-async.js
// ==/UserScript==

(async () => {
  while (true) {
    const deviceValueElement = await whenElementQuerySelectorAsync(document.body, '#device_value:not([type=email])');
    const switchToEmailOrSkipButton = await whenElementQuerySelectorAsync(document.body, 'button.text-btn');
    // There are two different pages with a matching button which we might encounter:
    // 1. The initial login page has the right button. The button just has text nodes.
    // 2. The page which is shown if you try to log in with an unknown number, enter an email address, then click “Edit phone number” after being asked to enter a code. This button has a span/svg in it for the arrow in the “Skip→” button.
    if (switchToEmailOrSkipButton.querySelector('span')) {
      // We are at the page which is only asking about the number and has a “Skip→” button. So don’t click it!
    } else {
      console.log('Detected non-email login form. Switching to email…');
      switchToEmailOrSkipButton.click();

      // Before repeating, wait for the email form to show up in case the form takes time to react before rechecking.
      await whenElementQuerySelectorAsync(document.body, '#device_value[type=email]');
    }

    // Wait for the input to disappear before rechecking in case if the user wants to manually choose mobile number.
    await new Promise(resolve => new MutationObserver((changes, observer) => {
      for (const change of changes) {
        for (const removedNode of change.removedNodes) {
          if (removedNode.contains(deviceValueElement)) {
            observer.disconnect();
            resolve();
          }
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    }));
  }
})();
