import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! User';
  }
  getHello2(): string {
    return 'Hello World! Admin';
  }
}
