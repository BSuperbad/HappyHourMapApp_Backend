const Comment = require('../../models/comment');
const { UnauthorizedError, NotFoundError } = require('../../expressError');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll,
    testCommentIds,
    testUserIds
 } = require('./_testCommon');

beforeAll(async () => {
  await commonBeforeAll();
});

beforeEach(async () => {
  await commonBeforeEach();
});

afterEach(async () => {
  await commonAfterEach();
});

afterAll(async () => {
  await commonAfterAll();
});

describe('Comment', () => {
  describe('addComment', () => {
    it('should add a comment to a space', async () => {
      const username = 'user1';
      const spaceTitle = 'Space1';
      const comment = 'Test comment';
      const result = await Comment.addComment({ username, spaceTitle, comment });
      expect(result).toHaveProperty('title', spaceTitle);
      expect(result).toHaveProperty('description');
      expect(result.comment).toContain(comment);
      expect(result).toHaveProperty('comment_date');
      expect(result).toHaveProperty('username', username);
    });

    it('should throw NotFoundError if user not found', async () => {
      const username = 'nonexistentuser';
      const spaceTitle = 'Space1';
      const comment = 'Test comment';
      await expect(Comment.addComment({ username, spaceTitle, comment })).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if space not found', async () => {
      const username = 'user1';
      const spaceTitle = 'NonexistentSpace';
      const comment = 'Test comment';
      await expect(Comment.addComment({ username, spaceTitle, comment })).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllForSpace', () => {
    it('should return all comments for a space', async () => {
      const title = 'Space1';
      const result = await Comment.getAllForSpace(title);
      expect(result).toHaveProperty('title', title);
      expect(result).toHaveProperty('comments');
      expect(result.comments).toHaveLength(2);
    });

    it('should throw NotFoundError if space not found', async () => {
      const title = 'NonexistentSpace';
      await expect(Comment.getAllForSpace(title)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllForUser', () => {
    it('should return all comments for a user', async () => {
      const username = 'user1';
      const result = await Comment.getAllForUser(username);
      expect(result).toHaveProperty('user', username);
      expect(result).toHaveProperty('comments');
      expect(result.comments).toHaveLength(2);
    });

    it('should throw NotFoundError if user not found', async () => {
      const username = 'NonexistentUser';
      await expect(Comment.getAllForUser(username)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getComment', () => {
    it('should return a single comment by comment_id', async () => {
        const expectedId = testCommentIds[0];
        const result = await Comment.getComment(expectedId);
        expect(result.comment).toBe('Test comment 1');
        expect(result.comment_id).toBe(expectedId);
    });

    it('should throw NotFoundError if comment not found', async () => {
      const comment_id = 0;
      await expect(Comment.getComment(comment_id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const comment_id = testCommentIds[0];
      const user = { user_id: testUserIds[0], isAdmin: false };
      const updatedComment = 'Updated test comment';
      const result = await Comment.updateComment(comment_id, user, updatedComment);
      expect(result).toHaveProperty('comment', updatedComment);
    });

    it('should throw NotFoundError if comment not found', async () => {
      const comment_id = 0;
      const user = { user_id: testUserIds[0], isAdmin: false };
      const updatedComment = 'Updated test comment';
      await expect(Comment.updateComment(comment_id, user, updatedComment)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
        // 2nd user's comment
      const comment_id = testCommentIds[2];
    //   1st user who is not authorized to update other user's comment
      const user = { user_id: testUserIds[0], isAdmin: false };
      const updatedComment = 'Updated test comment';
      await expect(Comment.updateComment(comment_id, user, updatedComment)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      const commentId = testCommentIds[0];
      const userId = testUserIds[0];
      const isAdmin = false;
      const result = await Comment.delete(commentId, userId, isAdmin);
      expect(result).toEqual('Comment successfully deleted.');
    });

    it('should throw NotFoundError if comment not found', async () => {
      const commentId = 0;
      const userId = testUserIds[0];
      const isAdmin = false;
      await expect(Comment.delete(commentId, userId, isAdmin)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
        const comment_id = testCommentIds[2];
        const user = { user_id: testUserIds[0], isAdmin: false };
        const updatedComment = 'Updated test comment';
        await expect(Comment.updateComment(comment_id, user, updatedComment)).rejects.toThrow(UnauthorizedError);
    });
});
});
