import React, { useState } from 'react';
import Header from '../common/Header';
import SideNav from '../dashboard/SideNav';
import ChatChannel from '../dashboard/ChatChannel';
import ChannelModal from './ChannelModal';
import useChannels from '../../hooks/useChannels';
import useChannel from '../../hooks/useChannel';
import '../../styles/ChatPage.css';

export default function ChatPage() {
    const { channels, active, pick, search, setSearch, newChannel } = useChannels();
    const { messages, newMessage, setNewMessage, sendMessage } = useChannel(active);
    const [showModal, setShow] = useState(false);

    return (
        <>
            <Header />
            <div className="chat-page-layout">
                <SideNav currentPage="chats" />
                <div className="chat-page">
                    <aside className="chat-sidebar">
                        <div className="sidebar-header">
                            <input
                                placeholder="Search channels..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <button onClick={() => setShow(true)}>+ New</button>
                        </div>
                        <ul className="channel-list">
                            {channels.map(ch => (
                                <li
                                    key={ch.channelId}
                                    className={ch.channelId === active?.channelId ? 'active' : 'read-' + (ch.unreadCount > 0)}
                                    onClick={() => pick(ch)}
                                >
                                    <div className="pfp">{/* initials or img */}</div>
                                    <div className="info">
                                        <div className="name">{ch.name}</div>
                                        <div className="preview">
                                            {/* highlight matching text */}
                                            {ch.lastMessage}
                                        </div>
                                    </div>
                                    <div className="ts">
                                        {/* format ch.lastTs: Today/yesterday/date */}
                                    </div>
                                    {ch.unreadCount > 0 && <span className="badge">{ch.unreadCount}</span>}
                                </li>
                            ))}
                        </ul>
                    </aside>
                    <main className="chat-main">
                        {active
                            ? <ChatChannel
                                messages={messages}
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                sendMessage={sendMessage}
                            />
                            : <div className="empty">Select a channel</div>}
                    </main>
                </div>
            </div>
            {showModal && (
                <ChannelModal
                    onClose={() => setShow(false)}
                    onCreate={ids => { newChannel(ids); setShow(false); }}
                />
            )}
        </>
    );
}
