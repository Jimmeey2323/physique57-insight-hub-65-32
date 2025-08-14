
export const getPreviousMonthDateRange = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  console.log('Current date:', today.toISOString());
  console.log('Current year:', currentYear);
  console.log('Current month (0-indexed):', currentMonth);
  
  // Get first day of previous month
  const firstDayOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
  console.log('First day of previous month:', firstDayOfPreviousMonth.toISOString());
  
  // Get last day of previous month
  const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0);
  console.log('Last day of previous month:', lastDayOfPreviousMonth.toISOString());
  
  const result = {
    start: firstDayOfPreviousMonth.toISOString().split('T')[0],
    end: lastDayOfPreviousMonth.toISOString().split('T')[0]
  };
  
  console.log('Previous month date range:', result);
  return result;
};

export const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

export const isDateInRange = (date: string, start: string, end: string) => {
  const checkDate = new Date(date);
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return checkDate >= startDate && checkDate <= endDate;
};

export const generateDynamicMonths = () => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get current date for dynamic month calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Generate last 18 months of data including current month
  for (let i = 17; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthName = monthNames[date.getMonth()];
    months.push({
      key: `${year}-${String(month).padStart(2, '0')}`,
      display: `${monthName} ${year}`,
      year: year,
      month: month,
      quarter: Math.ceil(month / 3)
    });
  }
  
  return months;
};

export const parseDate = (dateString: string) => {
  if (!dateString) return null;
  
  // Handle various date formats
  try {
    // Try direct parsing first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try parsing DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    // Try parsing DD-MM-YYYY format
    if (dateString.includes('-') && !dateString.includes('T')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Check if it's DD-MM-YYYY or YYYY-MM-DD
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        } else {
          // DD-MM-YYYY format
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};
