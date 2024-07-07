export const formatDateRange = (startDate: string) => {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  const startFormatted = start
    .toLocaleDateString('en-GB', options)
    .replace(/,/g, '')
  const endFormatted = end
    .toLocaleDateString('en-GB', options)
    .replace(/,/g, '')

  return `${startFormatted} - ${endFormatted}`
}
