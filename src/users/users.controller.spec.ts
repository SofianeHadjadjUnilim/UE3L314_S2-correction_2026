import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it("retourne un tableau d'utilisateurs - 200", async () => {
      const expectedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Smith' },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(expectedUsers);

      const result = await usersController.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('renvoie une erreur si le service echoue - 500', async () => {
      jest.spyOn(usersService, 'findAll').mockRejectedValue(new Error('Service error'));

      await expect(usersController.findAll()).rejects.toThrow('Service error');
    });
  });

  describe('create', () => {
    it('retourne un utilisateur cree - 201', async () => {
      const dto = { firstname: 'John', lastname: 'Doe' };
      const expectedUser = { id: 1, ...dto };

      jest.spyOn(usersService, 'create').mockResolvedValue(expectedUser);

      const result = await usersController.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedUser);
    });

    it('renvoie une erreur en cas de probleme - 500', async () => {
      const dto = { firstname: 'John', lastname: 'Doe' };

      jest.spyOn(usersService, 'create').mockRejectedValue(new Error('Service error'));

      await expect(usersController.create(dto)).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('retourne un utilisateur par son id - 200', async () => {
      const expectedUser = { id: 1, firstname: 'John', lastname: 'Doe' };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);

      const result = await usersController.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUser);
    });

    it('lance NotFoundException si utilisateur inexistant - 404', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(
        new NotFoundException('User with ID 999 not found')
      );

      await expect(usersController.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(usersController.findOne('999')).rejects.toThrow('User with ID 999 not found');
      expect(usersService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('retourne un utilisateur mis a jour - 200', async () => {
      const dto = { firstname: 'Jane', lastname: 'Doe' };
      const updatedUser = { id: 1, ...dto };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await usersController.update('1', dto);

      expect(usersService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedUser);
    });

    it('renvoie une erreur si mise a jour echoue - 500', async () => {
      const dto = { firstname: 'Jane', lastname: 'Doe' };

      jest.spyOn(usersService, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(usersController.update('1', dto)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('supprime un utilisateur - 200', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);

      await usersController.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('renvoie une erreur si suppression echoue - 500', async () => {
      jest.spyOn(usersService, 'remove').mockRejectedValue(new Error('Delete failed'));

      await expect(usersController.remove('1')).rejects.toThrow('Delete failed');
    });
  });
});
