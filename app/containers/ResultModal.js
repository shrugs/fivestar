import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

import {
  hideResultDetails
} from 'actions/ModalActions'

class ResultModal extends Component {

  closeModal() {
    this.props.hideResultDetails()
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        onRequestClose={this.closeModal.bind(this)}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel='Product Details'
      >
        CONTENT
      </Modal>
    );
  }
}

export default connect(state => ({
  open: state.modal.open,
  result: state.modal.result
}), {
  hideResultDetails
})(ResultModal)
