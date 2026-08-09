import { HttpResponse } from 'msw';
import { MOCK_PROFILE } from '@T/mocks/mock-location';

export const getProfileSuccess = () => HttpResponse.json(MOCK_PROFILE);

export const getProfileFailure = () => HttpResponse.json({ message: 'bad request' }, { status: 401 });

export const getProfileWithoutPhoto = () => HttpResponse.json(null);
