import { HttpResponse } from 'msw';

export const addUser = () => HttpResponse.json([1, 2, 3], { status: 201 });
