
import {
  SHOW_RESULT_DETAILS,
  HIDE_RESULT_DETAILS
} from 'actions/ModalActions'

export default function(state = { open: false }, action) {
  switch (action.type) {
    case SHOW_RESULT_DETAILS:
      return { open: true, result: action.payload }
    case HIDE_RESULT_DETAILS:
      return { open: false }
    default:
      return state
  }
}
