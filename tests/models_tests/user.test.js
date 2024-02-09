const User = require('../../models/user');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require("../../config.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../../expressError');

const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll,
    testCategoryIds,
    testLocationIds,
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

  describe('User', ()=>{
    describe('register & authenticate', ()=>{
        it('should register and authenticate a user with correct credentials', async () => {
            const username = 'testuser';
            const password = 'password';
            await User.register({
              username: username,
              password: password,
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              isAdmin: false
            });
        
            const user = await User.authenticate(username, password);
        
            expect(user.username).toBe('testuser');
            expect(user.firstName).toBe('Test');
            expect(user.lastName).toBe('User');
            expect(user.email).toBe('test@example.com');
            expect(user.isAdmin).toBe(false);
          });
          it('should throw UnauthorizedError with incorrect credentials', async () => {
            const username = 'user1';
            const password = 'wrongpassword';
            
            await expect(User.authenticate(username, password)).rejects.toThrowError(UnauthorizedError);
          });
          it('should throw BadRequestError when registering with a duplicate username', async () => {
            const newUser = {
              username: 'user1',
              password: 'password123',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              isAdmin: false
            };
            await expect(User.register(newUser)).rejects.toThrowError(BadRequestError);
          });
        });

    describe('findAll', ()=>{
        it('should return all users from the database', async () => {
            const users = await User.findAll();
            expect(users.length).toBe(testUserIds.length);
            users.forEach((user, index) => {
              expect(user.user_id).toBe(testUserIds[index]);

            });
        });
    describe('get', () => {
        it('should user information when logged-in user is admin', async () => {
              const currentUser = 'user2';
              const requestedUser = 'user1'; 
              const user = await User.get(requestedUser, currentUser, true);
              expect(user.username).toBe(requestedUser);

        });
        it('should return user information when requested user is the same as logged-in user', async () => {
              const currentUser = 'user1';
              const requestedUser = 'user1'; 
              const user = await User.get(requestedUser, currentUser, false);
              expect(user.username).toBe(requestedUser);
        }); 
        it('should throw UnauthorizedError when user is not admin and requested user is different', async () => {
              const currentUser = 'user1';
              const requestedUser = 'user2';
              await expect(User.get(requestedUser, currentUser, false)).rejects.toThrowError(UnauthorizedError);
        });
        it('should throw NotFoundError when requested user does not exist', async () => {
              const nonExistingUser = 'nonExistingUser';
              const currentUser = 'user2';
              await expect(User.get(nonExistingUser, currentUser, true)).rejects.toThrowError(NotFoundError);
            });
        });
    });
    describe('update', () => {
        it('should successfully updates user information', async () => {
          const newData = {
            firstName: 'UpdatedFirstName',
            lastName: 'UpdatedLastName',
            email: 'updated@example.com'
          };
          const updatedUser = await User.update('user1', { username: 'user1' }, newData);
    
          expect(updatedUser).toEqual({
            username: 'user1',
            firstName: 'UpdatedFirstName',
            lastName: 'UpdatedLastName',
            email: 'updated@example.com',
            isAdmin: false
          });
        });
        it('should throw UnauthorizedError if not admin or logged-in user', async () => {
          const newData = {
            firstName: 'UpdatedFirstName',
            lastName: 'UpdatedLastName',
            email: 'updated@example.com'
          };
          await expect(User.update('user2', { username: 'user1' }, newData))
            .rejects.toThrowError(UnauthorizedError);
        });
        it('should throw NotFoundError if user not found', async () => {
          const newData = {
            firstName: 'UpdatedFirstName',
            lastName: 'UpdatedLastName',
            email: 'updated@example.com'
          };
          await expect(User.update('nonExistingUser', { username: 'user2', isAdmin: true }, newData))
            .rejects.toThrowError(NotFoundError);
        });
      });
    describe('remove', () => {
        it('should successfully remove user if admin', async () => {
          const usernameToRemove = 'user1';
          const loggedInUser = {
            username: 'user2',
            isAdmin: true
          };
          await expect(User.remove(usernameToRemove, loggedInUser)).resolves.toEqual({
            username: usernameToRemove
          });
        });
    
        it('should successfully remove own user account', async () => {
          const usernameToRemove = 'user1';
          const loggedInUser = {
            username: usernameToRemove,
            isAdmin: false
          };
          await expect(User.remove(usernameToRemove, loggedInUser)).resolves.toEqual({
            username: usernameToRemove
          });
        });
    
        it('should throw UnauthorizedError if not admin or owner of the account', async () => {
          const usernameToRemove = 'user2';
          const loggedInUser = {
            username: 'user1',
            isAdmin: false
          };
    
          await expect(User.remove(usernameToRemove, loggedInUser)).rejects.toThrowError(UnauthorizedError);
        });
    
        it('should throw NotFoundError if user to remove does not exist', async () => {
          const usernameToRemove = 'nonExistingUser';
          const loggedInUser = {
            username: 'adminUser',
            isAdmin: true
          };
    
          await expect(User.remove(usernameToRemove, loggedInUser)).rejects.toThrowError(NotFoundError);
        });
    });
    describe('likeSpace', ()=>{
        it('should successfully like a space for the logged-in user', async () => {
            const username = 'user1';
            const spaceTitle = 'Space1';
            const loggedInUser = 'user1';
            const expectedLikedSpace = {
              title: 'Space1',
              description: 'Description1',
              image_url: 'http://image1.img',
              address: 'Address1',
              est_year: 2022
            };
            const likedSpace = await User.likeSpace(username, spaceTitle, loggedInUser);
        
            expect(likedSpace).toEqual(expectedLikedSpace);
        });
        it('should throw UnauthorizedError if attempting to like a space for another user', async () => {
            const username = 'user2';
            const spaceTitle = 'Space1';
            const loggedInUser = 'user1';
            await expect(User.likeSpace(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(UnauthorizedError);
        });
        it('should throw NotFoundError if user does not exist', async () => {
            const username = 'nonExistingUser';
            const spaceTitle = 'Space11';
            const loggedInUser = 'nonExistingUser';
            await expect(User.likeSpace(username, spaceTitle, loggedInUser))
              .rejects.toThrowError(NotFoundError);
        });
        it('should throw NotFoundError if space does not exist', async () => {
            const username = 'user1';
            const spaceTitle = 'NonExistingSpace';
            const loggedInUser = 'user1';
            await expect(User.likeSpace(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(NotFoundError);
        });
        it('should throw BadRequestError if space is already liked by the user', async () => {
            await User.likeSpace('user1', 'Space1', 'user1');
            const username = 'user1';
            const spaceTitle = 'Space1';
            const loggedInUser = 'user1';
            await expect(User.likeSpace(username, spaceTitle, loggedInUser))
              .rejects.toThrowError(BadRequestError);
        });
    });
    describe('unlikeSpace', () => {
        it('should successfully unlike a space for the logged-in user', async () => {
          const username = 'user1';
          const spaceTitle = 'Space1';
          const loggedInUser = { username: 'user1' };
          const unlikedSpace = await User.unlikeSpace(username, spaceTitle, loggedInUser);

          expect(unlikedSpace).toBeUndefined();
        });
      
        test('should throw UnauthorizedError if attempting to unlike a space for another user', async () => {
          const username = 'user2';
          const spaceTitle = 'Space1';
          const loggedInUser = { username: 'user1' };
      
          await expect(User.unlikeSpace(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(UnauthorizedError);
        });
      
        test('should throw NotFoundError if user does not exist', async () => {
          const username = 'nonExistingUser';
          const spaceTitle = 'Space1';
          const loggedInUser = { username: 'nonExistingUser' };
          await expect(User.unlikeSpace(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(NotFoundError);
        });
      
        test('should throw NotFoundError if space does not exist', async () => {
          const username = 'user1';
          const spaceTitle = 'NonExistingSpace';
          const loggedInUser = { username: 'user1' };
           await expect(User.unlikeSpace(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(NotFoundError);
        });
    });
    describe('getUserLikedSpaces', () => {
        it('should return liked spaces for a valid user', async () => {
          const username = 'user1';
          const likedSpace1 = await User.likeSpace(username, 'Space1', 'user1');
          const likedSpace2 = await User.likeSpace(username, 'Space2', 'user1');
          const likedSpaces = await User.getUserLikedSpaces(username);

          expect(Array.isArray(likedSpaces)).toBe(true);
          expect(likedSpaces.length).toBeGreaterThan(0);
    
          const firstLikedSpace = likedSpaces[0];
          expect(firstLikedSpace.title).toBe('Space1');
          const secondeLikedSpace = likedSpaces[1];
          expect(secondeLikedSpace.title).toBe('Space2');
        });
      
        it('should throw NotFoundError for an invalid user', async () => {
          const username = 'invaliduser';
          await expect(User.getUserLikedSpaces(username)).rejects.toThrowError(NotFoundError);
        });
    });
    describe('markAsVisited', () => {
        it('should mark a space as visited for the logged-in user', async () => {
          const username = 'user1';
          const spaceTitle = 'Space1';
          const loggedInUser = 'user1';
          const markedSpace = await User.markAsVisited(username, spaceTitle, loggedInUser);
          expect(markedSpace).toHaveProperty('title', spaceTitle);
          expect(markedSpace).toHaveProperty('visit_date');
        });
      
        it('should throw UnauthorizedError if attempting to mark space as visited for another user', async () => {
          const username = 'user2';
          const spaceTitle = 'Space1';
          const loggedInUser = 'user1';
          await expect(User.markAsVisited(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(UnauthorizedError);
        });
      
        it('should throw NotFoundError if user does not exist', async () => {
          const username = 'nonexistentuser';
          const spaceTitle = 'Space1';
          const loggedInUser = 'nonexistentuser';
          await expect(User.markAsVisited(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(NotFoundError);
        });
      
        it('should throw NotFoundError if space does not exist', async () => {
          const username = 'user1';
          const spaceTitle = 'Nonexistent Space';
          const loggedInUser = 'user1';
          await expect(User.markAsVisited(username, spaceTitle, loggedInUser))
            .rejects.toThrowError(NotFoundError);
        });
      });
      describe('getVisits', ()=>{
        test('should return visited spaces for the given user', async () => {
            const username = 'user1';
            await User.markAsVisited(username, 'Space1', 'user1');
            await User.markAsVisited(username, 'Space2', 'user1');
            const visitedSpaces = await User.getVisits(username);
        
            expect(visitedSpaces).toEqual([
              {
                title: 'Space1',
                description: 'Description1',
                image_url: 'http://image1.img',
                address: 'Address1',
                est_year: 2022,
                visit_date: expect.any(Date),
                cat_type: expect.any(String),
                city: expect.any(String),
                neighborhood: expect.any(String)
              },
              {
                title: 'Space2',
                description: 'Description2',
                image_url: 'http://image2.img',
                address: 'Address2',
                est_year: 2023,
                visit_date: expect.any(Date),
                cat_type: expect.any(String),
                city: expect.any(String),
                neighborhood: expect.any(String)
              }
            ]);
          });
        
          test('should throw NotFoundError if user not found', async () => {
            const username = 'nonExistingUser';
            await expect(User.getVisits(username)).rejects.toThrowError(NotFoundError);
          });
      })


  })