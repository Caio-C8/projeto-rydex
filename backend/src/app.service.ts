import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  root(): String {
    return `
    <div style="display: flex; align-items: center; justify-content: center">
      <h1>API rodando</h1>
    </div>
    `;
  }
}
