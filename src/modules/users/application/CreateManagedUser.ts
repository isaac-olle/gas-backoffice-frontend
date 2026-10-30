import { CreateManagedUserInput, IManagedUserRepository } from '../domain/IManagedUserRepository';
export function createManagedUser(
  managedUserRepository: IManagedUserRepository,
  input: CreateManagedUserInput,
): Promise<void> {
  return managedUserRepository.createManagedUser(input);
}
