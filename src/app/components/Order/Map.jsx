import React, { useState, useEffect } from 'react';
import './Map.css';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '300px',
  height: '270px'
};

const farmerLocation = {
    lat: 6.5244, 
    lng: 3.3792 
};

export const MapContents = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyCv5Glly8TImvfsW2sGRFUo_vhuxBl69vM" 
  });

  const [map, setMap] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(null);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handlePickupAddressChange = (event) => {
    setPickupAddress(event.target.value);
  };

  const handleDeliveryAddressChange = (event) => {
    setDeliveryAddress(event.target.value);
  };

  const calculateDeliveryFee = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupAddress }, (pickupResults, pickupStatus) => {
      if (pickupStatus === 'OK' && pickupResults[0]) {
        const pickupLocation = pickupResults[0].geometry.location;
        geocoder.geocode({ address: deliveryAddress }, (deliveryResults, deliveryStatus) => {
          if (deliveryStatus === 'OK' && deliveryResults[0]) {
            const deliveryLocation = deliveryResults[0].geometry.location;
            const distance = calculateDistance(pickupLocation, deliveryLocation);
            const fee = distance * 200; 
            setDeliveryFee(fee.toFixed(2)); 
          } else {
            console.error('Geocode was not successful for the delivery address:', deliveryStatus);
          }
        });
      } else {
        console.error('Geocode was not successful for the pickup address:', pickupStatus);
      }
    });
  };

  const calculateDistance = (start, end) => {
    const R = 6371; 
    const dLat = deg2rad(end.lat() - start.lat());
    const dLng = deg2rad(end.lng() - start.lng());
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(start.lat())) * Math.cos(deg2rad(end.lat())) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    if (pickupAddress !== '' && deliveryAddress !== '') {
      calculateDeliveryFee();
    }
  }, [pickupAddress, deliveryAddress]);

  return isLoaded ? (
    <div className='puts'>
      <div className='text'>
      <br />
        <label htmlFor="pickupAddress">Enter Pickup Address:</label>
        <input type="text" id="pickupAddress" value={pickupAddress} onChange={handlePickupAddressChange} />
        <br />
        <label htmlFor="deliveryAddress">Enter Delivery Address:</label>
        <input type="text" id="deliveryAddress" value={deliveryAddress} onChange={handleDeliveryAddressChange} />
        <br />
        <label htmlFor="DeliveryFee">Delivery Fee:</label>
        <input type="text" id="deliveryAddress" value={deliveryFee} />
        {deliveryFee !== null}
      </div>
      <div className='map'>
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={farmerLocation}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        >
        <div></div>
        </GoogleMap>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );

};
