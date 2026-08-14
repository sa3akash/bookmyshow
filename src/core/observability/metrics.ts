class MetricsRegistry {
  private httpRequestsTotal = 0;
  private bookingAttemptsTotal = 0;
  private bookingSuccessTotal = 0;
  private seatLockTotal = 0;
  private paymentSuccessTotal = 0;

  incHttpRequests() { this.httpRequestsTotal++; }
  incBookingAttempt() { this.bookingAttemptsTotal++; }
  incBookingSuccess() { this.bookingSuccessTotal++; }
  incSeatLock() { this.seatLockTotal++; }
  incPaymentSuccess() { this.paymentSuccessTotal++; }

  getPrometheusFormat(): string {
    return `
# HELP http_requests_total Total HTTP requests handled
# TYPE http_requests_total counter
http_requests_total ${this.httpRequestsTotal}

# HELP booking_attempts_total Total seat booking attempts
# TYPE booking_attempts_total counter
booking_attempts_total ${this.bookingAttemptsTotal}

# HELP booking_success_total Total successful bookings
# TYPE booking_success_total counter
booking_success_total ${this.bookingSuccessTotal}

# HELP seat_lock_total Total seat locks requested
# TYPE seat_lock_total counter
seat_lock_total ${this.seatLockTotal}

# HELP payment_success_total Total successful payments
# TYPE payment_success_total counter
payment_success_total ${this.paymentSuccessTotal}
`.trim();
  }
}

export const metrics = new MetricsRegistry();
