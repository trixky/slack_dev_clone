import React, { Component, Fragment } from 'react';
import {Segment, Comment} from 'semantic-ui-react';

import MessageHeader from './MessagesHeader';
import MessageForm from './MessageForm';

class Messages extends Component {
	render() {
		return (
			<Fragment>
				<MessageHeader />
				<Segment>
					<Comment.Group className="messages">
						{/* Messages */}
					</Comment.Group>
				</Segment>
				<MessageForm />
			</Fragment>
		)
	}
}

export default Messages