import { describe, it, expect } from 'vitest';
import { 
  calculateTransportCarbon, 
  calculateFoodCarbon, 
  calculateEnergyCarbon 
} from './carbonCalc';

describe('Carbon Calculation Utilities', () => {
  describe('calculateTransportCarbon', () => {
    it('should return 0 for empty trips array', () => {
      expect(calculateTransportCarbon([])).toBe(0);
    });

    it('should calculate car travel carbon correctly for petrol', () => {
      const trips = [{ mode: 'Car', distance: 100, fuel: 'Petrol' }];
      // Petrol factor is 0.20
      expect(calculateTransportCarbon(trips)).toBe(20);
    });

    it('should calculate car travel carbon correctly for diesel', () => {
      const trips = [{ mode: 'Car', distance: 100, fuel: 'Diesel' }];
      // Diesel factor is 0.22
      expect(calculateTransportCarbon(trips)).toBe(22);
    });

    it('should calculate car travel carbon correctly for electric', () => {
      const trips = [{ mode: 'Car', distance: 100, fuel: 'Electric' }];
      // Electric factor is 0.05
      expect(calculateTransportCarbon(trips)).toBe(5);
    });

    it('should calculate bus travel carbon correctly', () => {
      const trips = [{ mode: 'Bus', distance: 100 }];
      // Bus factor is 0.09
      expect(calculateTransportCarbon(trips)).toBe(9);
    });

    it('should calculate train travel carbon correctly', () => {
      const trips = [{ mode: 'Train', distance: 100 }];
      // Train factor is 0.04
      expect(calculateTransportCarbon(trips)).toBe(4);
    });

    it('should calculate flight carbon correctly for short flights', () => {
      const trips = [{ mode: 'Flight', flightsNum: 2, flightType: 'Short' }];
      // Short flight is 150kg
      expect(calculateTransportCarbon(trips)).toBe(300);
    });

    it('should calculate flight carbon correctly for long flights', () => {
      const trips = [{ mode: 'Flight', flightsNum: 1, flightType: 'Long' }];
      // Long flight is 600kg
      expect(calculateTransportCarbon(trips)).toBe(600);
    });

    it('should return 0 for zero-emission travel modes', () => {
      const trips = [
        { mode: 'Cycling', distance: 50 },
        { mode: 'Walking', distance: 20 }
      ];
      expect(calculateTransportCarbon(trips)).toBe(0);
    });
  });

  describe('calculateFoodCarbon', () => {
    it('should return 0 for empty days input', () => {
      expect(calculateFoodCarbon({})).toBe(0);
    });

    it('should calculate food carbon footprint correctly', () => {
      const days = {
        redMeat: 2, // 2 * 6.61 = 13.22
        poultry: 1,  // 1 * 2.15 = 2.15
        fish: 3,     // 3 * 1.45 = 4.35
        dairy: 5,    // 5 * 1.80 = 9.00
        vegan: 7     // 7 * 0.40 = 2.80
      };             // Total = 31.52 -> fixed to 1 decimal = 31.5
      expect(calculateFoodCarbon(days)).toBe(31.5);
    });
  });

  describe('calculateEnergyCarbon', () => {
    it('should calculate energy carbon footprint correctly in USD', () => {
      const inputs = {
        bill: 100,
        currency: '$',
        source: 'Grid Power', // 0.6 factor
        householdSize: 2,     // divided by 2
        acHours: 4,           // 4 * 0.4 * 30 = 48
        appliances: ['Washing Machine', 'Desktop Computer'] // 2.1 + 3.2 = 5.3
      };
      // Base: (100 * 0.6) / 2 = 30
      // AC: 48
      // Appliances: 5.3
      // Total = 83.3
      expect(calculateEnergyCarbon(inputs)).toBe(83.3);
    });

    it('should handle Indian Rupee (₹) conversion correctly', () => {
      const inputs = {
        bill: 8000,
        currency: '₹',       // 8000 / 80 = 100 USD
        source: 'Solar Energy', // 0.08 factor
        householdSize: 1,
        acHours: 0,
        appliances: []
      };
      // Base: (100 * 0.08) / 1 = 8
      expect(calculateEnergyCarbon(inputs)).toBe(8);
    });
  });
});
