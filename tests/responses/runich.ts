/**
 * Responses captured from the seeded Runich server on 2026-08-06.
 * The deliberately public runich.mock.runner.* account contains no personal data.
 */
export const MOCK_SERVER_IDS = {
  activityId: 'bad3520c-c795-439c-ae9b-474625b4b200',
  commentId: '9e7665d9-b345-464a-a7fc-3c72d3dc9580',
  userId: '7866608d-c521-419a-9885-ce999f72fdeb',
} as const;

export const MOCK_SERVER_PROFILE = {
  createdAt: '2026-08-05T13:08:20.371Z',
  name: 'Eliud',
  userId: MOCK_SERVER_IDS.userId,
  bio: 'runich-mock-v5',
  birthday: '1985-01-01T00:00:00.000Z',
  city: 'Kaptagat',
  gender: 'MALE',
  profilePhoto: 'https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=256',
  sport: 'RUNNING',
  surname: 'Kipchoge',
  updatedAt: null,
  weight: '87',
  email: 'runich.mock.runner.01@runich.app',
  language: 'en',
  emailNotifications: false,
  profilePhotoBlurhash: null,
  id: '70b1b296-e364-4638-87a6-516d537d5cdc',
} as const;

export const MOCK_SERVER_ACTIVITY = {
  description: 'Mock activity for the Runich feed',
  title: 'Tempo run #2',
  date: '2026-08-04T13:08:22.785Z',
  sport: 'walk',
  id: MOCK_SERVER_IDS.activityId,
  userId: MOCK_SERVER_IDS.userId,
  media: [
    {
      url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
      thumbnail: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    },
  ],
  mapPhotoUrl: null,
  mapPhotoUrlBlurhash: null,
  duration: 3062,
  distance: 28325,
  elevationGain: 0,
  visibility: 'public',
  emotion: 'HAPPY',
  kilometresSplit: [],
  profile: {
    surname: 'Kipchoge',
    name: 'Eliud',
    profilePhoto: MOCK_SERVER_PROFILE.profilePhoto,
    profilePhotoBlurhash: null,
    emailNotifications: false,
    user: { email: MOCK_SERVER_PROFILE.email },
  },
  _count: { comments: 3, likes: 0 },
} as const;

export const MOCK_SERVER_ACTIVITIES = {
  activities: [MOCK_SERVER_ACTIVITY],
  currentUserProfile: MOCK_SERVER_PROFILE,
  hasMore: false,
  nextCursor: null,
  isLastPage: true,
} as const;

export const MOCK_SERVER_LOCATIONS = {
  locations: [
    {
      coords: {
        speed: 1.1493074893951416,
        heading: 224.1822509765625,
        accuracy: 16.68600082397461,
        altitude: 242.1000061035156,
        latitude: 55.6078903,
        longitude: 37.5361731,
        altitudeAccuracy: 9.290717124938965,
      },
      mocked: false,
      timestamp: 1785927343370,
    },
    {
      coords: {
        speed: 1.1188817024230957,
        heading: 216.95738220214844,
        accuracy: 16.461000442504883,
        altitude: 242.1000061035156,
        latitude: 55.6078601,
        longitude: 37.5361265,
        altitudeAccuracy: 9.290717124938965,
      },
      mocked: false,
      timestamp: 1785927346373,
    },
  ],
  kilometresSplit: [],
} as const;

export const MOCK_SERVER_LIKES = [
  {
    date: '2026-08-05T13:08:22.844Z',
    authorId: 'e49287d2-ec4e-4164-8dc2-02165218f849',
    id: '78304ff0-afc3-42a0-964e-cb2e1c0ca71e',
    activityId: MOCK_SERVER_IDS.activityId,
    profileId: '0d48a025-063e-436e-ac40-687bbed379a6',
    profile: {
      name: 'Haile',
      surname: 'Gebrselassie',
      city: 'Addis Ababa',
      userId: 'e49287d2-ec4e-4164-8dc2-02165218f849',
      profilePhoto: 'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?w=256',
      profilePhotoBlurhash: null,
    },
  },
] as const;

