/* SOLIS TOWING — Edit these settings before publishing.
   This file is PUBLIC when hosted on GitHub Pages. Do not add secrets or API keys. */
window.SOLIS_CONFIG = Object.freeze({
  businessName: 'Solis Towing',
  location: 'Columbia Heights, Minnesota', // Business home base / main service area
  phoneDisplay: '', // Example: '(612) 555-0100' — leave empty until confirmed
  phoneE164: '',    // Example: '+16125550100' — no spaces
  email: '',        // Business email address; leave blank until confirmed
  serviceArea: ['Columbia Heights', 'Minneapolis', 'St. Paul', 'Fridley', 'New Brighton', 'Roseville', 'Blaine', 'Brooklyn Park', 'Bloomington'],
  serviceRadius: 'Pickup locations generally within about two hours of Columbia Heights by road. Drop-off destinations may be anywhere in Minnesota, subject to confirmation and availability.',
  stateLimit: 'Minnesota only',
  pickupLimit: 'Approximately two hours driving from Columbia Heights, MN',
  dropoffLimit: 'Any location in Minnesota, subject to route approval and final quote',
  pricing: {
    hookup: 125,                 // Standard dispatch and hookup fee ($)
    loadedPerMile: 5,            // Miles from pickup to destination ($/mi)
    dispatchMilesIncluded: 10,  // Miles from truck to pickup included in hookup
    extraDispatchPerMile: 2,    // Truck-to-pickup miles beyond included ($/mi)
    minimum: 150,                // Minimum subtotal for a standard tow ($)
    largeVehicleFee: 25,        // Large SUV / pickup supplemental fee ($)
    afterHoursFee: 50           // Optional after-hours fee ($)
  }
});
