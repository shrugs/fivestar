import React from 'react'

import {
  Row,
  Column,
  Button,
  Switch
} from 'react-foundation'

export default class Search extends React.Component {

  static propTypes = {
    showFilters: React.PropTypes.bool,
    params: React.PropTypes.shape({
      q: React.PropTypes.string,
      index: React.PropTypes.string,
      node: React.PropTypes.string,
      brand: React.PropTypes.string,
      onlyAmazon: React.PropTypes.bool
    }),

    filters: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        '@': React.PropTypes.shape({
          NarrowBy: React.PropTypes.string
        }),
        Bin: React.PropTypes.arrayOf(
          React.PropTypes.shape({
            BinName: React.PropTypes.string,
            BinParameter: React.PropTypes.shape({
              Name: React.PropTypes.string,
              Value: React.PropTypes.string
            })
          })
        )
      })
    )
  }

  constructor(props) {
    super(props)

    this.state = this.propParamsToState(props.params)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.propParamsToState(nextProps.params))
  }

  componentDidMount() {
    // this.performSearch()
  }

  propParamsToState(params) {
    return {
      ...params,
      q: params.q || ''
    }
  }

  performSearch() {
    if (this.state.q === undefined || this.state.q.length < 1) {
      // bail if there's no search term yet
      this.props.clearResults()
      return
    }

    this.props.performSearch(this.state)
  }

  submitParamChanges(newParam = {}) {
    this.setState(newParam, this.performSearch.bind(this))
  }

  handleKeyDown(e) {
    if (e.which === 13) {
      this.submitParamChanges()
    }
  }

  handleOnlyAmazonChange(isChecked) {
    // coerce to undefined so it's still falsy, and doesn't show up in url
    const newValue = isChecked ? true : undefined
    this.setState({ onlyAmazon: newValue }, this.performSearch.bind(this))
  }

  handleIndexChange(newIndex) {
    this.setState({ index: newValue }, this.performSearch.bind(this))
  }

  handleFilterChange(filterType, newValue) {
    const paramName = {
      'BrowseNode': 'node',
      'Brand': 'brand'
    }[filterType]

    this.setState({
      [paramName]: newValue === 'none' ? undefined : newValue
    }, this.performSearch.bind(this))
  }

  render() {

    return (
      <div className='search-container'>
        <Row isColumn>
          <div className='input-group'>
          <input
            type='text'
            className='input-group-field'
            placeholder="'headphones', 'school laptop', 'toaster'"
            value={this.state.q}
            onKeyDown={this.handleKeyDown.bind(this)}
            onChange={e => this.setState({ q: e.target.value })}
          />
          <div className='input-group-button'>
            <Button type='submit' onClick={() => this.submitParamChanges()}>
              Search
            </Button>
          </div>
        </div>
        </Row>
        <Row>
          {this.props.showFilters &&
            <Column small={6} medium={6}>
              <label>Only Fulfilled by Amazon
                <Switch
                  checked={!!this.state.onlyAmazon}
                  onChange={e => this.handleOnlyAmazonChange(e.target.checked)}
                />
              </label>
            </Column>
          }
          {this.props.showFilters &&
            <Column small={6} medium={6}>
              <label>Department
                <select selected={this.state.index || 'All'} onChange={e => this.handleIndexChange(e.target.value)}>
                  <option value="All">All Depts.</option>
                  <option value="Appliances">Appliances</option>
                  <option value="MobileApps">Apps for Android</option>
                  <option value="ArtsAndCrafts">Arts & Crafts</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Baby">Baby</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Books">Books</option>
                  <option value="WirelessAccessories">Mobile & Acc.</option>
                  <option value="Apparel">Clothing & Acc.</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="PCHardware">Computers</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Grocery">Grocery & Food</option>
                  <option value="HealthPersonalCare">Health & Personal Care</option>
                  <option value="HomeGarden">Home & Garden</option>
                  <option value="Industrial">Industrial & Sci.</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="KindleStore">Kindle Store</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Magazines">Magazine Subscriptions</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="DigitalMusic">MP3 Music</option>
                  <option value="Music">Music</option>
                  <option value="MusicalInstruments">Musical Instruments</option>
                  <option value="OfficeProducts">Office Products</option>
                  <option value="OutdoorLiving">Outdoor Living</option>
                  <option value="LawnGarden">Patio, Lawn & Garden</option>
                  <option value="PetSupplies">Pet Supplies</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Software">Software</option>
                  <option value="SportingGoods">Sports & Outdoors</option>
                  <option value="Tools">Tools & Home</option>
                  <option value="Toys">Toys & Games</option>
                  <option value="VideoGames">Video Games</option>
                  <option value="Watches">Watches</option>
                </select>
              </label>
            </Column>
          }
          {this.props.filters && this.props.filters.filter(f => f.Bin.length > 0).map(f =>
            <Column small={6} medium={6} key={f['@']['NarrowBy']}>
              <label>{f['@']['NarrowBy']}
                <select onChange={e => this.handleFilterChange(f.Bin[0].BinParameter.Name, e.target.value)}>
                  <option value='none'>
                    Every {f['@']['NarrowBy']}
                  </option>
                  {f.Bin.map(b =>
                    <option value={b.BinParameter.Value} key={b.BinParameter.Value}>
                      {b.BinName}
                    </option>
                  )}
                </select>
              </label>
            </Column>
          )}
        </Row>
      </div>
    )
  }
}
