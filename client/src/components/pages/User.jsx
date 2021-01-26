import React, { useContext, useEffect, useRef, useState } from 'react';
import Axios from 'axios';

// Import the required Web Components
// See the documentation here:
// https://sap.github.io/ui5-webcomponents/playground/components
import '@ui5/webcomponents/dist/Button';
import '@ui5/webcomponents/dist/Title';
import '@ui5/webcomponents/dist/DateRangePicker';
import '@ui5/webcomponents/dist/Option';
import '@ui5/webcomponents/dist/Select';
import '@ui5/webcomponents/dist/Toast';
import '@ui5/webcomponents/dist/Dialog';
import '@ui5/webcomponents/dist/List';

import userContext from '../../context/userContext';
import BookingsTable from '../elements/BookingsTable';
import ErrorNotice from '../elements/ErrorNotice';

export default function User() {
  // Use the global user context to verify that user is authenticated
  const { userData } = useContext(userContext);

  // DEFAULT STATES
  const [devices, setDevices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tableReload, setTableReload] = useState();
  // A chosen device's details
  const [dataDevice, setDataDevice] = useState({});
  const [success, setSuccess] = useState(undefined);
  const [error, setError] = useState(undefined);

  // REFS
  const inputDevice = useRef(); // Device to book (Select)
  const inputDates = useRef(); // Booking and return dates (DateRangePicker)
  const buttonBook = useRef(); // Button to register a booking (Button)
  const dialogDetails = useRef(); // Details dialog window (Dialog)
  const buttonClose = useRef(); // Button to close the details dialog window (Button)
  const popupSuccess = useRef(); // Success message (Toast)

  useEffect(() => {
    Axios.get('/api/v1/bookings/', { headers: { 'x-auth-token': userData.token } })
      .then((response) => {
        if (response.status === 200) {
          setBookings(response.data.bookings);
          setError(undefined);
        }
      })
      .catch((error) => setError(error.response.data.error));
  }, [userData.token, tableReload]);

  useEffect(() => {
    Axios.get('/api/v1/devices/', { headers: { 'x-auth-token': userData.token } })
      .then((response) => {
        setDevices(response.data.devices);
        setError(undefined);
      })
      .catch((error) => setError(error.response.data.error));
  }, [userData.token]);

  // HANDLERS
  // Generate and append new booking to the list on pressing the 'Book Device' button
  const handleBook = async () => {
    try {
      const reqBody = {
        device: inputDevice.current.selectedOption.value,
        from: inputDates.current.firstDateValue,
        to: inputDates.current.lastDateValue,
      };
      const addBookingRes = await Axios.post('/api/v1/bookings/', reqBody, {
        headers: { 'x-auth-token': userData.token },
      });
      setSuccess(addBookingRes.data.message);
      setError(undefined);
      popupSuccess.current.show();
    } catch (error) {
      error.response.data.error && setError(error.response.data.error);
      setSuccess(undefined);
    }
  };

  // Remove a booking from the list by ID on pressing the corresponding 'Delete' button
  const handleReturn = async (id) => {
    try {
      const deleteBookingRes = await Axios.delete(`/api/v1/bookings/${id}`, {
        headers: { 'x-auth-token': userData.token },
      });
      setSuccess(deleteBookingRes.data.success);
      popupSuccess.current.show();
    } catch (error) {
      error.response.data.error && setError(error.response.data.error);
      setSuccess(undefined);
    }
  };

  // On a row click get the chosen device's details and trigger the dialog window
  const handleDetails = async (device_name) => {
    try {
      const getDeviceInfoRes = await Axios.get(`/api/v1/devices/?name=${device_name}`, {
        headers: { 'x-auth-token': userData.token },
      });
      setDataDevice(getDeviceInfoRes.data.devices[0]);
      dialogDetails.current.open();
    } catch (error) {
      error.response.data.error && setError(error.response.data.error);
      setSuccess(undefined);
    }
  };
  // Close the dialog window on hitting the 'Close' button
  const handleClose = () => {
    dialogDetails.current.close();
  };

  // Re-render the bookings table after registering new item
  useEffect(() => {
    buttonBook.current.addEventListener('click', handleBook);
    return () => {
      buttonBook.current.removeEventListener('click', handleBook);
    };
  }, [handleBook]);

  // Paint the UI
  return (
    <div>
      {/* The main window */}
      <section className="app-content">
        {error && <ErrorNotice errors={error} />}
        {/* Set title */}
        <div>
          <ui5-title level="H1" wrap="true" class="app-title">
            My Bookings
          </ui5-title>
        </div>

        {/* Table of current bookings (see elements/BookingsTable.js) */}
        <div className="list-bookings-wrapper">
          <BookingsTable
            bookings={bookings}
            handleDetails={handleDetails}
            handleReturn={handleReturn}
            setTableReload={setTableReload}
          ></BookingsTable>
        </div>

        {/* Panel to create new bookings */}
        <div className="create-booking-wrapper">
          <ui5-select value-state="Success" class="select" ref={inputDevice}>
            {/* Drop down all available devices */}
            {devices.map((device) => (
              <ui5-option value={device.name}>{device.name}</ui5-option>
            ))}
          </ui5-select>
          {/*Select the dates via the date-picker*/}
          <ui5-daterange-picker
            format-pattern="MM/dd/yyyy"
            ref={inputDates}
            placeholder="Pick your dates..."
          ></ui5-daterange-picker>
          {/* Book device */}
          <ui5-button class="add-booking-element-width" ref={buttonBook} design="Emphasized">
            Book Device
          </ui5-button>
        </div>
        {success && (
          <ui5-toast duration="5000" placement="BottomCenter" ref={popupSuccess}>
            {success}
          </ui5-toast>
        )}
      </section>

      {/* Dialog window showing the chosen device's name and listing its details */}
      <ui5-dialog
        header-text={`Device Details for ${dataDevice.name}`}
        resizable="true"
        draggable="true"
        ref={dialogDetails}
      >
        {/* Map the details to the list component */}
        <ui5-list class="full-width">
          <ui5-li description="Model">{dataDevice.model}</ui5-li>
          <ui5-li description="RAM">{dataDevice.ram}</ui5-li>
          <ui5-li description="OS">{dataDevice.os}</ui5-li>
        </ui5-list>
        <div className="dialog-footer">
          {/* The Close button for the dialog window */}
          <ui5-button design="Transparent" ref={buttonClose} onClick={handleClose}>
            Close
          </ui5-button>
        </div>
      </ui5-dialog>
    </div>
  );
}
