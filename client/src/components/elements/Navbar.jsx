import React from 'react';

import '@ui5/webcomponents-fiori/dist/ShellBar';

export default function Navbar() {
  return (
    <>
      {/* Set app's navbar */}
      <ui5-shellbar
        primary-title="BASIC BOOKING UI5 Demo"
        secondary-title="Front-end on UI5 Web Components in React"
      ></ui5-shellbar>
    </>
  );
}
