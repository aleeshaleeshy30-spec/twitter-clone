// Data Storage
let currentUser = {
    id: 1,
    name: 'Current User',
    username: 'currentuser',
    bio: 'Welcome to my profile! 🐦',
    avatar: 'https://ui-avatars.com/api/?name=Current+User&background=1da1f2&color=fff',
    following: [],
    followers: []
};

let users = [
    {
        id: 2,
        name: 'Elon Musk',
        username: 'elonmusk',
        avatar: 'https://ui-avatars.com/api/?name=Elon+Musk&background=1da1f2&color=fff',
        following: [],
        followers: []
    },
    {
        id: 3,
        name: 'Tech News',
        username: 'technews',
        avatar: 'https://ui-avatars.com/api/?name=Tech+News&background=00ba7c&color=fff',
        following: [],
        followers: []
    },
    {
        id: 4,
        name: 'Sports Daily',
        username: 'sportsdaily',
        avatar: 'https://ui-avatars.com/api/?name=Sports+Daily&background=f91880&color=fff',
        following: [],
        followers: []
    }
];

let tweets = JSON.parse(localStorage.getItem('tweets')) || [
    {
        id: 1,
        userId: 2,
        text: 'Just launched something amazing! 🚀 Excited to share it with the world. #Innovation #Technology',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 1245,
        retweets: 342,
        comments: 89,
        likedBy: [],
        retweetedBy: []
    },
    {
        id: 2,
        userId: 3,
        text: 'Breaking: New breakthrough in AI technology promises to revolutionize web development. Read more: #AI #WebDev',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: 856,
        retweets: 234,
        comments: 45,
        likedBy: [],
        retweetedBy: []
    },
    {
        id: 3,
        userId: 4,
        text: 'Championship finals tonight! Who are you rooting for? 🏆⚽ #Sports #Championship2026',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: 2341,
        retweets: 678,
        comments: 234,
        likedBy: [],
        retweetedBy: []
    }
];

let comments = JSON.parse(localStorage.getItem('comments')) || [];
let currentEditingTweetId = null;

// Save to localStorage
function saveData() {
    localStorage.setItem('tweets', JSON.stringify(tweets));
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageName + 'Page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (pageName === 'home') {
        loadTweets();
    } else if (pageName === 'profile') {
        loadProfile();
    }
}

function showProfile() {
    showPage('profile');
    loadProfile();
}

function focusTweetInput() {
    document.getElementById('tweetInput').focus();
    showPage('home');
}

// Tweet Creation
function createTweet() {
    const input = document.getElementById('tweetInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Please enter a tweet!');
        return;
    }
    
    const newTweet = {
        id: Date.now(),
        userId: currentUser.id,
        text: text,
        timestamp: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        comments: 0,
        likedBy: [],
        retweetedBy: []
    };
    
    tweets.unshift(newTweet);
    saveData();
    
    input.value = '';
    loadTweets();
    loadProfile();
    
    showNotification('Tweet posted successfully!');
}