export const MOCK_SERVER_COMMENTS = {
  comments: [
    {
      date: '2026-08-05T13:08:23.127Z',
      comment: 'Вдохновляет на свою пробежку.',
      authorId: 'e49287d2-ec4e-4164-8dc2-02165218f849',
      activityId: MOCK_SERVER_IDS.activityId,
      profileId: '0d48a025-063e-436e-ac40-687bbed379a6',
      id: MOCK_SERVER_IDS.commentId,
      profile: {
        surname: 'Gebrselassie',
        name: 'Haile',
        profilePhoto: 'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?w=256',
        profilePhotoBlurhash: null,
        emailNotifications: false,
        user: { email: 'runich.mock.runner.04@runich.app' },
      },
      commentLike: [{ authorId: 'e49287d2-ec4e-4164-8dc2-02165218f849', id: '3de0b97b-1803-4f98-b6db-dc183ffff7f7' }],
    },
  ],
  hasMore: false,
  nextCursor: null,
} as const;

export const MOCK_SERVER_COMMENT_LIKES = MOCK_SERVER_COMMENTS.comments[0].commentLike;

export const MOCK_SERVER_FOLLOWINGS = [
  {
    createdAt: '2026-08-05T13:15:28.217Z',
    updatedAt: '2026-08-05T13:15:28.217Z',
    userId: MOCK_SERVER_IDS.userId,
    friendId: '839cf445-c240-4a39-8f45-9d98bd8b3830',
    profileId: 'e079ca3e-3537-4d0c-8733-1622997d50ab',
    id: 'a0f3c9f0-f528-4891-924d-aec7b71888ba',
    profile: {
      surname: 'Bekele',
      name: 'Kenenisa',
      city: 'Addis Ababa',
      profilePhoto: 'https://images.pexels.com/photos/3763879/pexels-photo-3763879.jpeg?w=256',
      profilePhotoBlurhash: null,
    },
  },
] as const;

export const MOCK_SERVER_FOLLOWERS = [
  {
    createdAt: '2026-08-05T13:15:28.217Z',
    userId: '839cf445-c240-4a39-8f45-9d98bd8b3830',
    friendId: MOCK_SERVER_IDS.userId,
    profileId: 'e079ca3e-3537-4d0c-8733-1622997d50ab',
    id: 'f4a4f6dc-40a6-4b04-a4fd-b2d71c40f2a8',
    updatedAt: '2026-08-05T13:15:28.217Z',
    user: { profile: MOCK_SERVER_FOLLOWINGS[0].profile },
  },
] as const;

export const MOCK_SERVER_PHOTOS = {
  media: MOCK_SERVER_ACTIVITY.media,
  hasMore: false,
  nextCursor: null,
  isLastPage: true,
} as const;

export const MOCK_SERVER_USERS = {
  items: [MOCK_SERVER_PROFILE],
  hasMore: false,
  nextCursor: null,
} as const;

export const MOCK_SERVER_STATISTICS = {
  all: { totalDuration: 30165, totalDistance: 73478, totalItems: 5 },
  week: { totalDuration: 50387, totalDistance: 138360, totalItems: 7 },
  month: {
    activities: [
      {
        duration: 3062,
        distance: 28325,
        speed: 10,
        date: '2026-08-04T13:08:22.785Z',
        id: MOCK_SERVER_IDS.activityId,
        sport: 'walk',
      },
    ],
    activitiesReducedBySport: {
      all: { totalDuration: 30165, totalDistance: 73478, totalItems: 5 },
      run: { totalDuration: 11587, totalDistance: 20741, totalItems: 2 },
      walk: { totalDuration: 12378, totalDistance: 45764, totalItems: 2 },
      ride: { totalDuration: 6200, totalDistance: 6973, totalItems: 1 },
    },
  },
  year: {
    2026: {
      all: { 7: { totalDuration: 0.008379166666666667, totalDistance: 73.478, totalItems: 5 } },
    },
    isUserHasActivities: true,
  },
} as const;

export const MOCK_SERVER_ERROR = { message: 'Mock server error', statusCode: 500 } as const;
