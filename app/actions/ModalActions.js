

export const SHOW_RESULT_DETAILS = 'SHOW_RESULT_DETAILS';
export function showResultDetails(payload) {
  return {
    type: SHOW_RESULT_DETAILS,
    payload
  }
}

export const HIDE_RESULT_DETAILS = 'HIDE_RESULT_DETAILS';
export function hideResultDetails() {
  return {
    type: HIDE_RESULT_DETAILS
  }
}
