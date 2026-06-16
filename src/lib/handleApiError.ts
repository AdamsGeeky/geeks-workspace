import { AxiosError } from 'axios'

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message

    switch (status) {
      case 400:
        return message ?? 'Bad request. Please check your input.'
      case 401:
        return 'Session expired. Please log in again.'
      case 403:
        return "You don't have permission to do that."
      case 404:
        return 'Not found.'
      case 409:
        return 'Email already registered.'
      default:
        return message ?? 'Something went wrong. Please try again.'
    }
  }
  return 'Something went wrong. Please try again.'
}
