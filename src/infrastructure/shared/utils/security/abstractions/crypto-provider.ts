import { CipherProvider } from './cipher-provider';
import { HashProvider } from './hash-provider';

export interface CryptoProvider extends HashProvider, CipherProvider {}
