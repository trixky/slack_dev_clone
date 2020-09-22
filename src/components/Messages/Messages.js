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
		user: this.props.currentUser,
		progressBar: false,
		numUniqueUsers: ''
	}

	componentDidMount = _ => {
		const { channel, user } = this.state;

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
			});
			this.countUniqueUsers(loadedMessages);
		});
	};

	countUniqueUsers = messages => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
		const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
		this.setState({ numUniqueUsers });
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

	isProgressBarVisible = percent => {
		if (percent > 0) {
			this.setState({ progressBar: true });
		}
	}

	displayChannelName = channel => channel ? `#${channel.name}` : '';

	render() {
		const { messagesRef, messages, channel, user, progressBar, numUniqueUsers } = this.state
		return (
			<Fragment>
				<MessageHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
				/>
				<Segment>
					<Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
						{this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={messagesRef}
					currentChannel={channel}
					currentUser={user}
					isProgressBarVisible={this.isProgressBarVisible}
				/>
			</Fragment>
		)
	}
}

export default Messages