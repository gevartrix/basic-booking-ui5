import React from 'react';
import { format } from 'date-fns';

import '@ui5/webcomponents/dist/Table';
import '@ui5/webcomponents/dist/TableCell';
import '@ui5/webcomponents/dist/TableColumn';
import '@ui5/webcomponents/dist/TableRow';

export default function PendingRow({ id, device, user, from, to, handleAccept, handleDeny, setTableReload }) {
  const requestAccept = () => {
    handleAccept(id);
    setTableReload(new Date());
  };

  const requestDeny = () => {
    handleDeny(id);
    setTableReload(new Date());
  };

  // Render the booking table's row containing a single booking's details
  return (
    <ui5-table-row>
      <ui5-table-cell>{device}</ui5-table-cell>
      <ui5-table-cell>{user}</ui5-table-cell>
      <ui5-table-cell>{format(new Date(from), 'MM/dd/yyyy')}</ui5-table-cell>
      <ui5-table-cell>{format(new Date(to), 'MM/dd/yyyy')}</ui5-table-cell>
      <ui5-table-cell>
        <ui5-button design="Positive" onClick={requestAccept}>
          Accept
        </ui5-button>
        <ui5-button design="Negative" onClick={requestDeny}>
          Deny
        </ui5-button>
      </ui5-table-cell>
    </ui5-table-row>
  );
}
