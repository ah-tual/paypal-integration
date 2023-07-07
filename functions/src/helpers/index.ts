export const setTime = (datetime: Date, hours?: number, minutes?: number, seconds?: number) => {
    if (hours) {
        datetime.setHours(hours)
    }
    if (minutes) {
        datetime.setMinutes(minutes)
    }
    if (seconds) {
        datetime.setSeconds(seconds)
    }
    return datetime;
}

export const setDate = (datetime: Date, year?: number, month?: number, date?: number) => {
    if (year) {
        datetime.setFullYear(year)
    }
    if (month) {
        datetime.setMonth(month)
    }
    if (date) {
        datetime.setDate(date)
    }
    return datetime;
}

export const getTomorrow = (): Date => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);
    return tomorrow;
  }

export const getLastDateOfMonth = (year: number, month: number): Date => {
    return new Date(year, month, new Date(year, month + 1, 0).getDate(), 23, 59, 59);
}