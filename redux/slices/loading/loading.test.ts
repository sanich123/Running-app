import loadingReducer, { finishLoading, resetLoading, startLoading } from './loading';

describe('loading slice', () => {
  it('keeps the global loading flag active until all tracked operations finish', () => {
    let state = loadingReducer(undefined, startLoading());
    state = loadingReducer(state, startLoading());
    expect(state).toEqual({ isLoading: true, activeOperations: 2 });

    state = loadingReducer(state, finishLoading());
    expect(state).toEqual({ isLoading: true, activeOperations: 1 });

    state = loadingReducer(state, finishLoading());
    expect(state).toEqual({ isLoading: false, activeOperations: 0 });
  });

  it('does not go below zero and can reset after an interrupted operation', () => {
    let state = loadingReducer(undefined, finishLoading());
    expect(state).toEqual({ isLoading: false, activeOperations: 0 });

    state = loadingReducer(state, startLoading());
    state = loadingReducer(state, resetLoading());
    expect(state).toEqual({ isLoading: false, activeOperations: 0 });
  });
});
