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
		numUniqueUsers: '',
		searchLoading: false,
		searchResults: []
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

	handleSearchChange = event => {
		this.setState({
			searchTerm: event.target.value,
			searchLoading: true
		}, _ => this.handleSearchMessages());
	};

	handleSearchMessages = _ => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, 'gi');
		const searchResults = channelMessages.reduce((acc, message) => {
			if ((message.content && message.content.match(regex)) ||
				message.user.name.match(regex)) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({ searchResults })
		setTimeout(() => this.setState({ searchLoading: false }), 700);
	}

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
		// prettier-ignore 
		const { messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading } = this.state
		return (
			<Fragment>
				<MessageHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
				/>
				<Segment>
					<Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
						{searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
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