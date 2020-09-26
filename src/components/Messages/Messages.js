import React, { Component, Fragment } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';

import MessageHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
	state = {
		privateChannel: this.props.isPrivateChannel,
		privateMessagesRef: firebase.database().ref('privateMessages'),
		messages: [],
		messagesRef: firebase.database().ref('messages'),
		messagesLoading: true,
		channel: this.props.currentChannel,
		isChannelStarred: false,
		user: this.props.currentUser,
		userRef: firebase.database().ref('users'),
		progressBar: false,
		numUniqueUsers: '',
		searchLoading: false,
		searchResults: []
	}

	componentDidMount = _ => {
		const { channel, user } = this.state;

		if (channel && user) {
			this.addListeners(channel.id);
			this.addUserStarListener(channel.id, user.uid)
		}
	}

	addListeners = channelID => {
		this.addMessageListener(channelID);
	}

	addMessageListener = channelID => {
		let loadedMessages = [];
		const ref = this.getMessagesRef();

		ref.child(channelID).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
			this.countUniqueUsers(loadedMessages);
		});
	};

	addUserStarListener = (channelId, userId) => {
		this.state.userRef
			.child(userId)
			.child('starred')
			.once('value')
			.then(data => {
				if (data.val !== null) {
					const channelIds = Object.keys(data.val());
					const prevStarred = channelIds.includes(channelId);
					this.setState({ isChannelStarred: prevStarred });
				}
			})
	}

	getMessagesRef = _ => {
		const { messagesRef, privateMessagesRef, privateChannel } = this.state;

		return privateChannel ? privateMessagesRef : messagesRef;
	}

	handleSearchChange = event => {
		this.setState({
			searchTerm: event.target.value,
			searchLoading: true
		}, _ => this.handleSearchMessages());
	};

	handleStar = _ => {
		this.setState(prevState => ({
			isChannelStarred: !prevState.isChannelStarred
		}), _ => this.starChannel());
	}

	starChannel = _ => {
		if (this.state.isChannelStarred) {
			this.state.userRef
				.child(`${this.state.user.uid}/starred`)
				.update({
					[this.state.channel.id]: {
						name: this.state.channel.name,
						details: this.state.channel.details,
						createdBy: {
							name: this.state.channel.createdBy.name,
							avatar: this.state.channel.createdBy.avatar
						}
					}
				})
		} else {
			this.state.userRef
				.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove(err => {
					if (err !== null) {
						console.error(err);
					}
				});

		}
	}

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

	displayChannelName = channel => {
		return channel ?
			`${this.state.privateChannel ? '@' : '#'}${channel.name}` :
			``;
	};

	render() {
		// prettier-ignore 
		const { messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred } = this.state
		return (
			<Fragment>
				<MessageHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					privateChannel={privateChannel}
					handleStar={this.handleStar}
					isChannelStarred={isChannelStarred}
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
					isPrivateChannel={privateChannel}
					getMessagesRef={this.getMessagesRef}
				/>
			</Fragment>
		)
	}
}

export default Messages