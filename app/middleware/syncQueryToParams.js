
import { MIRROR_PARAMS } from 'actions'

export default (history, store) => {
  history.listen((newLocation) => {
    store.dispatch({
      type: MIRROR_PARAMS,
      params: {
        // for now just massage onlyAmazon into a bool
        ...newLocation.query,
        onlyAmazon: newLocation.query.onlyAmazon !== undefined ? true : undefined
      }
    })
  })
}
