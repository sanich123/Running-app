import { LANGUAGES } from '@const/enums';

export const EMPTY_STATE_COPY = {
  [LANGUAGES.english]: {
    activities: {
      title: 'No activities yet',
      message: 'Your next adventure will appear here. Lace up and make the first move!',
    },
    users: {
      title: 'No runners found',
      message: 'Try another name or email — the search track may be just around the corner.',
    },
    followings: {
      title: 'Your following list is clear',
      message: 'Find a few people to follow and fill this track with inspiration.',
    },
    followers: { title: 'No followers yet', message: 'Share an activity — your future cheering squad is out there.' },
    likes: { title: 'No likes yet', message: 'This activity is waiting for its first high five.' },
    comments: { title: 'No comments yet', message: 'Be the first to leave a thought and start the conversation.' },
    photos: { title: 'No photos yet', message: 'Activity photos will show up here when you add them.' },
  },
  [LANGUAGES.russian]: {
    activities: {
      title: 'Активностей пока нет',
      message: 'Здесь появится ваше следующее приключение. Пора сделать первый шаг!',
    },
    users: {
      title: 'Никого не нашли',
      message: 'Попробуйте другое имя или почту — нужный человек может быть совсем рядом.',
    },
    followings: {
      title: 'Список отслеживаемых пуст',
      message: 'Найдите кого-нибудь и добавьте немного вдохновения в эту ленту.',
    },
    followers: {
      title: 'Отслеживающих пока нет',
      message: 'Поделитесь активностью — ваша группа поддержки обязательно найдётся.',
    },
    likes: { title: 'Лайков пока нет', message: 'Эта активность ждёт своего первого виртуального «дай пять».' },
    comments: { title: 'Комментариев пока нет', message: 'Оставьте первый комментарий и начните разговор.' },
    photos: { title: 'Фотографий пока нет', message: 'Фотографии активности появятся здесь после добавления.' },
  },
} as const;
