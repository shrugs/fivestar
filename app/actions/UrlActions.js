import { browserHistory } from 'react-router'

export const MIRROR_PARAMS = 'MIRROR_PARAMS'
export function mirrorParams(params) {
  return {
    type: MIRROR_PARAMS,
    params
  }
}

export function historyCheckpoint(locationDescriptor) {
  browserHistory.push(locationDescriptor)
}
