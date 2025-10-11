import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("")
export class AppController {
  constructor(private readonly appServices: AppService) {}

  @Get()
  root(): String {
    return this.appServices.root();
  }
}
