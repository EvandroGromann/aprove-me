import { User } from '../../../../src/modules/users/entities/user.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    user.id = 'test-id';
    user.login = 'testuser';
    user.password = 'hashedpassword';
    user.deletedAt = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user).toBeDefined();
    expect(user.id).toBe('test-id');
    expect(user.login).toBe('testuser');
    expect(user.password).toBe('hashedpassword');
    expect(user.deletedAt).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow deletedAt to be set', () => {
    const user = new User();
    const deletedDate = new Date();
    user.deletedAt = deletedDate;

    expect(user.deletedAt).toBe(deletedDate);
  });
});
