import { apiFetch } from './httpClient';

export const analyticsApi = {
  getOccupancyByLandlord: (landlordId, startDate, endDate) =>
    apiFetch(`/analytics/occupancy/landlord/${landlordId}?startDate=${startDate}&endDate=${endDate}`),

  getMaintenanceByLandlord: (landlordId, startDate, endDate) =>
    apiFetch(`/analytics/maintenance/landlord/${landlordId}?startDate=${startDate}&endDate=${endDate}`),
};
