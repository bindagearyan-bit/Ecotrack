/**
 * Carbon calculation utility functions
 * Estimates CO2 emissions in kg
 */

export const calculateTransportCarbon = (trips = []) => {
  let total = 0;
  trips.forEach(trip => {
    const distance = parseFloat(trip.distance) || 0;
    switch (trip.mode) {
      case 'Car':
        const fuelFactor = trip.fuel === 'Diesel' ? 0.22 : trip.fuel === 'Electric' ? 0.05 : 0.20; // Petrol / default
        total += distance * fuelFactor;
        break;
      case 'Bus':
        total += distance * 0.09; // 0.09 kg per km
        break;
      case 'Train':
        total += distance * 0.04; // 0.04 kg per km
        break;
      case 'Flight':
        const flightsCount = parseInt(trip.flightsNum) || 0;
        const flightFactor = trip.flightType === 'Long' ? 600 : 150; // Short = 150kg, Long = 600kg
        total += flightsCount * flightFactor;
        break;
      case 'Cycling':
      case 'Walking':
      default:
        total += 0;
        break;
    }
  });
  return parseFloat(total.toFixed(1));
};

export const calculateFoodCarbon = (days = {}) => {
  const factors = {
    redMeat: 6.61, // kg per day
    poultry: 2.15,
    fish: 1.45,
    dairy: 1.80,
    vegan: 0.40
  };
  
  let total = 0;
  total += (days.redMeat || 0) * factors.redMeat;
  total += (days.poultry || 0) * factors.poultry;
  total += (days.fish || 0) * factors.fish;
  total += (days.dairy || 0) * factors.dairy;
  total += (days.vegan || 0) * factors.vegan;
  
  return parseFloat(total.toFixed(1));
};

export const calculateEnergyCarbon = ({
  bill = 0,
  currency = '$',
  source = 'Grid Power',
  householdSize = 1,
  acHours = 0,
  appliances = []
}) => {
  // Convert currency to base $ equivalent if ₹ (say, 1/80)
  const usdValue = currency === '₹' ? bill / 80 : bill;
  
  // Base bill carbon factor depending on energy source
  let baseFactor = 0.6; // standard Grid Power
  if (source === 'Solar Energy') baseFactor = 0.08;
  if (source === 'Wind Energy') baseFactor = 0.04;
  if (source === 'Mixed Sources') baseFactor = 0.3;
  
  let total = (usdValue * baseFactor);
  
  // Divide utility by household members sharing it
  total = total / (householdSize || 1);
  
  // AC / Heating emissions (daily hours * 30 days * factor)
  total += acHours * 0.4 * 30;
  
  // Appliances factors (monthly estimates)
  const applianceFactors = {
    'Washing Machine': 2.1,
    'Dishwasher': 1.8,
    'EV Charger': 8.4,
    'Desktop Computer': 3.2,
    'Gaming Console': 2.6
  };
  
  appliances.forEach(app => {
    if (applianceFactors[app]) {
      total += applianceFactors[app];
    }
  });
  
  return parseFloat(total.toFixed(1));
};
