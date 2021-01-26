import React from 'react';

// Import the required Web Components
// See the documentation here:
// https://sap.github.io/ui5-webcomponents/playground/components/MessageStrip/
import '@ui5/webcomponents/dist/MessageStrip';

export default function ErrorNotice(props) {
  return (
    <ui5-messagestrip type="Warning" no-close-button>
      <b>Encountered the following errors on your request:</b>
      <ul>
        {props.errors.map((error) => (
          <li>{error}</li>
        ))}
      </ul>
    </ui5-messagestrip>
  );
}
