# SnapBet API Specification Document

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Base Configuration](#base-configuration)
4. [User Endpoints](#user-endpoints)
5. [Betting Endpoints](#betting-endpoints)
6. [Feed & Posts Endpoints](#feed--posts-endpoints)
7. [Tail/Fade Endpoints](#tailfade-endpoints)
8. [Messaging Endpoints](#messaging-endpoints)
9. [Game Data Endpoints](#game-data-endpoints)
10. [Storage Endpoints](#storage-endpoints)
11. [Notification Endpoints](#notification-endpoints)
12. [Search & Discovery Endpoints](#search--discovery-endpoints)
13. [Edge Functions](#edge-functions)
14. [Real-time Subscriptions](#real-time-subscriptions)
15. [Error Responses](#error-responses)
16. [Rate Limiting](#rate-limiting)

## API Overview

### API Architecture
- **Type**: RESTful API with Real-time WebSocket subscriptions
- **Protocol**: HTTPS only
- **Format**: JSON request/response
- **Authentication**: Bearer token (JWT)
- **Versioning**: URL-based (currently v1)

### Base URLs
```
Production: https://[project-id].supabase.co
Staging:    https://[project-id-staging].supabase.co
Local:      http://localhost:54321
```

## Authentication

### OAuth Endpoints

#### Initiate OAuth Flow
```http
POST /auth/v1/authorize
```

**Request:**
```json
{
  "provider": "google" | "twitter"
}
```

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### OAuth Callback
```http
GET /auth/v1/callback
```

**Query Parameters:**
- `code`: Authorization code from provider
- `state`: State parameter for CSRF protection

**Response:**
- Redirects to app with session token

#### Get Current Session
```http
GET /auth/v1/session
```

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_value",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "avatar_url": "https://...",
      "full_name": "John Doe"
    }
  }
}
```

#### Refresh Token
```http
POST /auth/v1/token?grant_type=refresh_token
```

**Request:**
```json
{
  "refresh_token": "refresh_token_value"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "new_refresh_token"
}
```

#### Sign Out
```http
POST /auth/v1/logout
```

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```
204 No Content
```

## Base Configuration

### Common Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
```

### Pagination
All list endpoints support pagination:
```
?limit=20&offset=0
```

### Filtering
PostgREST operators:
```
?column=eq.value    # Equals
?column=neq.value   # Not equals
?column=gt.value    # Greater than
?column=gte.value   # Greater than or equal
?column=lt.value    # Less than
?column=lte.value   # Less than or equal
?column=like.pattern # LIKE
?column=in.(1,2,3)  # IN
?column=is.null     # IS NULL
```

### Ordering
```
?order=created_at.desc
?order=created_at.asc,name.desc
```

### Field Selection
```
?select=id,username,avatar_url
?select=*,posts(id,caption)
```

## User Endpoints

### Get Current User
```http
GET /rest/v1/users?id=eq.{auth.uid()}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "mikebets",
  "email": "mike@example.com",
  "avatar_url": "https://...",
  "favorite_team": "LAL",
  "created_at": "2024-06-23T10:00:00Z",
  "bankroll": {
    "balance": 1420,
    "total_wagered": 5000,
    "total_won": 2420
  },
  "stats": {
    "wins": 45,
    "losses": 35,
    "roi": 0.125,
    "win_rate": 0.563,
    "current_streak": 3
  }
}
```

### Update User Profile
```http
PATCH /rest/v1/users?id=eq.{user_id}
```

**Request:**
```json
{
  "display_name": "Mike the Sharp",
  "bio": "Lakers fan, dog lover 🏀",
  "favorite_team": "LAL"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "mikebets",
  "display_name": "Mike the Sharp",
  "bio": "Lakers fan, dog lover 🏀",
  "favorite_team": "LAL",
  "updated_at": "2024-06-23T10:05:00Z"
}
```

### Get User by Username
```http
GET /rest/v1/users?username=eq.{username}&select=*,bankroll(*),stats:user_stats(*)
```

**Response:**
```json
{
  "id": "uuid",
  "username": "mikebets",
  "avatar_url": "https://...",
  "created_at": "2024-06-23T10:00:00Z",
  "bankroll": {
    "balance": 1420
  },
  "stats": {
    "wins": 45,
    "losses": 35,
    "roi": 0.125
  }
}
```

### Follow User
```http
POST /rest/v1/follows
```

**Request:**
```json
{
  "follower_id": "{current_user_id}",
  "following_id": "{target_user_id}"
}
```

**Response:**
```json
{
  "follower_id": "uuid",
  "following_id": "uuid",
  "created_at": "2024-06-23T10:00:00Z"
}
```

### Unfollow User
```http
DELETE /rest/v1/follows?follower_id=eq.{current_user_id}&following_id=eq.{target_user_id}
```

**Response:**
```
204 No Content
```

### Get Followers
```http
GET /rest/v1/follows?following_id=eq.{user_id}&select=follower:follower_id(id,username,avatar_url)
```

**Response:**
```json
[
  {
    "follower": {
      "id": "uuid",
      "username": "sarah_wins",
      "avatar_url": "https://..."
    }
  }
]
```

### Get Following
```http
GET /rest/v1/follows?follower_id=eq.{user_id}&select=following:following_id(id,username,avatar_url)
```

### Search Users
```http
GET /rest/v1/users?username=like.*{query}*&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "mikebets",
    "avatar_url": "https://...",
    "stats": {
      "wins": 45,
      "losses": 35
    }
  }
]
```

## Betting Endpoints

### Place Bet
```http
POST /rest/v1/rpc/place_bet
```

**Request:**
```json
{
  "game_id": "nba_lal_bos_2024",
  "bet_type": "spread",
  "bet_details": {
    "team": "LAL",
    "line": -5.5,
    "odds": -110
  },
  "stake": 50
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "game_id": "nba_lal_bos_2024",
  "bet_type": "spread",
  "bet_details": {
    "team": "LAL",
    "line": -5.5,
    "odds": -110
  },
  "stake": 50,
  "potential_win": 45.45,
  "status": "pending",
  "created_at": "2024-06-23T10:00:00Z"
}
```

### Get User Bets
```http
GET /rest/v1/bets?user_id=eq.{user_id}&order=created_at.desc
```

**Query Parameters:**
- `status=eq.pending` - Active bets only
- `status=in.(won,lost)` - Settled bets
- `created_at=gte.2024-06-23` - Date filtering

**Response:**
```json
[
  {
    "id": "uuid",
    "game_id": "nba_lal_bos_2024",
    "bet_type": "spread",
    "bet_details": {
      "team": "LAL",
      "line": -5.5,
      "odds": -110
    },
    "stake": 50,
    "potential_win": 45.45,
    "status": "pending",
    "created_at": "2024-06-23T10:00:00Z",
    "game": {
      "home_team": "Lakers",
      "away_team": "Celtics",
      "commence_time": "2024-06-23T19:30:00Z"
    }
  }
]
```

### Get Bet Details
```http
GET /rest/v1/bets?id=eq.{bet_id}&select=*,user:user_id(*),game:games(*)
```

### Get Bankroll
```http
GET /rest/v1/bankrolls?user_id=eq.{user_id}
```

**Response:**
```json
{
  "user_id": "uuid",
  "balance": 1420,
  "total_wagered": 5000,
  "total_won": 2420,
  "season_high": 2500,
  "last_reset": "2024-06-20T10:00:00Z"
}
```

### Reset Bankroll
```http
POST /rest/v1/rpc/reset_bankroll
```

**Request:**
```json
{
  "user_id": "{current_user_id}"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "balance": 1000,
  "total_wagered": 0,
  "total_won": 0,
  "last_reset": "2024-06-23T10:00:00Z"
}
```

## Feed & Posts Endpoints

### Get Feed
```http
GET /rest/v1/rpc/get_feed
```

**Request:**
```json
{
  "user_id": "{current_user_id}",
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "media_url": "https://...",
    "media_type": "photo",
    "caption": "LeBron cooking tonight 🔥",
    "bet_id": "uuid",
    "expires_at": "2024-06-23T19:30:00Z",
    "created_at": "2024-06-23T10:00:00Z",
    "user": {
      "id": "uuid",
      "username": "mikebets",
      "avatar_url": "https://..."
    },
    "bet": {
      "bet_type": "spread",
      "bet_details": {
        "team": "LAL",
        "line": -5.5,
        "odds": -110
      },
      "stake": 50
    },
    "tail_count": 8,
    "fade_count": 2,
    "user_action": null
  }
]
```

### Create Post
```http
POST /rest/v1/posts
```

**Request:**
```json
{
  "media_url": "https://storage.../posts/123.jpg",
  "media_type": "photo",
  "caption": "Let's ride with the Lakers tonight",
  "bet_id": "uuid",
  "expires_at": "2024-06-23T19:30:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "media_url": "https://storage.../posts/123.jpg",
  "media_type": "photo",
  "caption": "Let's ride with the Lakers tonight",
  "bet_id": "uuid",
  "expires_at": "2024-06-23T19:30:00Z",
  "created_at": "2024-06-23T10:00:00Z"
}
```

### Delete Post
```http
DELETE /rest/v1/posts?id=eq.{post_id}
```

**Response:**
```
204 No Content
```

### Get Stories
```http
GET /rest/v1/stories?user_id=in.({following_ids})&expires_at=gt.now()&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "media_url": "https://...",
    "media_type": "photo",
    "caption": "5-0 this week 🔥",
    "expires_at": "2024-06-24T10:00:00Z",
    "created_at": "2024-06-23T10:00:00Z",
    "user": {
      "username": "mikebets",
      "avatar_url": "https://..."
    },
    "viewed": false
  }
]
```

### Create Story
```http
POST /rest/v1/stories
```

**Request:**
```json
{
  "media_url": "https://storage.../stories/123.jpg",
  "media_type": "photo",
  "caption": "Perfect day! 5-0 🎯",
  "expires_at": "2024-06-24T10:00:00Z"
}
```

### Mark Story Viewed
```http
POST /rest/v1/story_views
```

**Request:**
```json
{
  "story_id": "uuid",
  "viewer_id": "{current_user_id}"
}
```

### React to Post
```http
POST /rest/v1/reactions
```

**Request:**
```json
{
  "post_id": "uuid",
  "user_id": "{current_user_id}",
  "emoji": "🔥"
}
```

**Response:**
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "emoji": "🔥",
  "created_at": "2024-06-23T10:00:00Z"
}
```

## Tail/Fade Endpoints

### Tail a Pick
```http
POST /rest/v1/rpc/tail_pick
```

**Request:**
```json
{
  "post_id": "uuid",
  "user_id": "{current_user_id}"
}
```

**Response:**
```json
{
  "action_id": "uuid",
  "bet_id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "action_type": "tail",
  "created_at": "2024-06-23T10:00:00Z",
  "bet": {
    "id": "uuid",
    "stake": 50,
    "potential_win": 45.45,
    "status": "pending"
  }
}
```

### Fade a Pick
```http
POST /rest/v1/rpc/fade_pick
```

**Request:**
```json
{
  "post_id": "uuid",
  "user_id": "{current_user_id}"
}
```

**Response:**
```json
{
  "action_id": "uuid",
  "bet_id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "action_type": "fade",
  "created_at": "2024-06-23T10:00:00Z",
  "bet": {
    "id": "uuid",
    "bet_type": "spread",
    "bet_details": {
      "team": "BOS",
      "line": 5.5,
      "odds": -110
    },
    "stake": 50,
    "potential_win": 45.45,
    "status": "pending"
  }
}
```

### Get Pick Actions
```http
GET /rest/v1/pick_actions?post_id=eq.{post_id}&select=*,user:user_id(username,avatar_url)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "action_type": "tail",
    "resulting_bet_id": "uuid",
    "created_at": "2024-06-23T10:00:00Z",
    "user": {
      "username": "sarah_wins",
      "avatar_url": "https://..."
    }
  }
]
```

## Messaging Endpoints

### Get Chats
```http
GET /rest/v1/chats?select=*,members:chat_members(user:user_id(*)),last_message:messages(content,created_at)&order=last_message.created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "dm",
    "name": null,
    "created_at": "2024-06-23T10:00:00Z",
    "members": [
      {
        "user": {
          "id": "uuid",
          "username": "sarah_wins",
          "avatar_url": "https://..."
        }
      }
    ],
    "last_message": {
      "content": "Tailing your pick!",
      "created_at": "2024-06-23T10:00:00Z"
    },
    "unread_count": 2
  }
]
```

### Create Chat
```http
POST /rest/v1/chats
```

**Request (DM):**
```json
{
  "type": "dm",
  "member_ids": ["user_id_1", "user_id_2"]
}
```

**Request (Group):**
```json
{
  "type": "group",
  "name": "NBA Degens 🏀",
  "member_ids": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "group",
  "name": "NBA Degens 🏀",
  "created_by": "uuid",
  "created_at": "2024-06-23T10:00:00Z"
}
```

### Get Messages
```http
GET /rest/v1/messages?chat_id=eq.{chat_id}&order=created_at.desc&limit=50
```

**Response:**
```json
[
  {
    "id": "uuid",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "content": "Who's on Lakers tonight?",
    "media_url": null,
    "media_type": null,
    "bet_id": null,
    "expires_at": "2024-06-24T10:00:00Z",
    "created_at": "2024-06-23T10:00:00Z",
    "sender": {
      "username": "mikebets",
      "avatar_url": "https://..."
    }
  }
]
```

### Send Message
```http
POST /rest/v1/messages
```

**Request (Text):**
```json
{
  "chat_id": "uuid",
  "sender_id": "{current_user_id}",
  "content": "I'm tailing that Lakers pick!",
  "expires_at": "2024-06-24T10:00:00Z"
}
```

**Request (Media):**
```json
{
  "chat_id": "uuid",
  "sender_id": "{current_user_id}",
  "media_url": "https://storage.../messages/123.jpg",
  "media_type": "photo",
  "expires_at": "2024-06-24T10:00:00Z"
}
```

**Request (Bet Share):**
```json
{
  "chat_id": "uuid",
  "sender_id": "{current_user_id}",
  "content": "Check out this pick",
  "bet_id": "uuid",
  "expires_at": "2024-06-24T10:00:00Z"
}
```

### Mark Messages Read
```http
POST /rest/v1/message_reads
```

**Request:**
```json
{
  "message_ids": ["uuid1", "uuid2", "uuid3"],
  "user_id": "{current_user_id}"
}
```

### Add Chat Members
```http
POST /rest/v1/chat_members
```

**Request:**
```json
{
  "chat_id": "uuid",
  "user_ids": ["uuid1", "uuid2"]
}
```

### Leave Chat
```http
DELETE /rest/v1/chat_members?chat_id=eq.{chat_id}&user_id=eq.{current_user_id}
```

## Game Data Endpoints

### Get Games
```http
GET /rest/v1/games?sport=eq.{sport}&commence_time=gte.{today}&order=commence_time.asc
```

**Query Parameters:**
- `sport=eq.nba` - Filter by sport
- `status=eq.scheduled` - Only upcoming games
- `commence_time=gte.2024-06-23` - Games after date

**Response:**
```json
[
  {
    "id": "nba_lal_bos_2024",
    "sport": "nba",
    "home_team": "Los Angeles Lakers",
    "away_team": "Boston Celtics",
    "commence_time": "2024-06-23T19:30:00Z",
    "odds_data": {
      "spread": {
        "line": -5.5,
        "home_odds": -110,
        "away_odds": -110
      },
      "total": {
        "line": 220.5,
        "over_odds": -110,
        "under_odds": -110
      },
      "moneyline": {
        "home_odds": -200,
        "away_odds": +170
      }
    },
    "status": "scheduled",
    "last_updated": "2024-06-23T09:00:00Z"
  }
]
```

### Get Single Game
```http
GET /rest/v1/games?id=eq.{game_id}
```

### Get Games with Bets
```http
GET /rest/v1/games?id=in.({game_ids})&select=*,bets(*)
```

## Storage Endpoints

### Upload Media
```http
POST /storage/v1/object/media/{path}
```

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: image/jpeg
```

**Path Examples:**
- `posts/{user_id}/{timestamp}.jpg`
- `messages/{chat_id}/{timestamp}.jpg`
- `avatars/{user_id}.jpg`

**Request Body:**
Binary image data

**Response:**
```json
{
  "Key": "media/posts/user123/1624983847.jpg"
}
```

### Get Public URL
```http
GET /storage/v1/object/public/media/{path}
```

**Response:**
Direct file download

### Generate Signed URL
```http
POST /storage/v1/object/sign/media/{path}
```

**Request:**
```json
{
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "signedURL": "https://...?token=..."
}
```

### Delete Media
```http
DELETE /storage/v1/object/media/{path}
```

**Response:**
```
204 No Content
```

## Notification Endpoints

### Get Notifications
```http
GET /rest/v1/notifications?user_id=eq.{current_user_id}&order=created_at.desc&limit=20
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "tail",
    "data": {
      "actor_id": "uuid",
      "actor_username": "sarah_wins",
      "post_id": "uuid",
      "bet_amount": 50
    },
    "read": false,
    "created_at": "2024-06-23T10:00:00Z"
  }
]
```

### Mark Notifications Read
```http
PATCH /rest/v1/notifications?user_id=eq.{current_user_id}&id=in.({notification_ids})
```

**Request:**
```json
{
  "read": true
}
```

### Mark All Read
```http
PATCH /rest/v1/notifications?user_id=eq.{current_user_id}&read=eq.false
```

**Request:**
```json
{
  "read": true
}
```

### Get Unread Count
```http
GET /rest/v1/rpc/get_unread_notifications_count
```

**Request:**
```json
{
  "user_id": "{current_user_id}"
}
```

**Response:**
```json
{
  "count": 3
}
```

## Search & Discovery Endpoints

### Search Everything
```http
POST /rest/v1/rpc/search_all
```

**Request:**
```json
{
  "query": "lakers",
  "limit": 10
}
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "lakersfan23",
      "avatar_url": "https://..."
    }
  ],
  "picks": [
    {
      "id": "uuid",
      "caption": "Lakers -5.5 lock it in",
      "user": {
        "username": "mikebets"
      }
    }
  ],
  "games": [
    {
      "id": "nba_lal_bos_2024",
      "home_team": "Los Angeles Lakers",
      "away_team": "Boston Celtics"
    }
  ]
}
```

### Get Trending Picks
```http
GET /rest/v1/rpc/get_trending_picks
```

**Request:**
```json
{
  "timeframe": "24h",
  "limit": 10
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "tail_count": 45,
    "fade_count": 12,
    "success_rate": 0.73,
    "post": {
      "caption": "Lakers covering easy",
      "user": {
        "username": "mikebets"
      }
    },
    "bet": {
      "bet_type": "spread",
      "bet_details": {
        "team": "LAL",
        "line": -5.5
      }
    }
  }
]
```

### Get Hot Bettors
```http
GET /rest/v1/rpc/get_hot_bettors
```

**Request:**
```json
{
  "timeframe": "7d",
  "min_bets": 10,
  "limit": 10
}
```

**Response:**
```json
[
  {
    "user_id": "uuid",
    "username": "sarah_wins",
    "avatar_url": "https://...",
    "wins": 18,
    "losses": 5,
    "roi": 0.42,
    "profit": 850,
    "hot_streak": 5
  }
]
```

### Discover Groups
```http
GET /rest/v1/chats?type=eq.group&select=*,member_count:chat_members(count)&order=member_count.desc
```

## Edge Functions

### Place Bet Function
```http
POST /functions/v1/place-bet
```

**Request:**
```json
{
  "game_id": "nba_lal_bos_2024",
  "bet_type": "spread",
  "bet_details": {
    "team": "LAL",
    "line": -5.5,
    "odds": -110
  },
  "stake": 50,
  "share_to_feed": true
}
```

**Response:**
```json
{
  "bet": {
    "id": "uuid",
    "status": "pending"
  },
  "post": {
    "id": "uuid",
    "created": true
  },
  "bankroll": {
    "previous": 1470,
    "current": 1420
  }
}
```

### Tail Pick Function
```http
POST /functions/v1/tail-pick
```

**Request:**
```json
{
  "post_id": "uuid"
}
```

**Response:**
```json
{
  "action": {
    "id": "uuid",
    "type": "tail"
  },
  "bet": {
    "id": "uuid",
    "stake": 50,
    "potential_win": 45.45
  },
  "notification_sent": true
}
```

### Settle Bets Function
```http
POST /functions/v1/settle-bets
```

**Request:**
```json
{
  "game_id": "nba_lal_bos_2024",
  "scores": {
    "home": 115,
    "away": 108
  }
}
```

**Response:**
```json
{
  "settled_count": 47,
  "winners": 28,
  "losers": 19,
  "pushes": 0,
  "total_paid_out": 1260,
  "notifications_sent": 47
}
```

### Cleanup Expired Function
```http
POST /functions/v1/cleanup-expired
```

**Response:**
```json
{
  "posts_deleted": 143,
  "stories_deleted": 67,
  "messages_deleted": 892,
  "media_cleaned": 234
}
```

## Real-time Subscriptions

### Subscribe to Feed
```javascript
const channel = supabase
  .channel('feed-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'user_id=in.(uuid1,uuid2,uuid3)'
    },
    (payload) => {
      console.log('New post:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Chat
```javascript
const channel = supabase
  .channel(`chat-${chatId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Notifications
```javascript
const channel = supabase
  .channel(`notifications-${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Bet Updates
```javascript
const channel = supabase
  .channel(`bets-${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'bets',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      if (payload.new.status !== payload.old.status) {
        console.log('Bet settled:', payload.new);
      }
    }
  )
  .subscribe();
```

### Presence (Online Status)
```javascript
const channel = supabase.channel('online-users');

// Track user presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        username: username,
        online_at: new Date().toISOString(),
      });
    }
  });
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "insufficient_funds",
    "message": "Insufficient funds to place bet",
    "details": {
      "required": 50,
      "available": 30
    }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Duplicate resource (username taken) |
| `validation_error` | 422 | Invalid request data |
| `insufficient_funds` | 422 | Not enough bankroll |
| `bet_expired` | 422 | Game already started |
| `already_tailed` | 422 | Already tailed this pick |
| `rate_limit` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

### Validation Error Example
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "stake": ["Must be at least $5"],
        "bet_type": ["Must be one of: spread, total, moneyline"]
      }
    }
  }
}
```

## Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1624983847
```

### Rate Limits by Endpoint Type
| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 | 15 minutes |
| Read (GET) | 100 | 1 minute |
| Write (POST/PUT/PATCH) | 50 | 1 minute |
| Delete | 20 | 1 minute |
| Search | 30 | 1 minute |
| Media Upload | 10 | 1 minute |

### Rate Limit Response
```http
429 Too Many Requests
```

```json
{
  "error": {
    "code": "rate_limit",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "window": "1m",
      "retry_after": 42
    }
  }
}
```

### Bypassing Rate Limits
Authenticated users have higher limits:
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Premium (future): 1000 requests/minute

---

This comprehensive API specification covers all endpoints, request/response formats, real-time subscriptions, and error handling for the SnapBet application.