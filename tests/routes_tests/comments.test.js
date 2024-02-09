const request = require('supertest');
const app = require('../../app');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, commonAfterAll, 
    u1Token, 
    adminToken
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('Comments Routes', () => {
describe('POST /comments/:username/spaces/:title', () => {
  it('should create a new comment', async () => {
    const newComment = { comment: 'This is a test comment' };

    const response = await request(app)
      .post(`/comments/user1/spaces/Space1`)
      .send(newComment)
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      comment: {
        comment_date: expect.any(String),
        comment_id: expect.any(Number),
        username: 'user1',
        title: 'Space1',
        description: 'Description1',
        comment: newComment.comment
      }
    });
  });
  it('should throw UnauthorizedError if current user is not user param', async () => {
    const newComment = { comment: 'This is a test comment' };

    const response = await request(app)
      .post(`/comments/user2/spaces/Space1`)
      .send(newComment)
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
        "error": 
        {"message": "Unauthorized, must be the current logged-in user",
         "status": 401
        }
    })
  });
  it('should throw NotFoundError if space not found', async () => {
    const newComment = { comment: 'This is a test comment' };

    const response = await request(app)
      .post(`/comments/user1/spaces/nonexistentSpace`)
      .send(newComment)
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": 
        {"message": "No such space: nonexistentSpace",
         "status": 404
        }
    })
  });
});

describe('GET /comments/spaces/:title', () => {
  it('should get all comments for a space', async () => {
    await request(app)
      .post(`/comments/user1/spaces/Space1`)
      .send({"comment": "what a cool space"})
      .set('Authorization', `Bearer ${u1Token}`);
    const response = await request(app)
      .get(`/comments/spaces/Space1`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('comments');
  });
  it('should throw NotFoundError if space not found', async () => {
    const response = await request(app)
      .get(`/comments/spaces/nonexistentSpace`);
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": 
        {"message": "No such space: nonexistentSpace",
         "status": 404
        }
    })
  });
});

describe('GET /comments/users/:username', () => {
  it('should get all comments for a user', async () => {
    await request(app)
      .post(`/comments/user1/spaces/Space1`)
      .send({"comment": "what a cool space"})
      .set('Authorization', `Bearer ${u1Token}`);
    const response = await request(app)
      .get('/comments/users/user1');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('comments');
  });
  it('should throw NotFoundError if space not found', async () => {
    const response = await request(app)
      .get(`/comments/users/nonexistentUser`);
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": 
        {"message": "No such user: nonexistentUser",
         "status": 404
        }
    })
  });
});

describe('GET /comments/:comment_id', () => {
  it('should get a single comment by comment_id', async () => {
    const newCommentResponse = await request(app)
      .post(`/comments/user1/spaces/Space1`)
      .send({"comment": "what a cool space"})
      .set('Authorization', `Bearer ${u1Token}`);
      const newComment = JSON.parse(newCommentResponse.text).comment;

    const response = await request(app)
      .get(`/comments/${newComment.comment_id}`)
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('comment');
  });
  it('should throw NotFoundError if comment not found', async () => {
    const response = await request(app)
    .get(`/comments/0`)
    .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": 
        {"message": "Comment not found!",
         "status": 404
        }
    })
  });
});

describe('PATCH /comments/:comment_id/edit', () => {
  it('should throw NotFoundError if comment not found', async () => {
    const response = await request(app)
    .patch(`/comments/0`)
    .send({"comment": "updated space"})
    .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(404);
  });
  it('should throw UnauthorizedError if unauthorized to edit', async () => {
    const commentResponse = await request(app)
      .post(`/comments/user2/spaces/Space1`)
      .send({"comment": "what a cool space"})
      .set('Authorization', `Bearer ${adminToken}`);
    const comment = JSON.parse(commentResponse.text).comment;
    const { comment_id } = comment;
    const updatedComment = { comment: 'Updated comment' };

    const response = await request(app)
      .patch(`/comments/${comment_id}/edit`)
      .send(updatedComment)
      .set('Authorization', `Bearer ${u1Token}`);
      console.log(response.body)
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized to update this comment.", 
            "status": 401
        }
    });
  });
});

describe('DELETE /comments/:comment_id', () => {
  it('should delete user1 comment by admin', async () => {
    const commentResponse = await request(app)
          .post(`/comments/user1/spaces/Space1`)
          .send({"comment": "what a cool space"})
          .set('Authorization', `Bearer ${u1Token}`);
        const comment = JSON.parse(commentResponse.text).comment;
    
        const { comment_id } = comment;
    const response = await request(app)
      .delete(`/comments/${comment_id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('deleted');
  });
  it('should throw NotFoundError if comment not found', async () => {
    const response = await request(app)
    .delete(`/comments/0`)
    .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(404);
  });
  
  });
});
