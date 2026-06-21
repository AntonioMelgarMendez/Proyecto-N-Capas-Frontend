/**
 * Set to true to allow reviews on active reservations (UI testing only).
 * Revert to false before production — only COMPLETED reservations should be reviewable.
 */
export const REVIEW_TEST_MODE = false;

export const REVIEW_ELIGIBLE_STATUSES = REVIEW_TEST_MODE
  ? ['CONFIRMED', 'CHECKED_IN', 'COMPLETED']
  : ['COMPLETED'];

export const canTenantReview = (reservation, reviewedReservationIds) =>
  REVIEW_ELIGIBLE_STATUSES.includes(reservation?.status)
  && !reviewedReservationIds.has(reservation?.id);

export const isReviewEligibleStatus = (status) =>
  REVIEW_ELIGIBLE_STATUSES.includes(status);
