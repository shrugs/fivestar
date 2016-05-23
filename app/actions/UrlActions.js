import { browserHistory } from 'react-router'

export const MIRROR_PARAMS = 'MIRROR_PARAMS'
export function mirrorParams(params) {
  return {
    type: MIRROR_PARAMS,
    params
  }
}

export function updateParams(params) {
  // sync new params to history
  // middleware should then call mirrorParams
  return (dispatch, getState) => {
    browserHistory.replace({
      query: {
        ...getState().params,
        ...params
      }
    })
  }
}

export function historyCheckpoint(locationDescriptor) {
  browserHistory.push(locationDescriptor)
}
