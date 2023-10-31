import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post(`https://runich-backend.onrender.com/activity/someUserId`, () => {
    return HttpResponse.json({
      data: 'its ok',
    });
  }),
];
