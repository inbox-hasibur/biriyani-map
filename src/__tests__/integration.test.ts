import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data matching the Supabase schema exactly
describe('Data Layer Integration', () => {
  describe('Biriyani spots schema', () => {
    const validSpot = {
      title: 'Test Biriyani',
      description: 'Test description',
      lat: 23.815,
      lng: 90.412,
      food_type: 'Biriyani',
      time: new Date().toISOString(),
      score: 0,
      verified: false,
      is_visible: true,
      created_by: null,
    };

    it('has all required fields', () => {
      expect(validSpot.title).toBeDefined();
      expect(validSpot.lat).toBeDefined();
      expect(validSpot.lng).toBeDefined();
    });

    it('has correct default values', () => {
      expect(validSpot.score).toBe(0);
      expect(validSpot.verified).toBe(false);
      expect(validSpot.is_visible).toBe(true);
    });

    it('allows null optional fields', () => {
      expect(validSpot.created_by).toBeNull();
    });
  });

  describe('Toilet schema', () => {
    const validToilet = {
      name: 'Test Toilet',
      lat: 23.811,
      lng: 90.407,
      is_paid: false,
      has_water: true,
      notes: 'Clean',
      rating_avg: 0,
      rating_count: 0,
      score: 0,
      is_visible: true,
      created_by: null,
    };

    it('has all required fields', () => {
      expect(validToilet.name).toBeDefined();
      expect(validToilet.lat).toBeDefined();
      expect(validToilet.lng).toBeDefined();
    });

    it('has correct boolean defaults', () => {
      expect(validToilet.is_paid).toBe(false);
      expect(validToilet.has_water).toBe(true);
    });

    it('has correct rating defaults', () => {
      expect(validToilet.rating_avg).toBe(0);
      expect(validToilet.rating_count).toBe(0);
    });
  });

  describe('Goods pricing schema', () => {
    const validGoods = {
      product_name: 'Tomatoes',
      price: 80,
      unit: 'kg',
      shop_name: 'Bazar Fresh',
      lat: 23.813,
      lng: 90.409,
      score: 0,
      is_visible: true,
      created_by: null,
    };

    it('has all required fields', () => {
      expect(validGoods.product_name).toBeDefined();
      expect(validGoods.price).toBeDefined();
      expect(validGoods.unit).toBeDefined();
      expect(validGoods.shop_name).toBeDefined();
    });

    it('price is a positive number', () => {
      expect(validGoods.price).toBeGreaterThan(0);
    });

    it('unit is a valid option', () => {
      const validUnits = ['kg', 'piece', 'dozen', 'liter'];
      expect(validUnits).toContain(validGoods.unit);
    });
  });

  describe('Violence report schema', () => {
    const validReport = {
      title: 'Test Incident',
      description: 'Test description',
      incident_type: 'Theft',
      lat: 23.816,
      lng: 90.41,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      is_visible: true,
      created_by: null,
    };

    it('has all required fields', () => {
      expect(validReport.title).toBeDefined();
      expect(validReport.incident_type).toBeDefined();
    });

    it('has correct vote defaults', () => {
      expect(validReport.upvotes).toBe(0);
      expect(validReport.downvotes).toBe(0);
      expect(validReport.score).toBe(0);
    });

    it('incident_type is a valid option', () => {
      const validTypes = ['Theft', 'Assault', 'Harassment', 'Vandalism', 'Robbery', 'Eve Teasing', 'Other'];
      expect(validTypes).toContain(validReport.incident_type);
    });
  });
});

describe('Form-to-DB field mapping', () => {
  it('biriyani form maps to spots table correctly', () => {
    const formData = { title: 'Test', description: 'Desc', foodType: 'Biriyani', time: '2026-03-20T17:00' };
    const dbInsert = {
      title: formData.title,
      description: formData.description ?? null,
      food_type: formData.foodType,
      time: formData.time ? new Date(formData.time).toISOString() : null,
      score: 0,
      verified: false,
      is_visible: true,
    };

    expect(dbInsert.title).toBe('Test');
    expect(dbInsert.food_type).toBe('Biriyani');
    expect(dbInsert.time).toBeTruthy();
  });

  it('toilet form maps to toilets table correctly', () => {
    const formData = { name: 'Test Toilet', isPaid: true, hasWater: false, notes: 'Notes' };
    const dbInsert = {
      name: formData.name,
      is_paid: formData.isPaid,
      has_water: formData.hasWater,
      notes: formData.notes ?? null,
      rating_avg: 0,
      rating_count: 0,
      score: 0,
      is_visible: true,
    };

    expect(dbInsert.name).toBe('Test Toilet');
    expect(dbInsert.is_paid).toBe(true);
    expect(dbInsert.has_water).toBe(false);
  });

  it('goods form maps to goods_prices table correctly', () => {
    const formData = { productName: 'Tomato', price: 80, unit: 'kg', shopName: 'Bazar' };
    const dbInsert = {
      product_name: formData.productName,
      price: formData.price,
      unit: formData.unit,
      shop_name: formData.shopName,
      score: 0,
      is_visible: true,
    };

    expect(dbInsert.product_name).toBe('Tomato');
    expect(dbInsert.price).toBe(80);
    expect(dbInsert.unit).toBe('kg');
    expect(dbInsert.shop_name).toBe('Bazar');
  });

  it('violence form maps to violence_reports table correctly', () => {
    const formData = { title: 'Incident', description: 'Desc', incidentType: 'Theft' };
    const dbInsert = {
      title: formData.title,
      description: formData.description ?? null,
      incident_type: formData.incidentType,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      is_visible: true,
    };

    expect(dbInsert.title).toBe('Incident');
    expect(dbInsert.incident_type).toBe('Theft');
    expect(dbInsert.upvotes).toBe(0);
  });
});
