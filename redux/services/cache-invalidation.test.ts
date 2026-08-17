interface EndpointDefinition {
  invalidatesTags?: unknown;
}

interface EndpointBuilder {
  query: (definition: EndpointDefinition) => EndpointDefinition;
  mutation: (definition: EndpointDefinition) => EndpointDefinition;
  infiniteQuery: (definition: EndpointDefinition) => EndpointDefinition;
}

describe('RTK Query cache invalidation contracts', () => {
  it('declares invalidation for every cache-mutating endpoint', async () => {
    const endpointDefinitions: Record<string, EndpointDefinition> = {};
    const builder: EndpointBuilder = {
      query: (definition: EndpointDefinition) => definition,
      mutation: (definition: EndpointDefinition) => definition,
      infiniteQuery: (definition: EndpointDefinition) => definition,
    };

    jest.resetModules();
    jest.doMock('@R/runich-api/runich-api', () => ({
      runichApi: {
        injectEndpoints: ({
          endpoints,
        }: {
          endpoints: (builder: EndpointBuilder) => Record<string, EndpointDefinition>;
        }) => {
          const definitions = endpoints(builder);
          Object.assign(endpointDefinitions, definitions);
          return { endpoints: definitions };
        },
      },
    }));

    jest.isolateModules(() => {
      require('./activity/activity');
      require('./comments/comments');
      require('./followers/followers');
      require('./likes/likes');
      require('./profile/profile');
    });

    const invalidatingEndpoints = Object.entries(endpointDefinitions)
      .filter(([, definition]) => definition.invalidatesTags !== undefined)
      .map(([name]) => name)
      .sort();

    expect(invalidatingEndpoints).toEqual([
      'addActivityByUserId',
      'addFriend',
      'createProfileByUserId',
      'deleteActivityById',
      'deleteCommentByCommentId',
      'deleteFriend',
      'deleteLike',
      'deleteLikeToComment',
      'postCommentWithActivityId',
      'sendLike',
      'sendLikeToComment',
      'updateActivityInfo',
      'updateCommentByCommentId',
      'updateProfileByProfileId',
    ]);
    expect(invalidatingEndpoints).toHaveLength(14);

    for (const endpointName of invalidatingEndpoints) {
      expect(endpointDefinitions[endpointName].invalidatesTags).toBeDefined();
    }
  });
});
