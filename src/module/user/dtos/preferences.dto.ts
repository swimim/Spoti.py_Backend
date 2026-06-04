import { IsBoolean, IsOptional } from "class-validator";


export class Preferences {
  @IsOptional()
  @IsBoolean()
  sirenNotification?: boolean;
  
  @IsOptional()
  @IsBoolean()
  toastNotification?: boolean;
}