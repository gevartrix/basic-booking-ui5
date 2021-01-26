import React from 'react';
import { format } from 'date-fns';

import '@ui5/webcomponents/dist/Table';
import '@ui5/webcomponents/dist/TableCell';
import '@ui5/webcomponents/dist/TableColumn';
import '@ui5/webcomponents/dist/TableRow';

export default function BookingRow({ id, device, from, to, handleDetails, handleReturn, setTableReload }) {
  const returnDevice = () => {
    handleReturn(id);
    setTableReload(new Date());
  };

  const showDetails = () => {
    handleDetails(device);
  };

  return (
    <ui5-table-row data-device={device}>
      <ui5-table-cell>{device}</ui5-table-cell>
      <ui5-table-cell>{format(new Date(from), 'MM/dd/yyyy')}</ui5-table-cell>
      <ui5-table-cell>{format(new Date(to), 'MM/dd/yyyy')}</ui5-table-cell>
      <ui5-table-cell>
        <ui5-button onClick={showDetails}>Details</ui5-button>
        <ui5-button design="Emphasized" onClick={returnDevice}>
          Return
        </ui5-button>
      </ui5-table-cell>
    </ui5-table-row>
  );
}
