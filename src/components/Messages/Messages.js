import React, { Component, Fragment } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';

import MessageHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
	state = {
		messages: [],
		messagesRef: firebase.database().ref('messages'),
		messagesLoading: true,
		channel: this.props.currentChannel,
		user: this.props.currentUser
	}

	componentDidMount = _ => {
		const {channel, user} = this.state;

		if (channel && user) {
			this.addListeners(channel.id);
		}
	}

	addListeners = channelID => {
		this.addMessageListener(channelID);
	}

	addMessageListener = channelID => {
		let loadedMessages = [];

		this.state.messagesRef.child(channelID).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			})
		})

	}

	displayMessages = messages => (
		messages.length > 0 && messages.map(message => (
			<Message 
				key={message.timestamp}
				message={message}
				user={this.state.user}
			/>
		))
	)

	render() {
		const { messagesRef, messages, channel, user } = this.state
		return (
			<Fragment>
				<MessageHeader />
				<Segment>
					<Comment.Group className="messages">
						{this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={messagesRef}
					currentChannel={channel}
					currentUser={user}
				/>
			</Fragment>
		)
	}
}

export default Messages