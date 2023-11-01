import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post(`https://runich-backend.onrender.com/activity/someUserId`, () => {
    HttpResponse.json({
      data: 'its ok',
    });
  }),
  http.post('https://runich-backend.onrender.com/friend/someFriendId', () => {
    HttpResponse.json({
      data: 'ok',
    });
  }),
  http.get('https://runich-backend.onrender.com/profile/someUserId', () => {
    HttpResponse.json({
      data: {
        profilePhoto: 'somePhotoUrl',
      },
    });
  }),
];
