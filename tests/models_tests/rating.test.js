const Rating = require('../../models/rating');
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../../expressError');

const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll,
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

describe('Rating', () => {
    describe('addRating', () => {
        it('should add a rating to a space', async () => {
          const result = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
          expect(result).toHaveProperty('rating', 4);
          expect(result).toHaveProperty('title', 'Space1');
        });

    it('should throw NotFoundError if username not found', async () => {
      const user = 'testuser';
      await expect(Rating.addRating({username: user, spaceTitle: 'Space1', rating: 1})).rejects.toThrow(NotFoundError)
    });
    it('should throw NotFoundError if spaceTitle not found', async () => {
        const space = 'testspace';
        await expect(Rating.addRating({username: 'user1', spaceTitle: space, rating: 1})).rejects.toThrow(NotFoundError)
    });

    it('should throw BadRequestError if user has already rated the space', async () => {
        await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
        await expect(Rating.addRating({username: 'user1', spaceTitle: 'Space1', rating: 2})).rejects.toThrow(BadRequestError);
    });
  });

  describe('getRating', () => {
    it('should return a single rating by username and title', async () => {
        await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
        const username = 'user1';
        const spaceTitle = 'Space1';

        const rating = await Rating.getRating(username, spaceTitle);


        expect(rating).not.toBeNull();
        expect(rating).toHaveProperty('rating');
        expect(rating).toHaveProperty('username', username);
        expect(rating).toHaveProperty('title', spaceTitle);
    });

    it('should throw NotFoundError if rating not found', async () => {
      // Provide a non-existent username and space title
      const nonExistentUsername = 'nonexistentuser';
      const nonExistentSpaceTitle = 'Nonexistent Space';

      // Call the getRating method with the non-existent username and space title
      // and expect it to throw a NotFoundError
      await expect(Rating.getRating(nonExistentUsername, nonExistentSpaceTitle)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getRatingById', () => {
    it('should return a single rating by ratingId', async () => {
        const result = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
        const ratingId = result.rating_id

        const rating = await Rating.getRatingById(ratingId);

        expect(rating).not.toBeNull();
        expect(rating).toHaveProperty('rating');
        expect(rating).toHaveProperty('username');
        expect(rating).toHaveProperty('title');
    });

    it('should throw NotFoundError if rating not found', async () => {
      const nonExistentRatingId = 0;
      await expect(Rating.getRatingById(nonExistentRatingId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAvgSpaceRating', () => {
    describe('getAvgSpaceRating', () => {
        it('should return the average rating for a space', async () => {
            await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
            const spaceTitle = 'Space1';
            const avgRating = await Rating.getAvgSpaceRating(spaceTitle);
            expect(avgRating.rating).toBe('4.00');
        });
    
        it('should throw NotFoundError if space not found', async () => {
          const nonExistentSpaceTitle = 'NonExistentSpace';
          await expect(Rating.getAvgSpaceRating(nonExistentSpaceTitle)).rejects.toThrow(NotFoundError);
        });
      });
  });
    describe('sortByAvgRating', () => {
        it('should sort spaces by average rating in ascending order', async () => {
            await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
            await Rating.addRating({ username: 'user1', spaceTitle: 'Space2', rating: 2 });
          const sortedSpaces = await Rating.sortByAvgRating('ASC');
          expect(sortedSpaces.length).toBeGreaterThan(0);
          for (let i = 0; i < sortedSpaces.length - 1; i++) {
            const currentRating = parseFloat(sortedSpaces[i].avg_rating);
            const nextRating = parseFloat(sortedSpaces[i + 1].avg_rating);
            expect(currentRating).toBeLessThanOrEqual(nextRating);
          }
        });
    
        it('should sort spaces by average rating in descending order', async () => {
            await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 4 });
            await Rating.addRating({ username: 'user1', spaceTitle: 'Space2', rating: 2 });
          const sortedSpaces = await Rating.sortByAvgRating('DESC');
          expect(sortedSpaces.length).toBeGreaterThan(0);
          for (let i = 0; i < sortedSpaces.length - 1; i++) {
            const currentRating = parseFloat(sortedSpaces[i].avg_rating);
            const nextRating = parseFloat(sortedSpaces[i + 1].avg_rating);
            expect(currentRating).toBeGreaterThanOrEqual(nextRating);
          }
        });
  });

  describe('updateRating', () => {
    it('should update a rating by ratingId', async () => {
        const { rating_id } = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 3 });
        const user = { userId: testUserIds[0] };
        console.log(user)
        const updatedRating = await Rating.updateRating(rating_id, user, 5);
        expect(updatedRating.rating).toEqual(5);
      });
    
      it('should throw NotFoundError if rating not found', async () => {
        const nonExistingRatingId = 0;
        await expect(Rating.updateRating(nonExistingRatingId, { rating: 5 })).rejects.toThrow(NotFoundError);
      });
    
      it('should throw UnauthorizedError if user is not authorized to update the rating', async () => {
        const { rating_id } = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 3 });
        const unauthorizedUser = { userId: 0 };
        await expect(Rating.updateRating(rating_id, { rating: 5 }, unauthorizedUser)).rejects.toThrow(UnauthorizedError);
      });
    })

    describe('delete', () => {
        it('should delete a rating by ratingId', async () => {
          const { rating_id } = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 3 });
          const deletedRating = await Rating.delete(rating_id, testUserIds[0], false);
          expect(deletedRating).toBe('Rating successfully deleted.');
        });
      
        it('should throw NotFoundError if rating not found', async () => {
          const nonExistingRatingId = 0;
          await expect(Rating.delete(nonExistingRatingId, testUserIds[0], false)).rejects.toThrow(NotFoundError);
        });
      
        it('should throw UnauthorizedError if user is not authorized to delete the rating', async () => {
          const { rating_id } = await Rating.addRating({ username: 'user1', spaceTitle: 'Space1', rating: 3 });
          const unauthorizedUser = { userId: testUserIds[1] };
          await expect(Rating.delete(rating_id, unauthorizedUser, false)).rejects.toThrow(UnauthorizedError);
        });
    });
});
