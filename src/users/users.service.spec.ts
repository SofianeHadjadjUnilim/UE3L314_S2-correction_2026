import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it("retourne un tableau d'utilisateurs - 200", async () => {
      const expectedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Smith' },
      ];

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('renvoie une erreur si la base echoue - 500', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });


  describe('create', () => {
    it('retourne un utilisateur cree - 201', async () => {
      const dto = { firstname: 'John', lastname: 'Doe' };
      const expectedUser = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('renvoie une erreur en cas de probleme - 500', async () => {
      const dto = { firstname: 'John', lastname: 'Doe' };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(dto)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('retourne un utilisateur par son id - 200', async () => {
      const expectedUser = { id: 1, firstname: 'John', lastname: 'Doe' };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedUser);
    });

    it('lance NotFoundException si utilisateur inexistant - 404', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('User with ID 999 not found');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('update', () => {
    it('retourne un utilisateur mis a jour - 200', async () => {
      const dto = { firstname: 'Jane', lastname: 'Doe' };
      const updatedUser = { id: 1, ...dto };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, dto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedUser);
    });

    it('renvoie une erreur si mise a jour echoue - 500', async () => {
      const dto = { firstname: 'Jane', lastname: 'Doe' };

      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(service.update(1, dto)).rejects.toThrow('Update failed');
    });

    it('lance NotFoundException si utilisateur inexistant apres update - 404', async () => {
      const dto = { firstname: 'Jane', lastname: 'Doe' };

      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, dto)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('remove', () => {
    it('supprime un utilisateur - 200', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('renvoie une erreur si suppression echoue - 500', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(service.remove(1)).rejects.toThrow('Delete failed');
    });
  });
});
