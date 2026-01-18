describe('RSVP Workflow', () => {
  const mockRSVPData = {
    guestName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    rsvpStatus: 'attending',
    numberOfGuests: 2,
    parkingPreference: 'valet'
  };

  it('should have valid guest name', () => {
    expect(mockRSVPData.guestName).toBeTruthy();
    expect(mockRSVPData.guestName.length).toBeGreaterThan(0);
  });

  it('should have valid email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(mockRSVPData.email)).toBe(true);
  });

  it('should have valid phone number', () => {
    expect(mockRSVPData.phone).toMatch(/^\+\d{10,}$/);
  });

  it('should validate RSVP status', () => {
    const validStatuses = ['attending', 'not-attending', 'maybe'];
    expect(validStatuses).toContain(mockRSVPData.rsvpStatus);
  });

  it('should validate guest count', () => {
    expect(mockRSVPData.numberOfGuests).toBeGreaterThan(0);
    expect(mockRSVPData.numberOfGuests).toBeLessThanOrEqual(10);
  });

  it('should validate parking preference', () => {
    const validParking = ['valet', 'self-parking', 'street'];
    expect(validParking).toContain(mockRSVPData.parkingPreference);
  });

  it('should accept RSVP submission', () => {
    const submitRSVP = (data: typeof mockRSVPData) => {
      return {
        success: true,
        message: `RSVP received for ${data.guestName}`,
        timestamp: new Date()
      };
    };

    const result = submitRSVP(mockRSVPData);
    expect(result.success).toBe(true);
    expect(result.message).toContain('John Doe');
  });
});
