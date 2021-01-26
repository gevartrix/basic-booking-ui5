import React, { useContext, useEffect, useRef, useState } from 'react';
import Axios from 'axios';

// Import the required Web Components
// See the documentation here:
// https://sap.github.io/ui5-webcomponents/playground/components
import '@ui5/webcomponents/dist/Title';

import userContext from '../../context/userContext';
import PendingsTable from '../elements/PendingsTable';
import ErrorNotice from '../elements/ErrorNotice';

export default function Admin() {
  // Use the global user context to verify that user is authenticated
  const { userData } = useContext(userContext);

  // DEFAULT STATES
  const [pendingBookings, setPendingBookings] = useState([]);
  const [tableReload, setTableReload] = useState();
  const [success, setSuccess] = useState(undefined);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    Axios.get('/api/v1/bookings/pending', { headers: { 'x-auth-token': userData.token } })
      .then((response) => {
        if (response.status === 200) {
          setPendingBookings(response.data.bookings);
          setError(undefined);
        }
      })
      .catch((error) => {
        setError(error.response.data.error);
      });
  }, [userData.token, tableReload]);

  // REFS
  const popupSuccess = useRef(); // Success message (Toast)

  // HANDLERS
  // Generate and append new booking to the list on pressing the 'Book Device' button
  const handleAccept = async (id) => {
    try {
      const acceptBookingRes = await Axios.patch(
        `/api/v1/bookings/${id}/ok`,
        {},
        { headers: { 'x-auth-token': userData.token } }
      );
      setSuccess(acceptBookingRes.data.success);
      popupSuccess.current.show();
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  // Remove a booking from the list by ID on pressing the corresponding 'Delete' button
  const handleDeny = async (id) => {
    try {
      const denyBookingRes = await Axios.patch(
        `/api/v1/bookings/${id}/not`,
        {},
        { headers: { 'x-auth-token': userData.token } }
      );
      setSuccess(denyBookingRes.data.success);
      popupSuccess.current.show();
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  // Paint the UI
  return (
    <div>
      {error && <ErrorNotice errors={error} />}
      {/* The main window */}
      <section className="app-content">
        {/* Set title */}
        <div>
          <ui5-title level="H1" wrap="true" class="app-title">
            Pending Bookings
          </ui5-title>
        </div>

        {/* Table of current pending bookings (see elements/PendingsTable.js) */}
        <div className="list-bookings-wrapper">
          <PendingsTable
            pending={pendingBookings}
            handleAccept={handleAccept}
            handleDeny={handleDeny}
            setTableReload={setTableReload}
          ></PendingsTable>
        </div>
        {success && (
          <ui5-toast duration="5000" placement="BottomCenter" ref={popupSuccess}>
            {success}
          </ui5-toast>
        )}
      </section>
    </div>
  );
}
