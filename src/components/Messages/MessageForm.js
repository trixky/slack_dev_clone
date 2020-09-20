import React, { Component } from 'react';
import firebase from '../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';

class MessageForm extends Component {
	state = {
		message: '',
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		loading: false,
		errors: []
	}

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	messagesRef = event => {
		this.setState({ [event.target.name]: event.target.value })
	}

	createMessage = _ => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			},
			content: this.state.message
		}

		return message;
	}

	sendMessage = _ => {
		const { messagesRef } = this.props;
		const { message, channel } = this.state;

		if (message) {
			console.log('if 1')
			this.setState({ loading: true });
			console.log('on arrive ici 0')
			messagesRef
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					console.log('on arrive ici 1')
					this.setState({ loading: false, message: '', errors: [] })
				})
				.catch(err => {
					console.log('on arrive ici 2')
					console.log(err);
					this.setState({
						loading: false,
						errors: this.state.errors.concat(err)
					})
				})
		} else {
			console.log('if 2')
			this.setState({
				errors: this.state.errors.concat({ message: 'Add a message' })
			})
		}
	}

	render() {
		const { errors, message, loading } = this.state
		return (
			<Segment className="message__form">
				<Input
					fluid
					name="message"
					onChange={this.handleChange}
					value={message}
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} />}
					labelPosition="left"
					className={
						errors.some(error => error.message.includes('message')) ?
							'error' : ''
					}
					placeholder="write your message" />
				<Button.Group icon widths="2">
					<Button
						onClick={this.sendMessage}
						disabled={loading}
						color="orange"
						content="Add Reply"
						labelPosition="left"
						icon="edit" />
					<Button
						color="teal"
						content="Upload Media"
						labelPosition="right"
						icon="cloud upload" />
				</Button.Group>
			</Segment>
		)
	}
}

export default MessageForm;