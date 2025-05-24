export function formatToOnlyTime(timeStr: string): string {
  if (!timeStr) return ""
  const trimmedTimeStr = timeStr.split(".")[0] + "Z"
  const date = new Date(trimmedTimeStr)
  if (isNaN(date.getTime())) return "Invalid Date"
  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/^(\d):/, "0$1:")
}

export function formatToDate(timestamp: string): string {
  if (!timestamp) return ""
  const trimmedTimestamp = timestamp.split(".")[0] + "Z"
  const date = new Date(trimmedTimestamp)
  const now = new Date()
  const year = date.getFullYear()
  const month = date.toLocaleString("en-US", { month: "short" })
  const day = date.getDate()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date >= today) return "Today"
  if (date >= yesterday) return "Yesterday"
  return `${day}-${month}-${year.toString().slice(-2)}`
}
