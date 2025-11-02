import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  root(): String {
    return "API rodando";
  }
}
