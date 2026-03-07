/**
 * Pharmacy Hours Service
 * Calculates if pharmacy is open/closed and time until status change
 */

class PharmacyHoursService {
  
  /**
   * Get current day name
   */
  getCurrentDay() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    return days[now.getDay()];
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:MM)
   */
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get current time in minutes since midnight
   */
  getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /**
   * Calculate pharmacy open status
   * @returns {Object} { isOpen, status, message, closesIn, opensIn, icon, color }
   */
  calculateOpenStatus(pharmacy) {
    // Check if temporarily closed
    if (pharmacy.temporarilyClosed) {
      return {
        isOpen: false,
        status: 'Temporarily Closed',
        message: pharmacy.temporaryClosureReason || 'Temporarily closed',
        closesIn: null,
        opensIn: null,
        icon: '🔴',
        color: '#ff6b6b',
        minutesUntilChange: null
      };
    }

    // Check if 24x7
    if (pharmacy.open24x7) {
      return {
        isOpen: true,
        status: 'Open 24×7',
        message: 'Always open',
        closesIn: null,
        opensIn: null,
        icon: '🟢',
        color: '#51cf66',
        minutesUntilChange: null
      };
    }

    const currentDay = this.getCurrentDay();
    const currentMinutes = this.getCurrentTimeInMinutes();
    const todayHours = pharmacy.operatingHours?.[currentDay];

    // Check if closed today
    if (!todayHours || todayHours.closed) {
      return this.getNextOpenTime(pharmacy, currentDay, currentMinutes);
    }

    const openMinutes = this.timeToMinutes(todayHours.open);
    const closeMinutes = this.timeToMinutes(todayHours.close);

    // Check if in break time
    if (pharmacy.breakTime?.enabled) {
      const breakStart = this.timeToMinutes(pharmacy.breakTime.start);
      const breakEnd = this.timeToMinutes(pharmacy.breakTime.end);
      
      if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
        const minutesUntilBreakEnd = breakEnd - currentMinutes;
        return {
          isOpen: false,
          status: 'On Break',
          message: `Break time - Opens at ${pharmacy.breakTime.end}`,
          closesIn: null,
          opensIn: minutesUntilBreakEnd,
          icon: '🟡',
          color: '#fab005',
          minutesUntilChange: minutesUntilBreakEnd
        };
      }
    }

    // Check if currently open
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const minutesUntilClose = closeMinutes - currentMinutes;
      
      // Closing soon warning (less than 60 minutes)
      if (minutesUntilClose <= 60) {
        return {
          isOpen: true,
          status: 'Closing Soon',
          message: `Closes in ${minutesUntilClose} min`,
          closesIn: minutesUntilClose,
          opensIn: null,
          icon: '🟡',
          color: '#fab005',
          minutesUntilChange: minutesUntilClose
        };
      }

      return {
        isOpen: true,
        status: 'Open Now',
        message: `Open until ${todayHours.close}`,
        closesIn: minutesUntilClose,
        opensIn: null,
        icon: '🟢',
        color: '#51cf66',
        minutesUntilChange: minutesUntilClose
      };
    }

    // Currently closed
    if (currentMinutes < openMinutes) {
      // Opens today
      const minutesUntilOpen = openMinutes - currentMinutes;
      return {
        isOpen: false,
        status: 'Closed',
        message: `Opens at ${todayHours.open}`,
        closesIn: null,
        opensIn: minutesUntilOpen,
        icon: '🔴',
        color: '#ff6b6b',
        minutesUntilChange: minutesUntilOpen
      };
    }

    // Closed for the day, find next open time
    return this.getNextOpenTime(pharmacy, currentDay, currentMinutes);
  }

  /**
   * Get next opening time
   */
  getNextOpenTime(pharmacy, currentDay, currentMinutes) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = days.indexOf(currentDay);

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      const nextDayHours = pharmacy.operatingHours?.[nextDay];

      if (nextDayHours && !nextDayHours.closed) {
        const daysUntil = i;
        const nextDayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
        
        return {
          isOpen: false,
          status: 'Closed',
          message: `Opens ${daysUntil === 1 ? 'tomorrow' : nextDayName} at ${nextDayHours.open}`,
          closesIn: null,
          opensIn: null,
          icon: '🔴',
          color: '#ff6b6b',
          minutesUntilChange: null
        };
      }
    }

    // All days closed (shouldn't happen)
    return {
      isOpen: false,
      status: 'Closed',
      message: 'Currently closed',
      closesIn: null,
      opensIn: null,
      icon: '🔴',
      color: '#ff6b6b',
      minutesUntilChange: null
    };
  }

  /**
   * Filter pharmacies by open status
   * @param {Array} pharmacies - Array of pharmacy objects
   * @param {String} filter - 'all', 'open', 'closed', 'closing-soon'
   */
  filterByOpenStatus(pharmacies, filter = 'all') {
    if (filter === 'all') return pharmacies;

    return pharmacies.filter(pharmacy => {
      const status = this.calculateOpenStatus(pharmacy);
      
      switch (filter) {
        case 'open':
          return status.isOpen && status.status !== 'Closing Soon';
        case 'closing-soon':
          return status.status === 'Closing Soon';
        case 'closed':
          return !status.isOpen;
        case '24x7':
          return pharmacy.open24x7;
        default:
          return true;
      }
    });
  }

  /**
   * Sort pharmacies by open status (open first)
   */
  sortByOpenStatus(pharmacies) {
    return pharmacies.sort((a, b) => {
      const statusA = this.calculateOpenStatus(a);
      const statusB = this.calculateOpenStatus(b);

      // Priority: Open > Closing Soon > Closed
      if (statusA.isOpen && !statusB.isOpen) return -1;
      if (!statusA.isOpen && statusB.isOpen) return 1;
      
      if (statusA.status === 'Closing Soon' && statusB.status !== 'Closing Soon') return -1;
      if (statusA.status !== 'Closing Soon' && statusB.status === 'Closing Soon') return 1;

      return 0;
    });
  }

  /**
   * Get all pharmacies with open status attached
   */
  attachOpenStatus(pharmacies) {
    return pharmacies.map(pharmacy => {
      const pharmacyObj = pharmacy.toObject ? pharmacy.toObject() : pharmacy;
      const openStatus = this.calculateOpenStatus(pharmacyObj);
      
      return {
        ...pharmacyObj,
        openStatus
      };
    });
  }

  /**
   * Check if pharmacy will be open at a specific time
   */
  willBeOpenAt(pharmacy, targetDate) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const day = days[targetDate.getDay()];
    const targetMinutes = targetDate.getHours() * 60 + targetDate.getMinutes();

    if (pharmacy.temporarilyClosed) return false;
    if (pharmacy.open24x7) return true;

    const dayHours = pharmacy.operatingHours?.[day];
    if (!dayHours || dayHours.closed) return false;

    const openMinutes = this.timeToMinutes(dayHours.open);
    const closeMinutes = this.timeToMinutes(dayHours.close);

    // Check if in break time
    if (pharmacy.breakTime?.enabled) {
      const breakStart = this.timeToMinutes(pharmacy.breakTime.start);
      const breakEnd = this.timeToMinutes(pharmacy.breakTime.end);
      
      if (targetMinutes >= breakStart && targetMinutes < breakEnd) {
        return false;
      }
    }

    return targetMinutes >= openMinutes && targetMinutes < closeMinutes;
  }
}

module.exports = new PharmacyHoursService();