// Load Tweets
function loadTweets() {
    const feed = document.getElementById('tweetsFeed');
    
    if (tweets.length === 0) {
        feed.innerHTML = '<p class="empty-state">No tweets yet. Be the first to tweet!</p>';
        return;
    }
    
    feed.innerHTML = tweets.map(tweet => {
        const user = tweet.userId === currentUser.id ? currentUser : users.find(u => u.id === tweet.userId) || currentUser;
        const time = formatTime(tweet.timestamp);
        const isLiked = tweet.likedBy.includes(currentUser.id);
        
        return `
            <div class="tweet" data-tweet-id="${tweet.id}">
                <img src="${user.avatar}" alt="${user.name}" class="tweet-avatar">
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="name">${user.name}</span>
                        <span class="username">@${user.username}</span>
                        <span class="time">· ${time}</span>
                    </div>
                    <div class="tweet-text">${escapeHtml(tweet.text)}</div>
                    <div class="tweet-actions-bar">
                        <button class="tweet-action comment" onclick="showComments(${tweet.id})">
                            <i class="far fa-comment"></i>
                            <span>${tweet.comments}</span>
                        </button>
                        <button class="tweet-action retweet" onclick="retweet(${tweet.id})">
                            <i class="fas fa-retweet"></i>
                            <span>${tweet.retweets}</span>
                        </button>
                        <button class="tweet-action like ${isLiked ? 'liked' : ''}" onclick="likeTweet(${tweet.id})">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${tweet.likes}</span>
                        </button>
                        <div class="tweet-action share">
                            <i class="fas fa-share"></i>
                        </div>
                        ${tweet.userId === currentUser.id ? `
                            <button class="tweet-action" onclick="editTweet(${tweet.id})">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="tweet-action" onclick="deleteTweet(${tweet.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Like Tweet
function likeTweet(tweetId) {
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;
    
    const index = tweet.likedBy.indexOf(currentUser.id);
    if (index > -1) {
        tweet.likedBy.splice(index, 1);
        tweet.likes--;
    } else {
        tweet.likedBy.push(currentUser.id);
        tweet.likes++;
    }
    
    saveData();
    loadTweets();
}

// Retweet
function retweet(tweetId) {
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;
    
    const index = tweet.retweetedBy.indexOf(currentUser.id);
    if (index > -1) {
        tweet.retweetedBy.splice(index, 1);
        tweet.retweets--;
    } else {
        tweet.retweetedBy.push(currentUser.id);
        tweet.retweets++;
    }
    
    saveData();
    loadTweets();
    showNotification('Retweeted!');
}

// Edit Tweet
function editTweet(tweetId) {
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;
    
    currentEditingTweetId = tweetId;
    document.getElementById('editTweetInput').value = tweet.text;
    document.getElementById('editTweetModal').classList.add('active');
}

// Save Edited Tweet
function saveEditedTweet() {
    const newText = document.getElementById('editTweetInput').value.trim();
    if (!newText) {
        alert('Tweet cannot be empty!');
        return;
    }
    
    const tweet = tweets.find(t => t.id === currentEditingTweetId);
    if (tweet) {
        tweet.text = newText;
        saveData();
        loadTweets();
        closeEditModal();
        showNotification('Tweet updated!');
    }
}

// Delete Tweet
function deleteTweet(tweetId) {
    if (confirm('Are you sure you want to delete this tweet?')) {
        tweets = tweets.filter(t => t.id !== tweetId);
        saveData();
        loadTweets();
        loadProfile();
        showNotification('Tweet deleted!');
    }
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editTweetModal').classList.remove('active');
    currentEditingTweetId = null;
}

// Show Comments
function showComments(tweetId) {
    const tweetComments = comments.filter(c => c.tweetId === tweetId);
    const tweet = tweets.find(t => t.id === tweetId);
    
    if (tweetComments.length === 0) {
        alert('No comments yet. Be the first to comment!');
        return;
    }
    
    const commentText = tweetComments.map(c => {
        const user = users.find(u => u.id === c.userId) || currentUser;
        return `${user.name}: ${c.text}`;
    }).join('\n\n');
    
    alert(`Comments:\n\n${commentText}`);
}

// Profile Functions
function loadProfile() {
    document.getElementById('profileDisplayName').textContent = currentUser.name;
    document.getElementById('profileUsernameDisplay').textContent = `@${currentUser.username}`;
    document.getElementById('profileBio').textContent = currentUser.bio;
    document.getElementById('followersCount').textContent = currentUser.followers.length;
    document.getElementById('followingCount').textContent = currentUser.following.length;
    
    // Load user's tweets
    const userTweets = tweets.filter(t => t.userId === currentUser.id);
    const profileTweetsContainer = document.getElementById('profileTweets');
    
    if (userTweets.length === 0) {
        profileTweetsContainer.innerHTML = '<p class="empty-state">No tweets yet</p>';
        return;
    }
    
    profileTweetsContainer.innerHTML = userTweets.map(tweet => {
        const time = formatTime(tweet.timestamp);
        return `
            <div class="tweet">
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="name">${currentUser.name}</span>
                        <span class="username">@${currentUser.username}</span>
                        <span class="time">· ${time}</span>
                    </div>
                    <div class="tweet-text">${escapeHtml(tweet.text)}</div>
                    <div class="tweet-actions-bar">
                        <span class="tweet-action"><i class="far fa-comment"></i> ${tweet.comments}</span>
                        <span class="tweet-action"><i class="fas fa-retweet"></i> ${tweet.retweets}</span>
                        <span class="tweet-action"><i class="far fa-heart"></i> ${tweet.likes}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Edit Profile
function editProfile() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editBio').value = currentUser.bio;
    document.getElementById('editProfileModal').classList.add('active');
}

// Save Profile
document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    currentUser.name = document.getElementById('editName').value;
    currentUser.bio = document.getElementById('editBio').value;
    
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=1da1f2&color=fff`;
    
    closeProfileModal();
    loadProfile();
    showNotification('Profile updated!');
});

function closeProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

// Follow/Unfollow User
function toggleFollow(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const index = currentUser.following.indexOf(userId);
    if (index > -1) {
        currentUser.following.splice(index, 1);
        const followerIndex = user.followers.indexOf(currentUser.id);
        if (followerIndex > -1) {
            user.followers.splice(followerIndex, 1);
        }
        showNotification(`Unfollowed ${user.name}`);
    } else {
        currentUser.following.push(userId);
        user.followers.push(currentUser.id);
        showNotification(`Following ${user.name}`);
    }
    
    loadSuggestedUsers();
}

// Load Suggested Users
function loadSuggestedUsers() {
    const container = document.getElementById('suggestedUsers');
    if (!container) return;
    
    const notFollowing = users.filter(u => !currentUser.following.includes(u.id) && u.id !== currentUser.id);
    
    if (notFollowing.length === 0) {
        container.innerHTML = '<p class="empty-state">No suggestions</p>';
        return;
    }
    
    container.innerHTML = notFollowing.map(user => `
        <div class="suggested-user">
            <img src="${user.avatar}" alt="${user.name}">
            <div class="suggested-user-info">
                <div class="name">${user.name}</div>
                <div class="username">@${user.username}</div>
            </div>
            <button class="follow-btn" onclick="toggleFollow(${user.id})">Follow</button>
        </div>
    `).join('');
}

// Utility Functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1da1f2;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enter key to tweet
document.getElementById('tweetInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        createTweet();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTweets();
    loadSuggestedUsers();
    
    // Set current user info
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserHandle').textContent = `@${currentUser.username}`;
});