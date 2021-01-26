import React from 'react';

import '@ui5/webcomponents/dist/Toast';

export default function SuccessNotice(props) {
  return (
    <ui5-toast duration="5000" placement="BottomCenter" show>
      {props.message}
    </ui5-toast>
  );
}
