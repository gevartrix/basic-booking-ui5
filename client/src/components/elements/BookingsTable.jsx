import React from 'react';

import BookingRow from './BookingRow';

export default function BookingsTable({ bookings, handleDetails, handleReturn, setTableReload }) {
  // Render the table JSX
  return (
    <ui5-table
      class="bookings-table"
      id="table"
      no-data-text="You have no bookings yet."
      show-no-data="true"
      sticky-column-header="true"
    >
      {/* Set up the table's columns */}
      <ui5-table-column slot="columns" min-width="800">
        <b>Device</b>
      </ui5-table-column>

      <ui5-table-column slot="columns" min-width="70">
        <b>From</b> <i>(MM/DD/YYYY)</i>
      </ui5-table-column>

      <ui5-table-column slot="columns" min-width="70">
        <b>To</b> <i>(MM/DD/YYYY)</i>
      </ui5-table-column>

      <ui5-table-column slot="columns" min-width="50">
        Delete Item
      </ui5-table-column>

      {/* For every booking in the array generate a table row (see BookingRow.js) */}
      {bookings.map((booking) => {
        return (
          <BookingRow
            id={booking.id}
            device={booking.device.name}
            from={booking.from}
            to={booking.to}
            handleDetails={handleDetails}
            handleReturn={handleReturn}
            setTableReload={setTableReload}
          ></BookingRow>
        );
      })}
    </ui5-table>
  );
}

/* SET UP RE-USABLE TABLE COMPONENT!!
export default function BookingsTable({ headings, data, handleRowClick, handleDelete }) {
  // Render the table JSX
  return (
    <ui5-table
      class='bookings-table'
      id='table'
      no-data-text='You have no bookings yet.'
      show-no-data='true'
      sticky-column-header='true'
    >
      {headings.map(heading => {
        return (
          <ui5-table-column
            slot='columns'
            min-width={heading['width']}
          >
            {heading['text']}
          </ui5-table-column>
        );
      })}

      {data.map(booking => {
        return (
          <BookingRow
            id={booking.id}
            device={booking.device.name}
            from={booking.from}
            to={booking.to}
            handleRowClick={handleRowClick}
            handleDelete={handleDelete}
          >
          </BookingRow>
        );
      })}
    </ui5-table>
  );
}
*/
